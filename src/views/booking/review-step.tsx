"use client";

import { dateTime } from "@/constant/workflow";
import type { Shop } from "@/types";
import type { BookingController } from "./use-booking";

export default function ReviewStep({
  booking,
  shop,
}: {
  booking: BookingController;
  shop: Shop;
}) {
  const { step, chosen, slot, fields, next, busy, submit } = booking;

  return (
    <section className="booking-panel" hidden={step !== 4}>
      <div className="booking-section-top">
        <span className="section-number">04 / 04</span>
        <h2>Make it official.</h2>
        <p>
          Review the details below. You will approve a separate itemized estimate before
          repair.
        </p>
      </div>
      <div className="review-card">
        <dl>
          <dt>Workshop</dt>
          <dd>{shop.name}</dd>
          <dt>Services</dt>
          <dd>{chosen.map((s) => s.name).join(", ")}</dd>
          <dt>Appointment</dt>
          <dd>{slot ? dateTime(slot) : "Not selected"}</dd>
          <dt>Customer</dt>
          <dd>
            {fields.name} · {fields.email}
          </dd>
          <dt>Vehicle</dt>
          <dd>
            {fields.year} {fields.make} {fields.model} · {fields.plate}
          </dd>
        </dl>
      </div>
      <p className="policy-note">
        <b>No payment required today.</b> Your workshop will review this appointment
        request.
      </p>
      <div className="form-nav">
        <button className="button button-outline" onClick={() => next(3)}>
          ← Back
        </button>
        <button className="button button-primary" disabled={busy} onClick={submit}>
          {busy ? "Confirming…" : "Confirm booking →"}
        </button>
      </div>
    </section>
  );
}
