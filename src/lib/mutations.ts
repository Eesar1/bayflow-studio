import { randomUUID } from "node:crypto";
import { z } from "zod";
import { sql } from "@/db";
import { auth } from "./auth";
import { hashPassword, verifyPassword } from "better-auth/crypto";
import {
  roleFor,
  canView,
  requireThat,
  notice,
  noticeRole,
  partsFor,
  move,
  AppError,
} from "./workflow";
import { validSlot } from "./slots";
import * as V from "./validation";
import type { Actor, Shop } from "@/types";

async function requireOwner(user: Actor, shop: string) {
  requireThat(
    (await sql`select id from shops where id=${shop} and owner_id=${user.id}`).length,
    "Only the shop owner can do that.",
    403,
  );
}
export async function registerOwner(body: unknown) {
  const data = z
    .object({
      name: z.string().trim().min(2).max(100),
      email: z.email(),
      password: z.string().min(10).max(128),
    })
    .parse(body);
  const response = await auth.api.signUpEmail({ body: data, asResponse: true });
  if (!response.ok) return response;
  const result = await response.clone().json();
  await sql`update users set kind='OWNER' where id=${result.user.id}`;

  return response;
}
export async function createBooking(body: unknown, user: Actor | null) {
  const d = V.bookingSchema.parse(body);
  requireThat(
    Date.parse(d.scheduled_at) > Date.now() &&
      Date.parse(d.scheduled_at) <= Date.now() + 46 * 86400000,
    "Choose a future available slot.",
    422,
  );
  let customer = user?.kind === "CUSTOMER" ? user : null;
  let authResponse: Response | null = null;
  if (customer) requireThat(customer.email === d.email, "Use your signed-in email.", 422);
  else {
    requireThat(d.password, "Enter your account password.", 422);
    const [existing] = await sql`select id from users where email=${d.email}`;
    if (existing)
      authResponse = await auth.api.signInEmail({
        body: { email: d.email, password: d.password! },
        asResponse: true,
      });
    else
      authResponse = await auth.api.signUpEmail({
        body: { name: d.name, email: d.email, password: d.password! },
        asResponse: true,
      });
    if (!authResponse.ok)
      throw new AppError("Account credentials could not be verified.", 401);
    const result = await authResponse.clone().json();
    customer = result.user;
    requireThat(customer?.kind === "CUSTOMER", "Use a customer account to book.", 403);
  }
  const customerId = customer!.id;
  const result = await sql.begin(async (q) => {
    // Serialize bookings and schedule edits per shop to prevent capacity races.
    const [shop] = await q<Shop[]>`select * from shops where id=${d.shop_id} for update`;
    requireThat(shop, "Workshop not found.", 404);
    requireThat(
      validSlot(shop, d.scheduled_at),
      "Slot is outside the workshop schedule.",
      422,
    );
    const selected =
      await q`select id from services where shop_id=${d.shop_id} and id in ${q(d.service_ids)}`;
    requireThat(
      selected.length === d.service_ids.length,
      "Choose services from this workshop.",
      422,
    );
    const [{ count }] =
      await q`select count(*)::int as count from bookings where shop_id=${d.shop_id} and scheduled_at=${d.scheduled_at} and status!='CANCELLED'`;
    requireThat(count < shop.capacity, "That slot just filled up. Choose another.");
    const vehicle = randomUUID();
    const id = randomUUID();
    const reference = "BF-" + randomUUID().slice(0, 6).toUpperCase();
    await q`insert into vehicles(id,customer_id,plate,make,model,year,color,mileage) values(${vehicle},${customerId},${d.plate.toUpperCase()},${d.make},${d.model},${d.year},${d.color},${d.mileage ?? null})`;
    await q`insert into bookings(id,reference,shop_id,customer_id,vehicle_id,scheduled_at,notes) values(${id},${reference},${d.shop_id},${customerId},${vehicle},${d.scheduled_at},${d.notes})`;
    for (const service of d.service_ids)
      await q`insert into booking_services(booking_id,service_id) values(${id},${service})`;
    await noticeRole(q, d.shop_id, "SA", "New booking received", reference, id);

    return { ok: true, booking_id: id, reference, redirect: "/customer" };
  });
  const headers = new Headers();
  for (const cookie of authResponse?.headers.getSetCookie() ?? [])
    headers.append("set-cookie", cookie);

  return Response.json(result, { headers });
}
export async function bookingMutation(
  id: string,
  action: string,
  body: unknown,
  user: Actor,
) {
  return sql.begin(async (q) => {
    if (action === "transition") return move(q, id, user, V.moveSchema.parse(body));
    const [b] = await q`select * from bookings where id=${id} for update`;
    requireThat(b && (await canView(q, user, b)), "Booking not found.", 404);
    const role = await roleFor(q, user, b.shop_id);
    if (action === "estimate") {
      requireThat(
        (b.status === "INSPECTING" && role === "TECH" && b.technician_id === user.id) ||
          (b.status === "ESTIMATE_REVIEW" && (role === "SA" || role === "OWNER")),
        "You cannot edit this estimate at this stage.",
        403,
      );
      const data = V.estimateSchema.parse(body);
      for (const item of data.items)
        if (item.kind === "PART")
          requireThat(
            item.inventory_id &&
              (
                await q`select id from inventory where id=${item.inventory_id} and shop_id=${b.shop_id}`
              ).length,
            "Select a workshop inventory part.",
            422,
          );
      const revision = b.estimate_revision + 1;
      const estimate = randomUUID();
      const total = data.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
      requireThat(
        total <= 2000000000,
        "Estimate total exceeds the supported amount.",
        422,
      );
      await q`insert into estimates(id,booking_id,revision,notes,total,created_by) values(${estimate},${id},${revision},${data.notes},${total},${user.id})`;
      for (const item of data.items)
        await q`insert into estimate_items(id,estimate_id,kind,description,inventory_id,quantity,unit_price) values(${randomUUID()},${estimate},${item.kind},${item.description},${item.kind === "PART" ? item.inventory_id! : null},${item.quantity},${item.unit_price})`;
      await q`update bookings set estimate_revision=${revision},updated_at=now() where id=${id}`;

      return { ok: true, revision, total };
    }
    if (action === "ready-notice") {
      requireThat(
        role === "SA" || role === "OWNER",
        "Only advisors can notify customers.",
        403,
      );
      requireThat(b.status === "READY_FOR_PICKUP", "Vehicle has not passed QC.");
      if (!b.ready_notified) {
        await q`update bookings set ready_notified=true where id=${id}`;
        await notice(
          q,
          b.customer_id,
          "Ready for pickup",
          b.reference + " · your vehicle is ready to collect.",
          b.shop_id,
          id,
        );
      }

      return { ok: true };
    }
    if (action === "purchase-orders") {
      requireThat(
        (role === "PARTS" && b.parts_person_id === user.id) || role === "OWNER",
        "Only the assigned parts team can purchase.",
        403,
      );
      requireThat(
        ["PARTS_PENDING", "PARTS_ORDERED"].includes(b.status),
        "Booking is not awaiting procurement.",
      );
      const d = V.orderSchema.parse(body);
      const required = await partsFor(q, id);
      requireThat(
        new Set(d.items.map((i) => i.inventory_id)).size === d.items.length,
        "Duplicate order part.",
        422,
      );
      for (const i of d.items)
        requireThat(
          required.some(
            (p) => p.inventory_id === i.inventory_id && i.quantity <= p.needed,
          ),
          "Only required parts can be ordered.",
          422,
        );
      const po = randomUUID();
      const reference = "PO-" + randomUUID().slice(0, 6).toUpperCase();
      await q`insert into purchase_orders(id,reference,shop_id,booking_id,supplier,created_by) values(${po},${reference},${b.shop_id},${id},${d.supplier},${user.id})`;
      for (const i of d.items)
        await q`insert into purchase_items(id,po_id,inventory_id,quantity) values(${randomUUID()},${po},${i.inventory_id},${i.quantity})`;
      await notice(
        q,
        b.parts_person_id,
        "Purchase order placed",
        reference,
        b.shop_id,
        id,
      );

      return { ok: true, po_id: po, reference };
    }
    throw new AppError("Action not found.", 404);
  });
}
export async function receiveOrder(id: string, body: unknown, user: Actor) {
  const d = V.receiptSchema.parse(body);

  return sql.begin(async (q) => {
    const [ref] = await q`select booking_id from purchase_orders where id=${id}`;
    requireThat(ref, "Order not found.", 404);
    const [b] = await q`select * from bookings where id=${ref.booking_id} for update`;
    const [po] = await q`select * from purchase_orders where id=${id} for update`;
    const role = await roleFor(q, user, po.shop_id);
    requireThat(
      role === "OWNER" || (role === "PARTS" && b.parts_person_id === user.id),
      "Purchase order is not assigned to you.",
      403,
    );
    requireThat(
      ["PARTS_PENDING", "PARTS_ORDERED"].includes(b.status),
      "Booking is not awaiting parts.",
    );
    const items =
      await q`select * from purchase_items where po_id=${id} order by inventory_id for update`;
    requireThat(
      Object.keys(d.quantities).every((k) => items.some((i) => i.id === k)),
      "Unknown purchase item.",
      422,
    );
    let received = 0;
    for (const item of items) {
      const add = d.quantities[item.id] ?? 0;
      requireThat(
        add <= item.quantity - item.received,
        "Cannot receive more than ordered.",
      );
      if (add) {
        await q`update purchase_items set received=received+${add} where id=${item.id}`;
        await q`update inventory set quantity=quantity+${add} where id=${item.inventory_id}`;
        received += add;
      }
    }
    requireThat(received > 0, "Enter a receipt quantity.", 422);
    const incomplete =
      await q`select id from purchase_items where po_id=${id} and received<quantity`;
    const status = incomplete.length ? "PARTIALLY_RECEIVED" : "RECEIVED";
    await q`update purchase_orders set status=${status} where id=${id}`;

    return { ok: true, status };
  });
}
export async function createShop(body: unknown, user: Actor) {
  requireThat(user.kind === "OWNER", "Only owners can create workshops.", 403);
  const d = V.shopSchema.parse(body);
  const id = randomUUID();
  const slug =
    d.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    id.slice(0, 6);
  await sql`insert into shops(id,owner_id,name,slug,city,address,phone,description,hours_start,hours_end,slot_minutes,capacity) values(${id},${user.id},${d.name},${slug},${d.city},${d.address},${d.phone},${d.description},${d.hours_start},${d.hours_end},${d.slot_minutes},${d.capacity})`;

  return { ok: true, shop_id: id, redirect: "/pos?shop=" + id + "&view=team" };
}
export async function shopMutation(
  shop: string,
  action: string,
  body: unknown,
  user: Actor,
  memberOrService?: string,
) {
  if (action === "inventory") {
    const role = await roleFor(sql, user, shop);
    requireThat(
      role === "OWNER" || role === "PARTS",
      "Only the parts team manages inventory.",
      403,
    );
    const d = V.inventorySchema.parse(body);
    await sql`insert into inventory(id,shop_id,sku,name,quantity,reorder_level,unit_cost) values(${randomUUID()},${shop},${d.sku.toUpperCase()},${d.name},${d.quantity},${d.reorder_level},${d.unit_cost})`;

    return { ok: true };
  }
  await requireOwner(user, shop);
  if (action === "services" || action === "service-update") {
    const d = V.serviceSchema.parse(body);
    if (memberOrService) {
      const updated =
        await sql`update services set name=${d.name},description=${d.description},minutes=${d.minutes},base_price=${d.base_price} where id=${memberOrService} and shop_id=${shop} returning id`;
      requireThat(updated.length, "Service not found.", 404);
    } else
      await sql`insert into services(id,shop_id,name,description,minutes,base_price) values(${randomUUID()},${shop},${d.name},${d.description},${d.minutes},${d.base_price})`;

    return { ok: true };
  }
  if (action === "members") {
    const d = V.memberSchema.parse(body);
    let [staff] = await sql`select * from users where email=${d.email}`;
    if (staff) {
      requireThat(staff.kind === "STAFF", "This account has a different type.");
      const [credential] =
        await sql`select password from accounts where user_id=${staff.id} and provider_id='credential'`;
      requireThat(
        credential?.password &&
          (await verifyPassword({ password: d.password, hash: credential.password })),
        "Existing staff credentials did not match.",
        403,
      );
    } else {
      const password = await hashPassword(d.password);
      const id = randomUUID();
      await sql.begin(async (q) => {
        await q`insert into users(id,name,email,kind) values(${id},${d.name},${d.email},'STAFF')`;
        await q`insert into accounts(id,account_id,provider_id,user_id,password) values(${randomUUID()},${id},'credential',${id},${password})`;
      });
      staff = { id };
    }
    await sql`insert into memberships(shop_id,user_id,role) values(${shop},${staff.id},${d.role}) on conflict(shop_id,user_id) do update set role=excluded.role,active=true`;

    return { ok: true };
  }
  if (action === "role" || action === "toggle") {
    const value =
      action === "role"
        ? z.object({ role: z.enum(["SA", "TECH", "PARTS", "QC"]) }).parse(body).role
        : z.object({ active: z.boolean() }).parse(body).active;
    const rows =
      action === "role"
        ? await sql`update memberships set role=${String(value)} where shop_id=${shop} and user_id=${memberOrService!} returning user_id`
        : await sql`update memberships set active=${value as boolean} where shop_id=${shop} and user_id=${memberOrService!} returning user_id`;
    requireThat(rows.length, "Team member not found.", 404);

    return { ok: true };
  }
  if (action === "schedule") {
    const d = V.scheduleSchema.parse(body);
    await sql.begin(async (q) => {
      const [s] = await q<Shop[]>`select * from shops where id=${shop} for update`;
      const jobs =
        await q`select scheduled_at from bookings where shop_id=${shop} and status!='CANCELLED' and scheduled_at>now()`;
      for (const b of jobs)
        requireThat(
          validSlot({ ...s, ...d }, new Date(b.scheduled_at).toISOString()),
          "Existing bookings conflict with the new schedule.",
        );
      const [{ max }] =
        await q`select coalesce(max(n),0)::int as max from (select count(*)::int n from bookings where shop_id=${shop} and scheduled_at>now() and status!='CANCELLED' group by scheduled_at) slots`;
      requireThat(d.capacity >= max, "Capacity would overbook existing appointments.");
      await q`update shops set hours_start=${d.hours_start},hours_end=${d.hours_end},slot_minutes=${d.slot_minutes},capacity=${d.capacity} where id=${shop}`;
    });

    return { ok: true };
  }
  throw new AppError("Action not found.", 404);
}
