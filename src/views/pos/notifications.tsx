"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Dashboard } from "@/types";

export default function NotificationsView({ data }: { data: Dashboard }) {
  const router = useRouter();
  const [error, setError] = useState("");

  return (
    <>
      <button
        className="pos-primary"
        onClick={async () => {
          try {
            await api("/notifications/read", {});
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        Mark all as read
      </button>
      {error && <p role="alert">{error}</p>}
      {data.notifications.map((n) => (
        <article className="notification-row" key={n.id}>
          <h3>
            {!n.read_at ? "? " : ""}
            {n.title}
          </h3>
          <p>{n.detail}</p>
        </article>
      ))}
      {!data.notifications.length && <p>No notifications yet.</p>}
    </>
  );
}
