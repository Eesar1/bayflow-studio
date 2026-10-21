"use client";

import type { BookingDates } from "@/types/booking";
import type { BookingController } from "./use-booking";

export default function VehicleStep({
  booking,
  dates,
}: {
  booking: BookingController;
  dates: BookingDates;
}) {
  const { step, fields, setFields, next } = booking;

  function field(
    key: keyof typeof fields,
    title: string,
    type = "text",
    required = false,
  ) {
    return (
      <label>
        {title}
        <input
          name={key}
          type={type}
          value={fields[key]}
          onChange={(e) => setFields({ ...fields, [key]: e.target.value })}
          required={required}
          min={key === "year" ? 1950 : key === "mileage" ? 0 : undefined}
          max={key === "year" ? dates.year + 1 : undefined}
          readOnly={key === "email"}
        />
      </label>
    );
  }

  return (
    <section className="booking-panel" data-step="3" hidden={step !== 3}>
      <div className="booking-section-top">
        <span className="section-number">03 / 04</span>
        <h2>Tell us about yourself.</h2>
        <p>
          Your booking will appear in My bookings. Your workshop receives it for
          confirmation and technician assignment.
        </p>
      </div>
      <div className="form-section-title">CONTACT DETAILS</div>
      <div className="form-grid">
        {field("name", "Full name", "text", true)}
        {field("email", "Email address", "email", true)}
        {field("phone", "Phone (optional)", "tel")}
      </div>
      <div className="form-section-title">VEHICLE DETAILS</div>
      <div className="form-grid">
        {field("plate", "Registration / plate", "text", true)}
        {field("make", "Make", "text", true)}
        {field("model", "Model", "text", true)}
        {field("year", "Year", "number", true)}
        {field("mileage", "Mileage (optional)", "number")}
        {field("color", "Color (optional)")}
      </div>
      <div className="form-nav">
        <button className="button button-outline" onClick={() => next(2)}>
          ← Back
        </button>
        <button className="button button-primary" onClick={() => next(4)}>
          Review booking →
        </button>
      </div>
    </section>
  );
}
