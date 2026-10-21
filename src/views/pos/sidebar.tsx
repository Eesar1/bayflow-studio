"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  CalendarDays,
  Package,
  Users,
  ClipboardList,
  Bell,
} from "lucide-react";
import Brand from "@/components/brand";
import { label, ROLE_LABELS } from "@/constant/workflow";
import type { Dashboard } from "@/types";

export default function PosSidebar({
  data,
  view,
  menu,
  setMenu,
  href,
}: {
  data: Dashboard;
  view: string;
  menu: boolean;
  setMenu: (value: boolean) => void;
  href: (section: string, job?: string) => string;
}) {
  const sections = [
    ["overview", "Overview", LayoutDashboard],
    ["bookings", "Bookings", CalendarDays],
    ["inventory", "Parts & inventory", Package],
    ...(data.role === "OWNER"
      ? [
          ["team", "Team management", Users],
          ["services", "Service catalog", ClipboardList],
        ]
      : []),
    ["notifications", "Notifications", Bell],
  ] as [string, string, typeof LayoutDashboard][];

  const unread = data.notifications.filter((n) => !n.read_at).length;

  return (
    <aside className={"pos-sidebar " + (menu ? "is-open" : "")}>
      <Brand />
      <div className="pos-workspace">WORKSPACE / {ROLE_LABELS[data.role]}</div>
      <nav className="pos-nav" aria-label="Workshop navigation">
        {sections.map(([key, title, Icon]) => (
          <Link
            key={key}
            className={view === key ? "active" : ""}
            href={href(String(key))}
            onClick={() => setMenu(false)}
          >
            <Icon size={18} />
            {String(title)}
            {key === "notifications" && !!unread && <b className="nav-count">{unread}</b>}
          </Link>
        ))}
        {data.role === "OWNER" && (
          <>
            <div className="pos-workspace">ROLE QUEUES</div>
            {["technician", "parts", "qc"].map((v) => (
              <Link key={v} href={href(v)}>
                {label(v)} queue
              </Link>
            ))}
          </>
        )}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-image">
          <Image src="/images/inspection.jpg" fill sizes="200px" alt="Workshop service" />
        </div>
        <p>
          Built for the work.
          <br />
          <strong>Ready for the road.</strong>
        </p>
        <span>BayFlow / DEMO WORKSPACE</span>
      </div>
    </aside>
  );
}
