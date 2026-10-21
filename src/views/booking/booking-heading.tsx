import Link from "next/link";

export default function BookingHeading({ step }: { step: number }) {
  return (
    <>
      <div className="back-line">
        <Link href="/#workshops">← ALL WORKSHOPS</Link>
        <span>BOOKING A SERVICE</span>
      </div>
      <div className="book-heading">
        <div>
          <div className="eyebrow dark">LET US GET YOU BACK ON THE ROAD</div>
          <h1>
            Book your service<span className="orange">.</span>
          </h1>
        </div>
        <ol className="booking-progress">
          {["Services", "Date & time", "Your vehicle", "Review"].map((v, i) => (
            <li
              key={v}
              className={
                "wizard-step " +
                (step === i + 1 ? "active" : step > i + 1 ? "completed" : "")
              }
              aria-current={step === i + 1 ? "step" : undefined}
            >
              <span>0{i + 1}</span>
              <b>{v}</b>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
