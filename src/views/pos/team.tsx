"use client";

import ApiForm from "@/components/api-form";
import { ROLE_LABELS } from "@/constant/workflow";
import MemberControls from "./member-controls";
import NewShop from "./new-shop";
import type { Dashboard } from "@/types";

export default function TeamView({ data }: { data: Dashboard }) {
  const shop = data.shop!;

  return (
    <>
      {data.role === "OWNER" ? (
        <>
          <div className="table-scroll">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Access</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {data.members.map((m) => (
                  <tr key={m.user_id}>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td>{ROLE_LABELS[m.role]}</td>
                    <td>{m.active ? "Active" : "Paused"}</td>
                    <td>
                      <MemberControls m={m} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <details className="management-form">
            <summary>Add team member</summary>
            <ApiForm path={`/shops/${shop.id}/members`} submit="Add member">
              <label>
                Full name
                <input name="name" required />
              </label>
              <label>
                Email
                <input name="email" type="email" required />
              </label>
              <label>
                Password
                <input
                  name="password"
                  type="password"
                  minLength={10}
                  required
                  autoComplete="new-password"
                />
              </label>
              <label>
                Role
                <select name="role">
                  {["SA", "TECH", "PARTS", "QC"].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </label>
            </ApiForm>
          </details>
          <NewShop />
          <details className="management-form">
            <summary>Workshop schedule</summary>
            <ApiForm path={`/shops/${shop.id}/schedule`} submit="Update schedule">
              <label>
                Opens
                <input
                  name="hours_start"
                  type="time"
                  defaultValue={shop.hours_start}
                  required
                />
              </label>
              <label>
                Closes
                <input
                  name="hours_end"
                  type="time"
                  defaultValue={shop.hours_end}
                  required
                />
              </label>
              <label>
                Slot minutes
                <select name="slot_minutes" defaultValue={shop.slot_minutes}>
                  {[30, 45, 60, 90, 120].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label>
                Capacity
                <input
                  name="capacity"
                  type="number"
                  min="1"
                  max="20"
                  defaultValue={shop.capacity}
                />
              </label>
            </ApiForm>
          </details>
        </>
      ) : (
        <p>Only the owner manages team membership.</p>
      )}
    </>
  );
}
