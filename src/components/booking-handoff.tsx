import { ROLE_LABELS, TRANSITIONS, type Status } from "@/constant/workflow";
import type { Job } from "@/types";

const NEXT_STEP: Record<Status, string> = {
  PENDING: "The service advisor will confirm your booking.",
  CONFIRMED: "The service advisor will assign a technician.",
  ASSIGNED: "The assigned technician must sign in and start the inspection.",
  INSPECTING:
    "The assigned technician prepares an estimate and submits it to the advisor.",
  ESTIMATE_REVIEW: "The advisor reviews the estimate and sends it to the customer.",
  AWAITING_CUSTOMER:
    "The customer must sign in to My bookings and accept or reject the estimate. Workshop staff cannot approve it for them.",
  ESTIMATE_APPROVED: "The advisor assigns a parts person to prepare the approved work.",
  ESTIMATE_REJECTED:
    "The advisor returns the job to the technician for a revised estimate.",
  PARTS_PENDING: "The assigned parts person checks stock and orders missing parts.",
  PARTS_ORDERED:
    "The parts person receives deliveries in Parts & inventory, then verifies all required parts are ready.",
  PARTS_READY:
    "The assigned parts person allocates stock and releases the job for repair.",
  IN_REPAIR: "The assigned technician completes repairs and sends the vehicle to QC.",
  QC_PENDING: "A QC inspector claims the inspection before checking the vehicle.",
  QC_IN_PROGRESS:
    "The QC inspector records the result. Failed checks return the job for repair and another inspection.",
  READY_FOR_PICKUP:
    "The advisor sends the pickup notice. Collection can then be confirmed by the advisor or customer.",
  COMPLETED: "Vehicle collected. This booking is complete.",
  CANCELLED: "This booking was cancelled. Book another service when you are ready.",
};

export default function BookingHandoff({
  job,
  staff = false,
}: {
  job: Job;
  staff?: boolean;
}) {
  const status = job.status as Status;
  const role = Object.values(TRANSITIONS[status] ?? {})[0];
  const person =
    role === "CUSTOMER"
      ? job.customer_name
      : role === "TECH"
        ? job.technician_name
        : null;

  return (
    <div className="booking-handoff">
      <strong>
        {role
          ? `Next: ${ROLE_LABELS[role]}${person ? " · " + person : ""}`
          : "Booking closed"}
      </strong>
      <p>{NEXT_STEP[status]}</p>
      {staff && role === "CUSTOMER" && (
        <small>Customer account: {job.customer_email}</small>
      )}
    </div>
  );
}
