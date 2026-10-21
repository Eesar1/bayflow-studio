import { dateTime, STAGES, CANCELLABLE } from "@/constant/workflow";
import { Status, EstimateTable, Timeline } from "@/components/ui";
import JobAction from "@/components/job-action";
import type { Job } from "@/types";
import BookingHandoff from "@/components/booking-handoff";

export default function BookingCard({ job }: { job: Job }) {
  return (
    <article className="customer-job" key={job.id}>
      <div className="customer-job-top">
        <div>
          <span className="mono">{job.reference}</span>
          <h2>
            {job.make} {job.model} <small>{job.year}</small>
          </h2>
          <p>
            {job.plate} · {dateTime(job.scheduled_at)}
          </p>
        </div>
        <Status value={job.status} />
      </div>
      <div className="customer-timeline">
        {["Booked", "Confirmed", "Inspection", "Repair", "Pickup"].map((title, i) => {
          const thresholds = [0, 1, 3, 11, 14];

          return (
            <div
              key={title}
              className={
                "timeline-part " +
                (job.status !== "CANCELLED" &&
                STAGES.indexOf(job.status as (typeof STAGES)[number]) >= thresholds[i]
                  ? "active"
                  : "")
              }
            >
              <span>0{i + 1}</span>
              <b>{title}</b>
            </div>
          );
        })}
      </div>
      <BookingHandoff job={job} />
      <EstimateTable job={job} />
      {job.status === "AWAITING_CUSTOMER" && (
        <div className="estimate-actions">
          <JobAction id={job.id} target="ESTIMATE_APPROVED" confirmation>
            Accept estimate
          </JobAction>
          <JobAction id={job.id} target="ESTIMATE_REJECTED" confirmation>
            Reject estimate
          </JobAction>
        </div>
      )}
      {job.status === "READY_FOR_PICKUP" && (
        <div className="pickup-note">
          <strong>
            {job.ready_notified
              ? "Your vehicle is ready to collect."
              : "QC passed. Waiting for the advisor’s pickup notice."}
          </strong>
          {job.ready_notified && (
            <JobAction id={job.id} target="COMPLETED" confirmation>
              I collected my vehicle
            </JobAction>
          )}
        </div>
      )}
      <div className="customer-job-bottom">
        <Timeline job={job} />
        {CANCELLABLE.includes(job.status as (typeof STAGES)[number]) && (
          <JobAction id={job.id} target="CANCELLED" confirmation>
            Cancel booking
          </JobAction>
        )}
      </div>
    </article>
  );
}
