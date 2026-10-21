import "dotenv/config";
import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawn, execFileSync, type ChildProcess } from "node:child_process";
import postgres from "postgres";
import type { Dashboard } from "../src/types";

const original = process.env.DATABASE_URL!;
const database = "bayflow_test_" + randomUUID().replaceAll("-", "");
const url = new URL(original);
url.pathname = "/" + database;
process.env.DATABASE_URL = url.toString();
process.env.BETTER_AUTH_URL = "http://localhost:3101";
const base = process.env.BETTER_AUTH_URL;
const admin = postgres(original, { max: 1 });
let query: ReturnType<typeof postgres>;
let server: ChildProcess;
let output = "";
class Client {
  cookie = "";
  async request(path: string, body?: unknown) {
    const response = await fetch(base + "/api" + path, {
      method: body === undefined ? "GET" : "POST",
      headers: { Origin: base, "Content-Type": "application/json", Cookie: this.cookie },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    for (const cookie of response.headers.getSetCookie())
      this.cookie = cookie.split(";")[0];
    const data = await response.json();

    return { status: response.status, data };
  }
  async post(path: string, body: unknown = {}) {
    return this.request(path, body);
  }
  async dashboard(shop?: string) {
    const r = await this.request("/dashboard" + (shop ? "?shop=" + shop : ""));
    assert.equal(r.status, 200);

    return r.data as Dashboard;
  }
}
const clients = new Map<string, Client>();
async function login(name: string) {
  const existing = clients.get(name);
  if (existing) return existing;
  const client = new Client();
  let result;
  for (let attempt = 0; attempt < 3; attempt++) {
    result = await client.post("/auth/sign-in/email", {
      email: name + "@bayflow.demo",
      password: "BayflowDemo2026!",
    });
    if (result.status !== 429) break;
    await new Promise((r) => setTimeout(r, 11000));
  }
  assert.equal(result!.status, 200);
  clients.set(name, client);

  return client;
}
async function move(
  client: Client,
  id: string,
  target: string,
  extra: Record<string, unknown> = {},
) {
  const response = await client.post(`/bookings/${id}/transition`, { target, ...extra });
  assert.equal(response.status, 200, JSON.stringify(response.data));

  return response;
}
before(
  async () => {
    await admin.unsafe('create database "' + database + '"');
    query = postgres(url.toString(), { max: 4 });
    execFileSync(
      process.execPath,
      ["node_modules/tsx/dist/cli.mjs", "scripts/migrate.ts"],
      { env: process.env, stdio: "pipe" },
    );
    execFileSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/seed.ts"], {
      env: process.env,
      stdio: "pipe",
    });
    server = spawn(
      process.execPath,
      ["node_modules/next/dist/bin/next", "start", "--port", "3101"],
      { env: process.env, windowsHide: true },
    );
    server.stdout?.on("data", (b) => {
      output += b.toString();
    });
    server.stderr?.on("data", (b) => {
      output += b.toString();
    });
    for (let i = 0; i < 60; i++) {
      try {
        if ((await fetch(base + "/api/health")).ok) return;
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error("Test server failed: " + output);
  },
  { timeout: 60000 },
);
after(async () => {
  server?.kill();
  await query?.end();
  if (database.startsWith("bayflow_test_"))
    await admin.unsafe('drop database if exists "' + database + '" with (force)');
  await admin.end();
});
test("auth, protected reads, same-origin mutation and tenant isolation", async () => {
  const anonymous = new Client();
  assert.equal((await anonymous.request("/dashboard")).status, 401);
  const advisor = await login("advisor");
  const owner2 = await login("owner2");
  const data = await advisor.dashboard();
  const remote = await owner2.dashboard();
  assert.equal((await advisor.request("/dashboard?shop=" + remote.shop!.id)).status, 404);
  assert.equal(
    (
      await advisor.post(`/bookings/${remote.bookings[0].id}/transition`, {
        target: "CONFIRMED",
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await advisor.post(`/shops/${data.shop!.id}/members`, {
        name: "Bad",
        email: "bad@example.com",
        password: "LongPassword11",
        role: "QC",
      })
    ).status,
    403,
  );
  const response = await fetch(base + "/api/notifications/read", {
    method: "POST",
    headers: {
      Cookie: advisor.cookie,
      Origin: "https://attacker.example",
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  assert.equal(response.status, 403);
  const customer = await login("customer");
  assert.equal((await customer.request("/dashboard?shop=" + data.shop!.id)).status, 404);
});
test("full lifecycle: rejection, estimate revisions, partial receipts, allocation and repeated QC rework", async () => {
  const [sa, tech, parts, qc, customer, owner] = await Promise.all(
    ["advisor", "technician", "parts", "qc", "customer", "owner"].map(login),
  );
  const data = await sa.dashboard();
  const b = data.bookings.find((b) => b.reference === "BF-1001")!;
  const id = b.id;
  const techId = data.members.find((m) => m.role === "TECH")!.user_id;
  const partsId = data.members.find((m) => m.role === "PARTS")!.user_id;
  assert.equal(
    (await customer.post(`/bookings/${id}/transition`, { target: "CONFIRMED" })).status,
    403,
  );
  await move(sa, id, "CONFIRMED");
  await move(sa, id, "ASSIGNED", { technician_id: techId });
  await move(tech, id, "INSPECTING");
  const coil = data.inventory.find((p) => p.sku === "IGN-COIL")!;
  const oil = data.inventory.find((p) => p.sku === "ENG-OIL-1L")!;
  const items = [
    {
      kind: "PART",
      description: "Ignition coils",
      inventory_id: coil.id,
      quantity: 2,
      unit_price: 6500,
    },
    {
      kind: "PART",
      description: "Engine oil",
      inventory_id: oil.id,
      quantity: 4,
      unit_price: 1300,
    },
    {
      kind: "LABOUR",
      description: "Diagnosis and repair",
      quantity: 1,
      unit_price: 4000,
    },
  ];
  assert.equal((await tech.post(`/bookings/${id}/estimate`, { items })).data.revision, 1);
  await move(tech, id, "ESTIMATE_REVIEW");
  items[2].unit_price = 3500;
  assert.equal((await sa.post(`/bookings/${id}/estimate`, { items })).data.revision, 2);
  await move(sa, id, "AWAITING_CUSTOMER");
  assert.equal(
    (await owner.post(`/bookings/${id}/transition`, { target: "ESTIMATE_APPROVED" }))
      .status,
    403,
  );
  await move(customer, id, "ESTIMATE_REJECTED");
  await move(sa, id, "INSPECTING");
  assert.equal((await tech.post(`/bookings/${id}/estimate`, { items })).data.revision, 3);
  await move(tech, id, "ESTIMATE_REVIEW");
  await move(sa, id, "AWAITING_CUSTOMER");
  await move(customer, id, "ESTIMATE_APPROVED");
  await move(sa, id, "PARTS_PENDING", { parts_person_id: partsId });
  const po = await parts.post(`/bookings/${id}/purchase-orders`, {
    supplier: "Reliable Parts Lahore",
    items: [{ inventory_id: coil.id, quantity: 2 }],
  });
  assert.equal(po.status, 200);
  await move(parts, id, "PARTS_ORDERED");
  const [line] = await query`select * from purchase_items where po_id=${po.data.po_id}`;
  assert.equal(
    (
      await parts.post(`/purchase-orders/${po.data.po_id}/receive`, {
        quantities: { [line.id]: 1 },
      })
    ).data.status,
    "PARTIALLY_RECEIVED",
  );
  assert.equal(
    (await parts.post(`/bookings/${id}/transition`, { target: "PARTS_READY" })).status,
    409,
  );
  assert.equal(
    (
      await parts.post(`/purchase-orders/${po.data.po_id}/receive`, {
        quantities: { [line.id]: 1 },
      })
    ).data.status,
    "RECEIVED",
  );
  await move(parts, id, "PARTS_READY");
  const race = await Promise.all([
    parts.post(`/bookings/${id}/transition`, { target: "IN_REPAIR" }),
    parts.post(`/bookings/${id}/transition`, { target: "IN_REPAIR" }),
  ]);
  assert.deepEqual(race.map((r) => r.status).sort(), [200, 409]);
  const [stock] = await query`select quantity from inventory where id=${coil.id}`;
  assert.equal(stock.quantity, 0);
  assert.equal(
    (await customer.post(`/bookings/${id}/transition`, { target: "CANCELLED" })).status,
    409,
  );
  for (let loop = 0; loop < 2; loop++) {
    await move(tech, id, "QC_PENDING");
    const claims = await Promise.all([
      qc.post(`/bookings/${id}/transition`, { target: "QC_IN_PROGRESS" }),
      qc.post(`/bookings/${id}/transition`, { target: "QC_IN_PROGRESS" }),
    ]);
    assert.deepEqual(claims.map((r) => r.status).sort(), [200, 409]);
    assert.equal(
      (
        await qc.post(`/bookings/${id}/transition`, {
          target: "READY_FOR_PICKUP",
          qc_checks: { brakes: true, fluids: false, road_test: true },
        })
      ).status,
      409,
    );
    await move(qc, id, "IN_REPAIR", {
      qc_checks: { brakes: true, fluids: false, road_test: true },
      issue_title: "Oil leak " + loop,
      issue_description: "Replace seal and retest",
    });
  }
  await move(tech, id, "QC_PENDING");
  await move(qc, id, "QC_IN_PROGRESS");
  await move(qc, id, "READY_FOR_PICKUP", {
    qc_checks: { brakes: true, fluids: true, road_test: true },
    qc_notes: "All checks passed",
  });
  assert.equal(
    (await customer.post(`/bookings/${id}/transition`, { target: "COMPLETED" })).status,
    409,
  );
  assert.equal((await sa.post(`/bookings/${id}/ready-notice`)).status, 200);
  await move(customer, id, "COMPLETED");
  const [reports] =
    await query`select count(*)::int n from qc_reports where booking_id=${id}`;
  assert.equal(reports.n, 3);
  const [issues] =
    await query`select count(*)::int n from qc_issues where booking_id=${id} and resolved=true`;
  assert.equal(issues.n, 2);
  const techData = await tech.dashboard();
  assert.ok(techData.bookings.every((b) => b.technician_id === techId));
  const notices = await customer.request("/customer");
  assert.ok(
    notices.data.notifications.some(
      (n: { title: string }) => n.title === "Ready for pickup",
    ),
  );
});
test("customer account reuse and concurrent capacity reservation with cancellation", async () => {
  const customer = await login("customer");
  const owner = await login("owner");
  const data = await owner.dashboard();
  const shop = data.shop!;
  const date = new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10);
  const at = date + "T11:00:00+05:00";
  const body = {
    shop_id: shop.id,
    service_ids: [data.services[0].id],
    scheduled_at: at,
    name: "Ahmed Khan",
    email: "customer@bayflow.demo",
    plate: "TEST-123",
    make: "Honda",
    model: "Civic",
    year: 2016,
  };
  const results = await Promise.all([
    customer.post("/bookings", body),
    customer.post("/bookings", body),
    customer.post("/bookings", body),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 200, 409]);
  for (const r of results.filter((r) => r.status === 200))
    await move(customer, r.data.booking_id, "CANCELLED");
  const slots = await customer.request(`/shops/${shop.id}/slots?date=${date}`);
  assert.ok(
    slots.data.slots.some(
      (s: { at: string; remaining: number }) => s.at === at && s.remaining === 2,
    ),
  );
  const wrong = await new Client().post("/bookings", {
    ...body,
    password: "WrongPassword11",
  });
  assert.equal(wrong.status, 401);
  const users = await query`select id from users where email='customer@bayflow.demo'`;
  assert.equal(users.length, 1);
  const outOfHours = await customer.post("/bookings", {
    ...body,
    scheduled_at: date + "T02:00:00+05:00",
  });
  assert.equal(outOfHours.status, 422);
});
test("owner multi-shop setup, staff lifecycle, service edits and capacity guards", async () => {
  const owner = await login("owner");
  const d = await owner.dashboard();
  assert.equal(d.shops.length, 2);
  const r = await owner.post("/shops", {
    name: "Airport Road Garage",
    city: "Lahore",
    address: "123 Airport Road",
    phone: "03001234567",
  });
  assert.equal(r.status, 200);
  const shop = r.data.shop_id;
  assert.equal(
    (
      await owner.post(`/shops/${shop}/members`, {
        name: "Test Mechanic",
        email: "testmechanic@example.com",
        password: "StrongPassword11",
        role: "TECH",
      })
    ).status,
    200,
  );
  const scoped = await owner.dashboard(shop);
  const member = scoped.members[0];
  assert.equal(member.role, "TECH");
  assert.equal(
    (await owner.post(`/shops/${shop}/members/${member.user_id}/role`, { role: "QC" }))
      .status,
    200,
  );
  assert.equal(
    (
      await owner.post(`/shops/${shop}/members/${member.user_id}/toggle`, {
        active: false,
      })
    ).status,
    200,
  );
  const staff = new Client();
  await staff.post("/auth/sign-in/email", {
    email: "testmechanic@example.com",
    password: "StrongPassword11",
  });
  assert.equal((await staff.request("/dashboard?shop=" + shop)).status, 404);
  assert.equal(
    (
      await owner.post(`/shops/${shop}/services`, {
        name: "Diagnostics",
        minutes: 60,
        base_price: 2500,
      })
    ).status,
    200,
  );
  const service = (await owner.dashboard(shop)).services[0];
  assert.equal(
    (
      await owner.post(`/shops/${shop}/services/${service.id}/update`, {
        name: "Diagnostics",
        description: "Engine diagnostic scan",
        minutes: 90,
        base_price: 3000,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await owner.post(`/shops/${shop}/inventory`, {
        name: "Oil filter",
        sku: "ENG01",
        quantity: 5,
        unit_cost: 900,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await owner.post(`/shops/${shop}/schedule`, {
        hours_start: "09:00",
        hours_end: "17:00",
        slot_minutes: 60,
        capacity: 2,
      })
    ).status,
    200,
  );
});
test("public signup cannot inject privileged roles; owner registration is explicit", async () => {
  const client = new Client();
  const suffix = randomUUID().slice(0, 8);
  const response = await client.post("/auth/sign-up/email", {
    name: "Customer Test",
    email: `customer-${suffix}@example.com`,
    password: "StrongPassword11",
    kind: "OWNER",
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.user.kind, "CUSTOMER");
  const owner = new Client();
  const registered = await owner.post("/register-owner", {
    name: "Owner Test",
    email: `owner-${suffix}@example.com`,
    password: "StrongPassword11",
  });
  assert.equal(registered.status, 200);
  assert.equal((await owner.request("/auth/get-session")).data.user.kind, "OWNER");
});

test("booking requires customer sign-in and login return paths stay local", async () => {
  const path = "/book/lahore-auto-care";
  const response = await fetch(base + path, { redirect: "manual" });
  const redirect = "/login?next=" + encodeURIComponent(path);
  assert.ok(
    response.headers.get("location") === redirect ||
      (await response.text()).includes(redirect),
  );
  const customer = await login("customer");
  const wizard = await fetch(base + path, { headers: { Cookie: customer.cookie } });
  assert.equal(wizard.status, 200);
  const html = await wizard.text();
  assert.ok(!html.includes('type="password"'));
  const advisor = await login("advisor");
  const staff = await fetch(base + path, {
    headers: { Cookie: advisor.cookie },
    redirect: "manual",
  });
  assert.ok(
    staff.headers.get("location") === redirect || (await staff.text()).includes(redirect),
  );
  const loginPage = await fetch(
    base + "/login?next=" + encodeURIComponent("//attacker.example"),
  );
  assert.ok(!(await loginPage.text()).includes('"bookingPath":"//attacker.example"'));
});
