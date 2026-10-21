"use client";

import { ROLE_LABELS } from "@/constant/workflow";
import type { Role } from "@/types";

const DEMO_ROLES: { role: Role; login: string }[] = [
  { role: "OWNER", login: "owner" },
  { role: "SA", login: "advisor" },
  { role: "TECH", login: "technician" },
  { role: "PARTS", login: "parts" },
  { role: "QC", login: "qc" },
  { role: "CUSTOMER", login: "customer" },
];

export default function DemoAccounts({
  onSelect,
}: {
  onSelect: (email: string, password: string) => void;
}) {
  return (
    <div className="demo-accounts">
      <b>EXPLORE THE DEMO</b>
      <p>Fictional accounts. Password: BayflowDemo2026!</p>
      <div>
        {DEMO_ROLES.map(({ role, login }) => (
          <button
            key={role}
            type="button"
            onClick={() => onSelect(login + "@bayflow.demo", "BayflowDemo2026!")}
          >
            {ROLE_LABELS[role]}
          </button>
        ))}
      </div>
    </div>
  );
}
