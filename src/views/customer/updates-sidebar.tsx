import Image from "next/image";
import type { Notice } from "@/types";

export default function UpdatesSidebar({ notifications }: { notifications: Notice[] }) {
  return (
    <aside className="customer-sidebar">
      <div className="customer-side-image">
        <Image
          src="/images/garage.jpg"
          fill
          sizes="350px"
          alt="Vehicle inside a workshop"
        />
      </div>
      <div className="customer-side-copy">
        <div className="eyebrow dark">IN THE LOOP</div>
        <h3>Latest updates</h3>
        {notifications.map((n) => (
          <div className="side-line" key={n.id}>
            <b>{n.title}</b>
            <p>{n.detail}</p>
          </div>
        ))}
        {!notifications.length && <p>Workshop updates will appear here.</p>}
      </div>
    </aside>
  );
}
