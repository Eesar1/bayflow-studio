"use client";

import { useState, type ReactNode, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function ApiForm({
  path,
  children,
  submit = "Save",
  className = "form-grid",
  onSaved,
}: {
  path: string;
  children: ReactNode;
  submit?: string;
  className?: string;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");

  async function handle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const result = await api<{ redirect?: string }>(
        path,
        Object.fromEntries(new FormData(form)),
      );
      if (result.redirect) window.location.href = result.redirect;
      else {
        setSuccess("Saved successfully.");
        onSaved?.();
        router.refresh();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={className} onSubmit={handle}>
      {children}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {success && <p role="status">{success}</p>}
      <button className="button button-primary" type="submit" disabled={busy}>
        {busy ? "Saving…" : submit} →
      </button>
    </form>
  );
}
