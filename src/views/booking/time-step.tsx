"use client";

import type { BookingDates } from "@/types/booking";
import type { BookingController } from "./use-booking";

export default function TimeStep({
  booking,
  dates,
}: {
  booking: BookingController;
  dates: BookingDates;
}) {
  const { step, date, setDate, slot, setSlot, slots, loading, next } = booking;

  return (
    <section className="booking-panel" hidden={step !== 2}>
      <div className="booking-section-top">
        <span className="section-number">02 / 04</span>
        <h2>When works for you?</h2>
        <p>Available workshop appointments · Pakistan Standard Time (UTC+5).</p>
      </div>
      <label className="field-label">
        Appointment date
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setSlot("");
          }}
          min={dates.today}
          max={dates.last}
        />
      </label>
      <p role="status" className="hint">
        {loading
          ? "Loading availability…"
          : slots.length
            ? "Choose an available time."
            : "No available times. Choose another day."}
      </p>
      <div className="slots-grid">
        {slots.map((s) => (
          <button
            key={s.at}
            className={"slot-btn " + (slot === s.at ? "selected" : "")}
            aria-pressed={slot === s.at}
            onClick={() => setSlot(s.at)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="form-nav">
        <button className="button button-outline" onClick={() => next(1)}>
          ← Back
        </button>
        <button className="button button-primary" onClick={() => next(3)}>
          Your vehicle →
        </button>
      </div>
    </section>
  );
}
