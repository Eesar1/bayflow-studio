import { CalendarDays, ClipboardCheck, MessagesSquare, CarFront } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="how-section" id="how">
      <div className="container">
        <div className="how-top">
          <div className="eyebrow">FROM BOOKING TO PICKUP</div>
          <h2>
            Less waiting.
            <br />
            <em>More moving.</em>
          </h2>
          <p>Know what comes next, without chasing your workshop for an update.</p>
        </div>
        <div className="step-grid">
          {[
            [
              CalendarDays,
              "Book",
              "Choose a workshop, select your services and book an available time.",
            ],
            [
              ClipboardCheck,
              "Approve",
              "Review the itemized parts and labour estimate before any repair.",
            ],
            [
              MessagesSquare,
              "Track",
              "Follow inspection, parts, repair and final quality checks.",
            ],
            [
              CarFront,
              "Pick up",
              "Get notified when your vehicle is ready and confirm collection.",
            ],
          ].map(([Icon, title, description], i) => {
            const Symbol = Icon as typeof CalendarDays;

            return (
              <div className="step-item" key={String(title)}>
                <span className="step-num">0{i + 1}</span>
                <Symbol size={27} />
                <h3>{String(title)}.</h3>
                <p>{String(description)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
