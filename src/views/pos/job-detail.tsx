import Image from "next/image";
import { Status, EstimateTable, Timeline } from "@/components/ui";
import { dateTime } from "@/constant/workflow";
import type { Dashboard, Job } from "@/types";
import JobControls from "./job-controls";

export default function JobDetail({
  selected,
  data,
}: {
  selected?: Job;
  data: Dashboard;
}) {
  return (
    <aside className="job-detail">
      {selected ? (
        <>
          <div className="detail-top">
            <span>{selected.reference}</span>
            <Status value={selected.status} />
          </div>
          <div className="detail-photo">
            <Image
              src="/images/engine.jpg"
              alt="Representative vehicle inspection"
              fill
              sizes="400px"
            />
          </div>
          <h2>{selected.customer_name}</h2>
          <p>
            {selected.year} {selected.make} {selected.model} · {selected.plate}
          </p>
          <p className="mono">{dateTime(selected.scheduled_at)}</p>
          <p>{selected.notes}</p>
          <div className="detail-services">{selected.services.join(" · ")}</div>
          <JobControls key={selected.id} job={selected} data={data} />
          <EstimateTable job={selected} />
          {!!selected.required_parts.length && (
            <>
              <h3>Required parts</h3>
              {selected.required_parts.map((p) => (
                <div className="required-part" key={p.inventory_id}>
                  <b>{p.name}</b>
                  <span>
                    Need {p.needed} / Stock {p.stock}
                  </span>
                </div>
              ))}
            </>
          )}
          {selected.issues.map((i) => (
            <div className="issue-record" key={i.id}>
              <b>
                {i.resolved ? "Resolved" : "Rework required"} · {i.title}
              </b>
              <p>{i.description}</p>
            </div>
          ))}
          <Timeline job={selected} />
        </>
      ) : (
        <div className="empty">Select a booking to view its work.</div>
      )}
    </aside>
  );
}
