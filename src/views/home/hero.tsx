import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function Hero({ city }: { city: string }) {
  return (
    <header className="hero">
      <div className="hero-visual">
        <Image
          src="/images/hero.jpg"
          alt="Mechanics at work inside a repair workshop"
          fill
          sizes="(max-width:760px) 100vw, 60vw"
          priority
        />
      </div>
      <div className="container hero-inner">
        <div className="hero-copy">
          <div className="eyebrow dark">
            <span className="eyebrow-line" /> EVERY REPAIR, IN FLOW
          </div>
          <h1>
            Your workshop,
            <br />
            <em>organized.</em>
          </h1>
          <p>
            Book services, get transparent estimates, track repairs, and stay updated ·
            all in one place.
          </p>
          <form className="hero-search" action="/shops">
            <label>
              <span>YOUR LOCATION</span>
              <input
                name="city"
                defaultValue={city}
                placeholder="Enter your city"
                aria-label="Search workshops by city"
              />
            </label>
            <button className="button button-primary">
              Find a shop <ArrowUpRight size={18} />
            </button>
          </form>
          <div className="hero-points">
            <span>✓ Transparent estimates</span>
            <span>✓ Live repair updates</span>
          </div>
        </div>
        <div className="hero-floating">
          <div className="floating-top">FROM FIRST BOOKING</div>
          <strong>
            Real work.
            <br />
            Clear progress.
          </strong>
          <span>To back on the road.</span>
        </div>
      </div>
    </header>
  );
}
