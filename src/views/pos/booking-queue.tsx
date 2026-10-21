"use client";

import { useState } from "react";
import type { Dashboard } from "@/types";
import JobsTable from "./jobs-table";
import JobDetail from "./job-detail";
import OwnerOverview from "./owner-overview";

export default function BookingQueue({
  data,
  view,
  selectedId,
  href,
}: {
  data: Dashboard;
  view: string;
  selectedId?: string;
  href: (section: string, job?: string) => string;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const roleQueue = data.bookings.filter((b) =>
    view === "technician"
      ? !!b.technician_id
      : view === "qc"
        ? ["QC_PENDING", "QC_IN_PROGRESS"].includes(b.status)
        : view === "parts"
          ? ["PARTS_PENDING", "PARTS_ORDERED", "PARTS_READY"].includes(b.status)
          : true,
  );
  const jobs = roleQueue.filter(
    (b) =>
      (!filter || b.status === filter) &&
      [b.reference, b.customer_name, b.make, b.model, b.plate]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const selected = jobs.find((b) => b.id === selectedId) ?? jobs[0];
  const counts = [
    ["VISIBLE JOBS", data.bookings.length],
    [
      "AWAITING APPROVAL",
      data.bookings.filter((b) => b.status === "AWAITING_CUSTOMER").length,
    ],
    ["IN REPAIR", data.bookings.filter((b) => b.status === "IN_REPAIR").length],
    [
      "QC PENDING",
      data.bookings.filter((b) => ["QC_PENDING", "QC_IN_PROGRESS"].includes(b.status))
        .length,
    ],
    [
      "READY FOR PICKUP",
      data.bookings.filter((b) => b.status === "READY_FOR_PICKUP").length,
    ],
  ];

  return (
    <>
      {view === "overview" && data.role === "OWNER" && <OwnerOverview data={data} />}
      <div className="metrics-row">
        {counts.map(([title, count]) => (
          <div className="metric" key={title}>
            <span>{title}</span>
            <strong>{String(count).padStart(2, "0")}</strong>
            <small>This workshop and role</small>
          </div>
        ))}
      </div>
      <div className="workbench">
        <JobsTable
          jobs={jobs}
          selected={selected}
          view={view}
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          href={href}
        />
        <JobDetail selected={selected} data={data} />
      </div>
    </>
  );
}
