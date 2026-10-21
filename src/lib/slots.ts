import { sql } from "@/db";
import { requireThat } from "./workflow";
import type { Shop } from "@/types";

export function pakistanDay(at = new Date()) {
  return new Date(at.getTime() + 5 * 3600000).toISOString().slice(0, 10);
}
export function scheduledMinutes(at: string) {
  const local = new Date(Date.parse(at) + 5 * 3600000);

  return local.getUTCHours() * 60 + local.getUTCMinutes();
}
export function validSlot(shop: Shop, at: string) {
  const minutes = scheduledMinutes(at);
  const [h, m] = shop.hours_start.split(":").map(Number);
  const [eh, em] = shop.hours_end.split(":").map(Number);

  return (
    minutes >= h * 60 + m &&
    minutes + shop.slot_minutes <= eh * 60 + em &&
    (minutes - h * 60 - m) % shop.slot_minutes === 0
  );
}
export async function availableSlots(shopId: string, day: string) {
  requireThat(
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
      !isNaN(Date.parse(day)) &&
      day >= pakistanDay() &&
      day <= pakistanDay(new Date(Date.now() + 45 * 86400000)),
    "Choose a date within the next 45 days.",
    422,
  );
  const [shop] = await sql<Shop[]>`select * from shops where id=${shopId}`;
  requireThat(shop, "Workshop not found.", 404);
  const result = [];
  const opening = shop.hours_start.split(":").map(Number);
  const closing = shop.hours_end.split(":").map(Number);
  for (
    let minute = opening[0] * 60 + opening[1];
    minute + shop.slot_minutes <= closing[0] * 60 + closing[1];
    minute += shop.slot_minutes
  ) {
    const at =
      day +
      "T" +
      String(Math.floor(minute / 60)).padStart(2, "0") +
      ":" +
      String(minute % 60).padStart(2, "0") +
      ":00+05:00";
    if (Date.parse(at) <= Date.now()) continue;
    const [{ count }] =
      await sql`select count(*)::int as count from bookings where shop_id=${shopId} and scheduled_at=${at} and status!='CANCELLED'`;
    if (count < shop.capacity)
      result.push({
        at,
        label: new Date(at).toLocaleTimeString("en-GB", {
          timeZone: "Asia/Karachi",
          hour: "2-digit",
          minute: "2-digit",
        }),
        remaining: shop.capacity - count,
      });
  }

  return { slots: result, date: day, timezone: "Asia/Karachi" };
}
