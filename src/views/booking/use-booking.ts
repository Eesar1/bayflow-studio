"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { BookingProps } from "@/types/booking";

export function useBooking({ shop, services, user, dates }: BookingProps) {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [date, setDate] = useState(dates.tomorrow);
  const [slot, setSlot] = useState("");
  const [slots, setSlots] = useState<{ at: string; label: string; remaining: number }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState({
    name: user?.kind === "CUSTOMER" ? user.name : "",
    email: user?.kind === "CUSTOMER" ? user.email : "",
    phone: "",
    plate: "",
    make: "",
    model: "",
    year: "",
    color: "",
    mileage: "",
    notes: "",
  });

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const result = await api<{ slots: typeof slots }>(
          `/shops/${shop.id}/slots?date=${date}`,
        );
        if (active) {
          setSlots(result.slots);
          setError("");
        }
      } catch (e) {
        if (active) {
          setSlots([]);
          setError((e as Error).message);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();

    return () => {
      active = false;
    };
  }, [shop.id, date]);
  const chosen = services.filter((s) => selected.includes(s.id));
  const price = chosen.reduce((sum, s) => sum + s.base_price, 0);

  function next(to: number) {
    setError("");
    if (to === 2 && !selected.length) {
      setError("Choose at least one service.");

      return;
    }
    if (to === 3 && !slot) {
      setError("Choose an available time.");

      return;
    }
    if (to === 4) {
      const panel = document.querySelector('[data-step="3"]');
      for (const input of panel?.querySelectorAll("input") ?? []) {
        if (!input.checkValidity()) {
          input.reportValidity();

          return;
        }
      }
    }
    setStep(to);
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const result = await api<{ redirect: string; booking_id: string }>("/bookings", {
        ...fields,
        shop_id: shop.id,
        service_ids: selected,
        scheduled_at: slot,
      });
      window.location.href =
        result.redirect + "?created=" + encodeURIComponent(result.booking_id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return {
    step,
    selected,
    setSelected,
    date,
    setDate,
    slot,
    setSlot,
    slots,
    loading,
    busy,
    error,
    fields,
    setFields,
    chosen,
    price,
    next,
    submit,
  };
}
export type BookingController = ReturnType<typeof useBooking>;
