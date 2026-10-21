"use client";

import { useState } from "react";
import LiveRefresh from "@/components/live-refresh";
import type { Dashboard } from "@/types";
import PosSidebar from "./sidebar";
import PosTopbar from "./topbar";
import PosHeading from "./page-heading";
import PosOnboarding from "./onboarding";
import BookingQueue from "./booking-queue";
import Management from "./management";

export default function PosMain({
  data,
  view,
  selectedId,
}: {
  data: Dashboard;
  view: string;
  selectedId?: string;
}) {
  const [menu, setMenu] = useState(false);
  const shop = data.shop;
  const href = (section: string, job?: string) =>
    "/pos?shop=" + shop?.id + "&view=" + section + (job ? "&job=" + job : "");
  const isQueue = ["overview", "bookings", "technician", "parts", "qc"].includes(view);

  if (!shop) return <PosOnboarding data={data} />;

  return (
    <div className="pos-shell">
      <LiveRefresh />
      <PosSidebar data={data} view={view} menu={menu} setMenu={setMenu} href={href} />
      <div className="pos-core">
        <PosTopbar data={data} view={view} menu={menu} setMenu={setMenu} href={href} />
        <main id="main" className="pos-content">
          <PosHeading data={data} view={view} isQueue={isQueue} />
          {isQueue ? (
            <BookingQueue data={data} view={view} selectedId={selectedId} href={href} />
          ) : (
            <section className="management-panel">
              <Management data={data} view={view} />
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
