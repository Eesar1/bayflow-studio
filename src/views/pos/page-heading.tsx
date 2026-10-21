import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { label } from "@/constant/workflow";
import type { Dashboard } from "@/types";

export default function PosHeading({
  data,
  view,
  isQueue,
}: {
  data: Dashboard;
  view: string;
  isQueue: boolean;
}) {
  const shop = data.shop!;

  return (
    <section className="pos-page-header">
      <div>
        <div className="eyebrow">{shop.city} / WORKSHOP OPERATIONS</div>
        <h1>
          {isQueue
            ? data.role === "TECH"
              ? "My repair jobs"
              : data.role === "QC"
                ? "Quality control queue"
                : data.role === "PARTS"
                  ? "Parts operations"
                  : "Workshop overview"
            : label(view)}
          <span className="orange">.</span>
        </h1>
        <p>{shop.name} / Every job, every handoff, in the right hands.</p>
      </div>
      <Link className="pos-primary" href={"/book/" + shop.slug}>
        Open booking page <ArrowUpRight size={16} />
      </Link>
    </section>
  );
}
