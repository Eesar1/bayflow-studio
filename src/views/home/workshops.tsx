import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Shop } from "@/types";

export default function Workshops({
  shops,
}: {
  shops: (Shop & { services: string[] })[];
}) {
  return (
    <section className="section shops-section" id="workshops">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow dark">FIND YOUR WORKSHOP</div>
            <h2>
              Care around
              <br />
              <em>the corner.</em>
            </h2>
          </div>
          <p>
            Explore workshops in Lahore, Islamabad and Karachi. These are fictional demo
            locations; photographs are representative.
          </p>
        </div>
        <div className="shop-grid">
          {shops.map((s, i) => (
            <Link className="shop-card" href={"/book/" + s.slug} key={s.id}>
              <div className="shop-image-link">
                <Image
                  src={
                    ["/images/garage.jpg", "/images/shop2.jpg", "/images/engine.jpg"][
                      i % 3
                    ]
                  }
                  alt="Representative automotive workshop"
                  fill
                  sizes="(max-width:760px) 100vw, 33vw"
                />
                <span className="photo-index">0{i + 1}</span>
              </div>
              <div className="shop-card-content">
                <div className="shop-topline">
                  <span>{s.city} · DEMO WORKSHOP</span>
                  <span className="shop-rating">Rating not yet available</span>
                </div>
                <h3>{s.name}</h3>
                <p>{s.address}</p>
                <div className="shop-tags">
                  {s.services.slice(0, 3).map((v) => (
                    <span key={v}>{v}</span>
                  ))}
                </div>
                <span className="shop-link">
                  View workshop & book <ArrowUpRight size={18} aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        {!shops.length && (
          <div className="empty">
            <h3>No workshops found.</h3>
            <p>
              Try another city or <Link href="/shops">show all workshops</Link>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
