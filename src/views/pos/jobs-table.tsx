"use client";

import Link from "next/link";
import { Status } from "@/components/ui";
import { STAGES, label } from "@/constant/workflow";
import type { Job } from "@/types";

export default function JobsTable({
  jobs,
  selected,
  view,
  search,
  setSearch,
  filter,
  setFilter,
  href,
}: {
  jobs: Job[];
  selected?: Job;
  view: string;
  search: string;
  setSearch: (value: string) => void;
  filter: string;
  setFilter: (value: string) => void;
  href: (section: string, job?: string) => string;
}) {
  return (
    <section className="jobs-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-overline">OPERATIONS / QUEUE</span>
          <h2>Live repair jobs</h2>
        </div>
        <div className="table-filters">
          <input
            type="search"
            placeholder="Customer, vehicle, job…"
            aria-label="Search jobs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter booking status"
          >
            <option value="">All statuses</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="table-scroll">
        <table className="jobs-table">
          <thead>
            <tr>
              <th>Booking / Customer</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Technician</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {jobs.map((b) => (
              <tr key={b.id} className={selected?.id === b.id ? "selected-job" : ""}>
                <td>
                  <Link className="job-reference" href={href(view, b.id)}>
                    {b.reference}
                  </Link>
                  <small>{b.customer_name}</small>
                </td>
                <td>
                  {b.make} {b.model}
                  <small>
                    {b.year} · {b.plate}
                  </small>
                </td>
                <td>
                  <Status value={b.status} />
                </td>
                <td>{b.technician_name ?? "Unassigned"}</td>
                <td>
                  <Link href={href(view, b.id)} aria-label={"Open " + b.reference}>
                    →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!jobs.length && (
        <div className="empty">
          <p>No jobs match this queue.</p>
        </div>
      )}
    </section>
  );
}
