"use client";

import Image from "next/image";
import { money } from "@/constant/workflow";
import type { Service } from "@/types";
import type { BookingController } from "./use-booking";

export default function ServiceStep({
  booking,
  services,
}: {
  booking: BookingController;
  services: Service[];
}) {
  const { step, selected, setSelected, fields, setFields, next } = booking;

  return (
    <section className="booking-panel" hidden={step !== 1}>
      <div className="booking-section-top">
        <span className="section-number">01 / 04</span>
        <h2>What can we help with?</h2>
        <p>
          Choose one or more services. You will approve final repair costs after
          inspection.
        </p>
      </div>
      <div className="service-choices">
        {services.map((s, i) => (
          <label className="service-choice" key={s.id}>
            <input
              type="checkbox"
              checked={selected.includes(s.id)}
              onChange={(e) =>
                setSelected(
                  e.target.checked
                    ? [...selected, s.id]
                    : selected.filter((id) => id !== s.id),
                )
              }
            />
            <span className="service-tick">✓</span>
            <div className="service-photo">
              <Image
                src={i % 2 ? "/images/inspection.jpg" : "/images/engine.jpg"}
                alt=""
                fill
                sizes="240px"
              />
            </div>
            <span className="service-title">{s.name}</span>
            <span className="service-sub">{s.description}</span>
            <span className="service-price">From {money(s.base_price)}</span>
          </label>
        ))}
      </div>
      <label className="field-label">
        Additional notes (optional)
        <textarea
          value={fields.notes}
          onChange={(e) => setFields({ ...fields, notes: e.target.value })}
          rows={3}
          maxLength={1200}
        />
      </label>
      <div className="form-nav">
        <span>Select at least one service</span>
        <button className="button button-primary" onClick={() => next(2)}>
          Choose a time →
        </button>
      </div>
    </section>
  );
}
