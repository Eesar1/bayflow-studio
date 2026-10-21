import { CANCELLABLE, type Status } from "@/constant/workflow";
import type { Job, Dashboard } from "@/types";
import ApiForm from "@/components/api-form";
import JobAction from "@/components/job-action";
import EstimateEditor from "./estimate-editor";
import QCForm from "./qc-form";
import PurchaseForm from "./purchase-form";
import BookingHandoff from "@/components/booking-handoff";

export default function JobControls({ job, data }: { job: Job; data: Dashboard }) {
  const s = job.status;
  const role = data.role;
  const advisor = role === "SA" || role === "OWNER";
  const tech = role === "TECH" && job.technician_id === data.user.id;
  const parts = role === "PARTS" && job.parts_person_id === data.user.id;
  const qc =
    (role === "QC" || role === "OWNER") &&
    (!job.qc_inspector_id || job.qc_inspector_id === data.user.id);

  return (
    <div className="workflow-actions">
      <div className="eyebrow">NEXT VALID ACTION</div>
      <BookingHandoff job={job} staff />
      {s === "PENDING" && advisor && (
        <JobAction id={job.id} target="CONFIRMED">
          Confirm booking
        </JobAction>
      )}
      {s === "CONFIRMED" && advisor && (
        <ApiForm path={`/bookings/${job.id}/transition`} submit="Assign technician">
          <input type="hidden" name="target" value="ASSIGNED" />
          <label>
            Technician
            <select name="technician_id" required>
              <option value="">Select technician</option>
              {data.members
                .filter((m) => m.active && m.role === "TECH")
                .map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </label>
        </ApiForm>
      )}
      {s === "ASSIGNED" && tech && (
        <JobAction id={job.id} target="INSPECTING">
          Start inspection
        </JobAction>
      )}
      {((s === "INSPECTING" && tech) || (s === "ESTIMATE_REVIEW" && advisor)) && (
        <EstimateEditor
          key={job.id + "-" + job.estimate_revision}
          job={job}
          data={data}
        />
      )}
      {s === "INSPECTING" && tech && job.estimate && (
        <JobAction id={job.id} target="ESTIMATE_REVIEW">
          Submit to advisor
        </JobAction>
      )}
      {s === "ESTIMATE_REVIEW" && advisor && (
        <JobAction id={job.id} target="AWAITING_CUSTOMER">
          Send estimate to customer
        </JobAction>
      )}
      {s === "ESTIMATE_REJECTED" && advisor && (
        <JobAction id={job.id} target="INSPECTING">
          Return for revised estimate
        </JobAction>
      )}
      {s === "ESTIMATE_APPROVED" && advisor && (
        <ApiForm path={`/bookings/${job.id}/transition`} submit="Assign parts person">
          <input type="hidden" name="target" value="PARTS_PENDING" />
          <label>
            Parts person
            <select name="parts_person_id" required>
              <option value="">Select parts person</option>
              {data.members
                .filter((m) => m.active && m.role === "PARTS")
                .map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </label>
        </ApiForm>
      )}
      {["PARTS_PENDING", "PARTS_ORDERED"].includes(s) && parts && (
        <>
          <PurchaseForm job={job} />
          <p className="workflow-hint">
            Receive purchase orders under Parts & inventory.
          </p>
          {s === "PARTS_PENDING" && (
            <JobAction id={job.id} target="PARTS_ORDERED">
              Mark parts ordered
            </JobAction>
          )}
          <JobAction id={job.id} target="PARTS_READY">
            Verify parts ready
          </JobAction>
        </>
      )}
      {s === "PARTS_READY" && parts && (
        <JobAction id={job.id} target="IN_REPAIR">
          Allocate parts & start repair
        </JobAction>
      )}
      {s === "IN_REPAIR" && tech && (
        <JobAction id={job.id} target="QC_PENDING">
          Repair complete · Send to QC
        </JobAction>
      )}
      {s === "QC_PENDING" && qc && (
        <JobAction id={job.id} target="QC_IN_PROGRESS">
          Claim QC inspection
        </JobAction>
      )}
      {s === "QC_IN_PROGRESS" && qc && <QCForm job={job} />}
      {s === "READY_FOR_PICKUP" &&
        advisor &&
        (job.ready_notified ? (
          <JobAction id={job.id} target="COMPLETED" confirmation>
            Mark vehicle collected
          </JobAction>
        ) : (
          <JobAction id={job.id} notice>
            Notify customer for pickup
          </JobAction>
        ))}
      {s === "COMPLETED" && (
        <p className="workflow-notice success">Completed. Vehicle handed over.</p>
      )}
      {CANCELLABLE.includes(s as Status) && advisor && (
        <JobAction id={job.id} target="CANCELLED" confirmation>
          Cancel booking
        </JobAction>
      )}
    </div>
  );
}
