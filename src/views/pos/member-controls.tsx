"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Member } from "@/types";

export default function MemberControls({ m }: { m: Member }) {
  const router = useRouter();
  const [error, setError] = useState("");

  return (
    <>
      <select
        aria-label={"Role for " + m.name}
        defaultValue={m.role}
        onChange={async (e) => {
          try {
            await api(`/shops/${m.shop_id}/members/${m.user_id}/role`, {
              role: e.target.value,
            });
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        {["SA", "TECH", "PARTS", "QC"].map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <button
        className="pos-quiet"
        onClick={async () => {
          if (!confirm((m.active ? "Deactivate " : "Reactivate ") + m.name + "→")) return;
          try {
            await api(`/shops/${m.shop_id}/members/${m.user_id}/toggle`, {
              active: !m.active,
            });
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        {m.active ? "Deactivate" : "Reactivate"}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
