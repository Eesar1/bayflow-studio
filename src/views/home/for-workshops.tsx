import Link from "next/link";

export default function ForWorkshops() {
  return (
    <section className="business-banner" id="business">
      <div className="container business-inner">
        <div>
          <div className="eyebrow">FOR THE PEOPLE BEHIND THE WORK</div>
          <h2>
            Your entire workshop.
            <br />
            <em>One clear view.</em>
          </h2>
          <p>
            Bookings, assignments, estimates, parts and quality checks. Connected from
            front desk to final handover.
          </p>
          <div className="business-actions">
            <Link href="/signup" className="button button-light">
              Create a workshop account →
            </Link>
            <Link href="/login" className="button button-outline-light">
              Workshop sign in →
            </Link>
          </div>
        </div>
        <div className="business-card">
          <div className="business-card-top">
            <span>WORKSHOP OPERATIONS</span>
            <b>JOB FLOW</b>
          </div>
          {[
            ["ADVISOR", "Confirm & assign"],
            ["TECHNICIAN", "Inspect & estimate"],
            ["PARTS PERSON", "Source & allocate"],
            ["QC INSPECTOR", "Inspect & sign off"],
          ].map(([role, text], index) => (
            <div className="business-record" key={role}>
              <span>{role}</span>
              <strong>{text}</strong>
              <small aria-hidden="true">0{index + 1}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
