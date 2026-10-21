import "dotenv/config";
import { randomUUID } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { sql } from "../src/db";
import { move } from "../src/lib/workflow";
import type { Actor } from "../src/types";

const password = await hashPassword("BayflowDemo2026!");
await sql.begin(async (q) => {
  await q`select pg_advisory_xact_lock(782341)`;
  if ((await q`select id from shops limit 1`).length) {
    console.log("Existing data preserved.");

    return;
  }

  async function person(name: string, email: string, kind: string) {
    const id = randomUUID();
    await q`insert into users(id,name,email,kind) values(${id},${name},${email},${kind})`;
    await q`insert into accounts(id,account_id,provider_id,user_id,password) values(${randomUUID()},${id},'credential',${id},${password})`;

    return { id, name, email, kind };
  }
  const owner = await person("Fatima Raza", "owner@bayflow.demo", "OWNER");
  const owner2 = await person("Hassan Siddiqui", "owner2@bayflow.demo", "OWNER");
  const customer = await person("Ahmed Khan", "customer@bayflow.demo", "CUSTOMER");
  const shopSpecs = [
    [
      "Lahore Auto Care",
      "lahore-auto-care",
      "Lahore",
      "18 Main Boulevard, Gulberg III, Lahore",
    ],
    [
      "Motor District Islamabad",
      "motor-district-islamabad",
      "Islamabad",
      "Plot 11, I-9 Industrial Area, Islamabad",
    ],
    [
      "Karachi Motor Works",
      "karachi-motor-works",
      "Karachi",
      "Shop 4, Shahrah-e-Faisal, Karachi",
    ],
  ];
  const roleSpecs = [
    ["Bilal Ahmad", "advisor", "SA"],
    ["Imran Shah", "technician", "TECH"],
    ["Usman Tariq", "parts", "PARTS"],
    ["Sara Malik", "qc", "QC"],
  ];
  for (let index = 0; index < 3; index++) {
    const [name, slug, city, address] = shopSpecs[index];
    const shop = randomUUID();
    await q`insert into shops(id,owner_id,name,slug,city,address,phone,description) values(${shop},${index === 2 ? owner2.id : owner.id},${name},${slug},${city},${address},'+92 300 1234567','Independent servicing, diagnostics and repairs. Demo workshop.')`;
    const actors: Record<string, Actor> = {};
    for (const [name, login, role] of roleSpecs) {
      const u = await person(
        name,
        login + (index ? index + 1 : "") + "@bayflow.demo",
        "STAFF",
      );
      actors[role] = u;
      await q`insert into memberships(shop_id,user_id,role) values(${shop},${u.id},${role})`;
    }
    const serviceIds: Record<string, string> = {};
    for (const [name, description, price] of [
      ["Oil Change", "Engine oil and filter service", 4500],
      ["Brake Inspection", "Pads, rotors and hydraulic checks", 2500],
      ["Check Engine Light", "Diagnostic scan and troubleshooting", 3000],
      ["Tire Rotation", "Tire rotation and wear inspection", 1800],
      ["Battery Check", "Battery and charging-system check", 1200],
      ["General Inspection", "Multi-point vehicle health check", 3200],
    ] as const) {
      const id = randomUUID();
      serviceIds[name] = id;
      await q`insert into services(id,shop_id,name,description,base_price) values(${id},${shop},${name},${description},${price})`;
    }
    const partIds: Record<string, string> = {};
    for (const [sku, name, quantity, cost] of [
      ["IGN-COIL", "Ignition coil ? Honda", index ? 8 : 0, 6500],
      ["OIL-FILTER", "Oil filter", 15, 900],
      ["ENG-OIL-1L", "Engine oil 5W-30 (1L)", 24, 1300],
      ["BRK-PAD", "Front brake pads", 5, 6500],
      ["AIR-FILTER", "Air filter", 2, 1700],
      ["BRAKE-FLUID", "Brake fluid (1L)", 12, 1400],
    ] as const) {
      const id = randomUUID();
      partIds[sku] = id;
      await q`insert into inventory(id,shop_id,sku,name,quantity,reorder_level,unit_cost) values(${id},${shop},${sku},${name},${quantity},4,${cost})`;
    }
    for (let k = 0; k < (index === 0 ? 3 : 1); k++) {
      const c =
        index === 0 && k === 0
          ? customer
          : await person(
              ["Areeba Sheikh", "Omar Farooq", "Zoya Tariq"][index],
              `guest${index}${k}@bayflow.demo`,
              "CUSTOMER",
            );
      const vehicle = randomUUID();
      const id = randomUUID();
      const reference = index === 0 && k === 0 ? "BF-1001" : `BF-2${index}${k}1`;
      const at =
        new Date(Date.now() + (2 + k) * 86400000).toISOString().slice(0, 10) +
        "T10:00:00+05:00";
      await q`insert into vehicles(id,customer_id,plate,make,model,year,mileage) values(${vehicle},${c.id},${index === 0 && k === 0 ? "LEA-1234" : "CAR-" + index + k + "92"},'Honda','Civic',2016,89000)`;
      await q`insert into bookings(id,reference,shop_id,customer_id,vehicle_id,scheduled_at,notes) values(${id},${reference},${shop},${c.id},${vehicle},${at},'Check engine light and vibration at idle.')`;
      for (const service of ["Oil Change", "Check Engine Light"])
        await q`insert into booking_services(booking_id,service_id) values(${id},${serviceIds[service]})`;
      if (index === 0 && k > 0) {
        await move(q, id, actors.SA, { target: "CONFIRMED" });
        await move(q, id, actors.SA, {
          target: "ASSIGNED",
          technician_id: actors.TECH.id,
        });
        await move(q, id, actors.TECH, { target: "INSPECTING" });
        if (k === 2) {
          const est = randomUUID();
          await q`insert into estimates(id,booking_id,revision,total,created_by,notes) values(${est},${id},1,10000,${actors.TECH.id},'Front brake pad replacement recommended.')`;
          await q`insert into estimate_items(id,estimate_id,kind,description,inventory_id,quantity,unit_price) values(${randomUUID()},${est},'PART','Front brake pads',${partIds["BRK-PAD"]},1,6500),(${randomUUID()},${est},'LABOUR','Brake service labour',null,1,3500)`;
          await q`update bookings set estimate_revision=1 where id=${id}`;
          await move(q, id, actors.TECH, { target: "ESTIMATE_REVIEW" });
          await move(q, id, actors.SA, { target: "AWAITING_CUSTOMER" });
        }
      }
    }
  }
  console.log("Seeded three demo shops and every role. Demo password: BayflowDemo2026!");
});
await sql.end();
