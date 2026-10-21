import { randomUUID } from "node:crypto";
import { sql, type Tx } from "@/db";
import { TRANSITIONS, CANCELLABLE, type Status, label } from "@/constant/workflow";
import type { Actor, Role, RequiredPart } from "@/types";

export type Query = typeof sql | Tx;
export class AppError extends Error {
  constructor(
    message: string,
    public status = 409,
  ) {
    super(message);
  }
}
export function requireThat(
  value: unknown,
  message: string,
  status = 409,
): asserts value {
  if (!value) throw new AppError(message, status);
}
export async function roleFor(q: Query, user: Actor, shop: string): Promise<Role | null> {
  if (
    user.kind === "OWNER" &&
    (await q`select id from shops where id=${shop} and owner_id=${user.id}`).length
  )
    return "OWNER";
  const [m] =
    await q`select role from memberships where shop_id=${shop} and user_id=${user.id} and active=true`;

  return (m?.role as Role) ?? (user.kind === "CUSTOMER" ? "CUSTOMER" : null);
}
export async function canView(q: Query, user: Actor, b: Record<string, unknown>) {
  const role = await roleFor(q, user, String(b.shop_id));
  if (["OWNER", "SA", "PARTS", "QC"].includes(role ?? "")) return true;
  if (role === "TECH") return b.technician_id === user.id;

  return user.kind === "CUSTOMER" && b.customer_id === user.id;
}
export async function notice(
  q: Query,
  user: string | null,
  title: string,
  detail: string,
  shop: string,
  booking: string,
) {
  if (user)
    await q`insert into notifications(id,user_id,shop_id,booking_id,title,detail) values(${randomUUID()},${user},${shop},${booking},${title},${detail})`;
}
export async function noticeRole(
  q: Query,
  shop: string,
  role: Role,
  title: string,
  detail: string,
  booking: string,
) {
  const members =
    await q`select user_id from memberships where shop_id=${shop} and role=${role} and active=true`;
  for (const m of members) await notice(q, m.user_id, title, detail, shop, booking);
}
export async function partsFor(q: Query, booking: string): Promise<RequiredPart[]> {
  return await q<
    RequiredPart[]
  >`select i.id as inventory_id,i.sku,i.name,i.quantity as stock,sum(ei.quantity)::int as needed
 from estimate_items ei join inventory i on i.id=ei.inventory_id where ei.estimate_id=(select id from estimates where booking_id=${booking} order by revision desc limit 1) and ei.kind='PART' group by i.id order by i.id`;
}
export type MoveInput = {
  target: Status;
  note?: string;
  technician_id?: string;
  parts_person_id?: string;
  issue_title?: string;
  issue_description?: string;
  qc_checks?: { brakes: boolean; fluids: boolean; road_test: boolean };
  qc_notes?: string;
};
export async function move(q: Tx, booking: string, user: Actor, data: MoveInput) {
  const [b] = await q`select * from bookings where id=${booking} for update`;
  requireThat(b && (await canView(q, user, b)), "Booking not found.", 404);
  const current = b.status as Status;
  const target = data.target;
  const role = await roleFor(q, user, b.shop_id);
  if (target === "CANCELLED" && CANCELLABLE.includes(current)) {
    requireThat(
      role === "SA" || role === "OWNER" || b.customer_id === user.id,
      "Only the customer or advisor can cancel.",
      403,
    );
  } else {
    const required = TRANSITIONS[current]?.[target];
    requireThat(required, "Invalid workflow transition.");
    if (required === "CUSTOMER")
      requireThat(
        b.customer_id === user.id,
        "Only the customer can approve or reject their estimate.",
        403,
      );
    else if (target === "COMPLETED" && b.customer_id === user.id) {
    } else {
      requireThat(
        role === required || role === "OWNER",
        "This action belongs to another role.",
        403,
      );
      if (required === "TECH")
        requireThat(
          b.technician_id === user.id,
          "Only the assigned technician can do that.",
          403,
        );
      if (required === "PARTS")
        requireThat(
          b.parts_person_id === user.id,
          "Only the assigned parts person can do that.",
          403,
        );
      if (required === "QC")
        requireThat(
          !b.qc_inspector_id || b.qc_inspector_id === user.id,
          "Another inspector claimed this job.",
        );
    }
  }
  const [estimate] =
    await q`select * from estimates where booking_id=${booking} order by revision desc limit 1`;
  if (target === "ASSIGNED" || target === "PARTS_PENDING") {
    const member = target === "ASSIGNED" ? data.technician_id : data.parts_person_id;
    const memberRole = target === "ASSIGNED" ? "TECH" : "PARTS";
    requireThat(
      member &&
        (
          await q`select user_id from memberships where shop_id=${b.shop_id} and user_id=${member} and role=${memberRole} and active=true`
        ).length,
      "Select an active team member for this role.",
    );
    if (target === "ASSIGNED")
      await q`update bookings set technician_id=${member!} where id=${booking}`;
    else await q`update bookings set parts_person_id=${member!} where id=${booking}`;
    await notice(
      q,
      member!,
      target === "ASSIGNED" ? "New job assigned" : "Parts request assigned",
      b.reference,
      b.shop_id,
      booking,
    );
  }
  if (target === "ESTIMATE_REVIEW") {
    requireThat(estimate, "Save an itemized estimate first.");
    await noticeRole(
      q,
      b.shop_id,
      "SA",
      "Estimate ready for review",
      b.reference,
      booking,
    );
  }
  if (target === "AWAITING_CUSTOMER") {
    requireThat(
      estimate &&
        (await q`select id from estimate_items where estimate_id=${estimate.id}`).length,
      "Save an itemized estimate first.",
    );
    await q`update estimates set status='SENT' where id=${estimate.id}`;
    await notice(
      q,
      b.customer_id,
      "Estimate needs approval",
      b.reference,
      b.shop_id,
      booking,
    );
  }
  if (target === "ESTIMATE_APPROVED" || target === "ESTIMATE_REJECTED") {
    requireThat(estimate?.status === "SENT", "No sent estimate is available.");
    await q`update estimates set status=${target === "ESTIMATE_APPROVED" ? "APPROVED" : "REJECTED"} where id=${estimate.id}`;
    await noticeRole(
      q,
      b.shop_id,
      "SA",
      "Customer responded to estimate",
      b.reference + " · " + label(target),
      booking,
    );
  }
  if (target === "PARTS_ORDERED")
    requireThat(
      (await q`select id from purchase_orders where booking_id=${booking}`).length,
      "Create a purchase order first.",
    );
  if (target === "PARTS_READY") {
    const parts = await partsFor(q, booking);
    requireThat(
      parts.every((p) => p.stock >= p.needed),
      "Required parts are still out of stock.",
    );
    const outstanding =
      await q`select pi.id from purchase_items pi join purchase_orders po on po.id=pi.po_id where po.booking_id=${booking} and pi.received<pi.quantity`;
    requireThat(
      !outstanding.length,
      "A linked purchase order is still partially received.",
    );
    await notice(q, b.technician_id, "Parts are ready", b.reference, b.shop_id, booking);
  }
  if (target === "IN_REPAIR" && current === "PARTS_READY") {
    for (const p of await partsFor(q, booking)) {
      const changed =
        await q`update inventory set quantity=quantity-${p.needed} where id=${p.inventory_id} and shop_id=${b.shop_id} and quantity>=${p.needed} returning id`;
      requireThat(changed.length, "Insufficient stock to allocate parts.");
      await q`insert into allocations(id,booking_id,inventory_id,quantity) values(${randomUUID()},${booking},${p.inventory_id},${p.needed})`;
    }
  }
  if (target === "QC_PENDING") {
    await q`update qc_issues set resolved=true where booking_id=${booking} and resolved=false`;
    await noticeRole(q, b.shop_id, "QC", "Vehicle awaiting QC", b.reference, booking);
  }
  if (target === "QC_IN_PROGRESS") {
    requireThat(!b.qc_inspector_id, "This QC job is already claimed.");
    await q`update bookings set qc_inspector_id=${user.id} where id=${booking}`;
  }
  if (
    current === "QC_IN_PROGRESS" &&
    (target === "IN_REPAIR" || target === "READY_FOR_PICKUP")
  ) {
    const checks = data.qc_checks;
    requireThat(
      checks &&
        Object.keys(checks).length === 3 &&
        ["brakes", "fluids", "road_test"].every(
          (k) => typeof checks[k as keyof typeof checks] === "boolean",
        ),
      "Record every QC checklist result.",
    );
    requireThat(
      target !== "READY_FOR_PICKUP" || Object.values(checks).every(Boolean),
      "All QC checks must pass.",
    );
    if (target === "IN_REPAIR") {
      requireThat(data.issue_title?.trim(), "QC failure requires a rework issue title.");
      await q`insert into qc_issues(id,booking_id,inspector_id,title,description) values(${randomUUID()},${booking},${user.id},${data.issue_title!},${data.issue_description ?? ""})`;
      await notice(
        q,
        b.technician_id,
        "QC issue needs attention",
        data.issue_title!,
        b.shop_id,
        booking,
      );
    } else await noticeRole(q, b.shop_id, "SA", "QC passed", b.reference, booking);
    await q`insert into qc_reports(id,booking_id,inspector_id,outcome,checklist,notes) values(${randomUUID()},${booking},${user.id},${target === "IN_REPAIR" ? "FAIL" : "PASS"},${JSON.stringify(checks)},${data.qc_notes ?? ""})`;
    await q`update bookings set qc_inspector_id=null where id=${booking}`;
  }
  if (target === "COMPLETED")
    requireThat(b.ready_notified, "Notify the customer before completing pickup.");
  if (target === "CANCELLED") {
    const reserved =
      await q`select * from allocations where booking_id=${booking} and released=false for update`;
    for (const p of reserved)
      await q`update inventory set quantity=quantity+${p.quantity} where id=${p.inventory_id}`;
    await q`update allocations set released=true where booking_id=${booking} and released=false`;
  }
  await q`update bookings set status=${target},updated_at=now() where id=${booking}`;
  await q`insert into history(id,booking_id,user_id,from_status,to_status,note) values(${randomUUID()},${booking},${user.id},${current},${target},${data.note ?? ""})`;

  return { ok: true, status: target };
}
