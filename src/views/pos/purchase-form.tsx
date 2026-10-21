"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Job } from "@/types";

export default function PurchaseForm({ job }: { job: Job }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="purchase-form"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        setError("");
        try {
          await api(`/bookings/${job.id}/purchase-orders`, {
            supplier: f.get("supplier"),
            items: [
              {
                inventory_id: f.get("inventory_id"),
                quantity: Number(f.get("quantity")),
              },
            ],
          });
          router.refresh();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3>Order required parts</h3>
      <label>
        Supplier
        <input name="supplier" required minLength={2} />
      </label>
      <label>
        Part
        <select name="inventory_id" required>
          <option value="">Choose required part</option>
          {job.required_parts.map((p) => (
            <option key={p.inventory_id} value={p.inventory_id}>
              {p.name} · need {p.needed}, stock {p.stock}
            </option>
          ))}
        </select>
      </label>
      <label>
        Quantity
        <input type="number" name="quantity" min="1" defaultValue="1" required />
      </label>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button className="pos-quiet full" disabled={busy}>
        Create purchase order
      </button>
    </form>
  );
}
