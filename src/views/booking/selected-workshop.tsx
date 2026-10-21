import Image from "next/image";
import type { Shop } from "@/types";

export default function SelectedWorkshop({ shop }: { shop: Shop }) {
  return (
    <div className="selected-workshop">
      <div className="selected-workshop-image">
        <Image
          src="/images/garage.jpg"
          alt="Representative garage interior"
          fill
          sizes="180px"
        />
      </div>
      <div>
        <div className="eyebrow dark">YOUR WORKSHOP · DEMO</div>
        <h3>{shop.name}</h3>
        <p>{shop.address}</p>
        <span>
          {shop.city} · {shop.hours_start}✓{shop.hours_end}
        </span>
      </div>
    </div>
  );
}
