"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Job, Dashboard, EstimateItem } from "@/types";

export default function EstimateEditor({ job, data }: { job: Job; data: Dashboard }) {
  const router = useRouter();
  const [items, setItems] = useState<EstimateItem[]>(
    job.estimate?.items ?? [
      { kind: "PART", description: "", inventory_id: "", quantity: 1, unit_price: 0 },
    ],
  );
  const [notes, setNotes] = useState(job.estimate?.notes ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(index: number, patch: Partial<EstimateItem>) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  return (
    <form
      className="estimate-editor"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await api(`/bookings/${job.id}/estimate`, { items, notes });
          router.refresh();
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3>Prepare estimate</h3>
      {items.map((item, i) => (
        <fieldset className="estimate-input-row" key={i}>
          <legend>Line {i + 1}</legend>
          <label>
            Type
            <select
              value={item.kind}
              onChange={(e) =>
                update(i, {
                  kind: e.target.value as EstimateItem["kind"],
                  inventory_id: null,
                })
              }
            >
              <option value="PART">Part</option>
              <option value="LABOUR">Labour</option>
            </select>
          </label>
          {item.kind === "PART" && (
            <label>
              Inventory part
              <select
                required
                value={item.inventory_id ?? ""}
                onChange={(e) => {
                  const part = data.inventory.find((p) => p.id === e.target.value);
                  update(i, {
                    inventory_id: e.target.value,
                    description: part?.name ?? "",
                    unit_price: part?.unit_cost ?? 0,
                  });
                }}
              >
                <option value="">Select a part</option>
                {data.inventory.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Description
            <input
              required
              value={item.description}
              onChange={(e) => update(i, { description: e.target.value })}
            />
          </label>
          <label>
            Quantity
            <input
              type="number"
              min="1"
              max="1000"
              required
              value={item.quantity}
              onChange={(e) => update(i, { quantity: Number(e.target.value) })}
            />
          </label>
          <label>
            Unit price (PKR)
            <input
              type="number"
              min="0"
              required
              value={item.unit_price}
              onChange={(e) => update(i, { unit_price: Number(e.target.value) })}
            />
          </label>
          <button
            type="button"
            className="text-cancel"
            onClick={() => setItems(items.filter((_, n) => n !== i))}
          >
            Remove line {i + 1}
          </button>
        </fieldset>
      ))}
      <button
        className="pos-quiet"
        type="button"
        onClick={() =>
          setItems([
            ...items,
            { kind: "LABOUR", description: "", quantity: 1, unit_price: 0 },
          ])
        }
      >
        + Add line
      </button>
      <label>
        Estimate notes
        <textarea
          value={notes}
          maxLength={600}
          onChange={(e) => setNotes(e.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button className="pos-primary full" disabled={busy}>
        Save estimate revision →
      </button>
    </form>
  );
}
