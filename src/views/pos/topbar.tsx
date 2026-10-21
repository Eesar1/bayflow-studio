"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Bell } from "lucide-react";
import Logout from "@/components/logout";
import { ROLE_LABELS } from "@/constant/workflow";
import type { Dashboard } from "@/types";

export default function PosTopbar({
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
  const router = useRouter();
  const shop = data.shop!;
  const unread = data.notifications.filter((n) => !n.read_at).length;

  return (
    <header className="pos-topbar">
      <div className="pos-top-left">
        <button
          className="mobile-pos-menu"
          aria-label={menu ? "Close navigation" : "Open navigation"}
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
        <div className="shop-switcher">
          <select
            aria-label="Switch shop"
            value={shop.id}
            onChange={(e) => router.push("/pos?shop=" + e.target.value + "&view=" + view)}
          >
            {data.shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {s.city}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="pos-top-right">
        <Link
          href={href("notifications")}
          className="top-notification"
          aria-label={"Notifications, " + unread + " unread"}
        >
          <Bell size={19} />
          {!!unread && <b>{unread}</b>}
        </Link>
        <div className="user-chip">
          <span className="avatar">{data.user.name[0]}</span>
          <div>
            <strong>{data.user.name}</strong>
            <span>{ROLE_LABELS[data.role]}</span>
          </div>
        </div>
        <Logout />
      </div>
    </header>
  );
}
