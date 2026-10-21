"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { PurchaseOrder } from "@/types";

export default function ReceiveForm({ order }: { order: PurchaseOrder }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="receive-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setBusy(true);
        try {
          await api(`/purchase-orders/${order.id}/receive`, {
            quantities: Object.fromEntries(fd),
          });
          router.refresh();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {order.items
        .filter((i) => i.received < i.quantity)
        .map((i) => (
          <label key={i.id}>
            {i.name} · {i.received} / {i.quantity} received
            <input
              type="number"
              name={i.id}
              defaultValue="0"
              min="0"
              max={i.quantity - i.received}
            />
          </label>
        ))}
      <button className="pos-primary" disabled={busy}>
        Record receipt →
      </button>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </form>
  );
}
