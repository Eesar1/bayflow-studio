import { sql } from "@/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { partsFor, roleFor, requireThat, type Query } from "./workflow";
import type {
  Actor,
  Dashboard,
  Job,
  Shop,
  Service,
  Part,
  Member,
  Notice,
  PurchaseOrder,
} from "@/types";

export async function currentUser(): Promise<Actor | null> {
  const s = await auth.api.getSession({ headers: await headers() });

  return s?.user ?? null;
}
export async function requireUser() {
  const user = await currentUser();
  if (!user) redirect("/login");

  return user;
}
export async function publicShops(city = "") {
  return await sql<
    (Shop & { services: string[] })[]
  >`select s.*,coalesce((select json_agg(name order by name) from services where shop_id=s.id),'[]') as services from shops s where s.city ilike ${"%" + city + "%"} or s.name ilike ${"%" + city + "%"} order by s.name`;
}
export async function bookingShop(slug: string) {
  const [shop] = await sql<Shop[]>`select * from shops where slug=${slug}`;
  if (!shop) return null;
  const services = await sql<
    Service[]
  >`select * from services where shop_id=${shop.id} order by name`;

  return { shop, services };
}
export async function hydrateJobs(q: Query, rows: Job[]): Promise<Job[]> {
  return Promise.all(
    rows.map(async (b) => {
      const [est] =
        await q`select * from estimates where booking_id=${b.id} order by revision desc limit 1`;

      return {
        ...b,
        estimate: est
          ? {
              ...est,
              items:
                await q`select * from estimate_items where estimate_id=${est.id} order by id`,
            }
          : null,
        history:
          await q`select h.*,u.name as actor from history h join users u on u.id=h.user_id where booking_id=${b.id} order by h.created_at,h.id`,
        issues:
          await q`select * from qc_issues where booking_id=${b.id} order by created_at desc`,
        qc_reports:
          await q`select * from qc_reports where booking_id=${b.id} order by created_at desc`,
        required_parts: await partsFor(q, b.id),
        services: (
          await q`select s.name from booking_services bs join services s on s.id=bs.service_id where booking_id=${b.id}`
        ).map((s) => s.name),
      } as Job;
    }),
  );
}
export async function customerData(user: Actor) {
  const rows = await sql<
    Job[]
  >`select b.*,u.name as customer_name,u.email as customer_email,v.make,v.model,v.year,v.plate,t.name as technician_name from bookings b join users u on u.id=b.customer_id join vehicles v on v.id=b.vehicle_id left join users t on t.id=b.technician_id where b.customer_id=${user.id} order by b.created_at desc`;
  const notifications = await sql<
    Notice[]
  >`select * from notifications where user_id=${user.id} order by created_at desc limit 30`;

  return { bookings: await hydrateJobs(sql, rows), notifications };
}
export async function dashboardData(user: Actor, shopId?: string): Promise<Dashboard> {
  const shops = await sql<
    Shop[]
  >`select s.* from shops s where s.owner_id=${user.id} or exists(select 1 from memberships m where m.shop_id=s.id and m.user_id=${user.id} and m.active=true) order by s.name`;
  const shop = shopId ? shops.find((s) => s.id === shopId) : shops[0];
  if (shopId) requireThat(shop, "Workshop not available to your account.", 404);
  if (!shop)
    return {
      user,
      shops,
      shop: null,
      role: user.kind === "OWNER" ? "OWNER" : "SA",
      bookings: [],
      inventory: [],
      members: [],
      services: [],
      orders: [],
      notifications: [],
    };
  const role = (await roleFor(sql, user, shop.id))!;
  const rows = await sql<
    Job[]
  >`select b.*,u.name as customer_name,u.email as customer_email,v.make,v.model,v.year,v.plate,t.name as technician_name from bookings b join users u on u.id=b.customer_id join vehicles v on v.id=b.vehicle_id left join users t on t.id=b.technician_id where b.shop_id=${shop.id} and (${role !== "TECH"} or b.technician_id=${user.id}) and (${role !== "QC"} or b.status in ('QC_PENDING','QC_IN_PROGRESS','READY_FOR_PICKUP')) and (${role !== "PARTS"} or b.parts_person_id=${user.id}) order by b.updated_at desc`;
  const inventory = await sql<
    Part[]
  >`select * from inventory where shop_id=${shop.id} order by name`;
  const members = await sql<
    Member[]
  >`select m.*,u.name,u.email from memberships m join users u on u.id=m.user_id where m.shop_id=${shop.id} order by role,u.name`;
  const services = await sql<
    Service[]
  >`select * from services where shop_id=${shop.id} order by name`;
  const orders = await sql<
    PurchaseOrder[]
  >`select po.*,coalesce((select json_agg(json_build_object('id',pi.id,'name',i.name,'quantity',pi.quantity,'received',pi.received)) from purchase_items pi join inventory i on i.id=pi.inventory_id where pi.po_id=po.id),'[]') as items from purchase_orders po join bookings b on b.id=po.booking_id where po.shop_id=${shop.id} and (${role !== "PARTS"} or b.parts_person_id=${user.id}) order by po.created_at desc`;
  const notifications = await sql<
    Notice[]
  >`select * from notifications where user_id=${user.id} and (shop_id=${shop.id} or shop_id is null) order by created_at desc limit 50`;

  return {
    user,
    shops,
    shop,
    role,
    bookings: await hydrateJobs(sql, rows),
    inventory,
    members,
    services,
    orders,
    notifications,
  };
}
