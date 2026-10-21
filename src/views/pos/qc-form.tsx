"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Job } from "@/types";

export default function QCForm({ job }: { job: Job }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const target = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
    setBusy(true);
    setError("");
    try {
      await api(`/bookings/${job.id}/transition`, {
        target,
        qc_checks: {
          brakes: fd.has("brakes"),
          fluids: fd.has("fluids"),
          road_test: fd.has("road_test"),
        },
        qc_notes: fd.get("qc_notes"),
        issue_title: fd.get("issue_title"),
        issue_description: fd.get("issue_description"),
      });
      router.refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="qc-issue" onSubmit={submit}>
      <h3>Final quality check</h3>
      {[
        ["brakes", "Brake response and safety"],
        ["fluids", "No fluid leaks or unsecured parts"],
        ["road_test", "Road test and final operation"],
      ].map(([name, title]) => (
        <label className="qc-check" key={name}>
          <input type="checkbox" name={name} />
          {title} passed
        </label>
      ))}
      <label>
        Inspector notes
        <textarea name="qc_notes" maxLength={600} />
      </label>
      <button
        className="pos-primary full"
        name="outcome"
        value="READY_FOR_PICKUP"
        disabled={busy}
      >
        Pass QC →
      </button>
      <label>
        Rework issue title
        <input name="issue_title" maxLength={180} />
      </label>
      <label>
        Rework details
        <textarea name="issue_description" maxLength={1000} />
      </label>
      <button
        className="pos-quiet danger full"
        name="outcome"
        value="IN_REPAIR"
        disabled={busy}
      >
        Fail QC · Return to technician
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
