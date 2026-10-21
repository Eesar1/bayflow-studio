import Image from "next/image";
import { money, dateTime } from "@/constant/workflow";
import type { Shop } from "@/types";
import type { BookingController } from "./use-booking";

export default function BookingSummary({
  booking,
  shop,
}: {
  booking: BookingController;
  shop: Shop;
}) {
  const { chosen, slot, fields, price } = booking;

  return (
    <aside className="booking-aside">
      <div className="booking-summary">
        <div className="summary-photo">
          <Image
            src="/images/inspection.jpg"
            alt="Technician inspecting a vehicle"
            fill
            sizes="400px"
          />
          <span>YOUR NEXT SERVICE</span>
        </div>
        <div className="summary-body">
          <div className="eyebrow dark">YOUR BOOKING</div>
          <h3>At a glance.</h3>
          {[
            ["WORKSHOP", shop.name],
            ["SERVICES", chosen.map((s) => s.name).join(", ") || "Not selected"],
            ["DATE & TIME", slot ? dateTime(slot) : "Choose a time"],
            [
              "VEHICLE",
              [fields.make, fields.model].filter(Boolean).join(" ") || "Add your vehicle",
            ],
          ].map(([title, value]) => (
            <div className="summary-row" key={title}>
              <span>{title}</span>
              <b>{value}</b>
            </div>
          ))}
          <div className="summary-total">
            <span>INDICATIVE STARTING PRICE</span>
            <strong>{money(price)}</strong>
            <small>Final price requires your approval after inspection.</small>
          </div>
          <div className="secure-line">✓ No payment taken · Transparent estimates</div>
        </div>
      </div>
    </aside>
  );
}
