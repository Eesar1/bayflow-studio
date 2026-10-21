"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function JobAction({
  id,
  target,
  children,
  confirmation = false,
  notice = false,
}: {
  id: string;
  target?: string;
  children: React.ReactNode;
  confirmation?: boolean;
  notice?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <>
      <button
        className={
          "button " + (target === "CANCELLED" ? "button-cancel" : "button-primary")
        }
        disabled={busy}
        onClick={async () => {
          if (confirmation && !confirm(String(children) + "?")) return;
          setBusy(true);
          setError("");
          try {
            await api(
              `/bookings/${id}/${notice ? "ready-notice" : "transition"}`,
              notice ? {} : { target },
            );
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Updating…" : children}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
