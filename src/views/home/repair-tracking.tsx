import Image from "next/image";
import Link from "next/link";

export default function RepairTracking() {
  return (
    <section className="feature-section">
      <div className="container feature-layout">
        <div className="feature-photo">
          <Image
            src="/images/inspection.jpg"
            fill
            sizes="(max-width:760px) 100vw, 50vw"
            alt="Mechanic carefully servicing a vehicle"
          />
        </div>
        <div className="feature-copy">
          <div className="eyebrow dark">STAY IN THE LOOP</div>
          <h2>
            Know what is happening
            <br />
            <em>with your car.</em>
          </h2>
          <p>
            From initial inspection to final checks, see your booking status, review the
            estimate and approve work from your portal.
          </p>
          <div className="mini-timeline">
            {[
              "Booking confirmed",
              "Inspection and estimate",
              "Your approval",
              "Repair and quality check",
            ].map((s, i) => (
              <div className="mini-line" key={s}>
                <span>0{i + 1}</span>
                <div>
                  <b>{s}</b>
                </div>
              </div>
            ))}
          </div>
          <Link className="text-link" href="/customer">
            Open your customer portal →
          </Link>
        </div>
      </div>
    </section>
  );
}
