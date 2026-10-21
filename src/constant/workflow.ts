import type { Role } from "@/types";

export const STAGES = [
  "PENDING",
  "CONFIRMED",
  "ASSIGNED",
  "INSPECTING",
  "ESTIMATE_REVIEW",
  "AWAITING_CUSTOMER",
  "ESTIMATE_APPROVED",
  "ESTIMATE_REJECTED",
  "PARTS_PENDING",
  "PARTS_ORDERED",
  "PARTS_READY",
  "IN_REPAIR",
  "QC_PENDING",
  "QC_IN_PROGRESS",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
] as const;
export type Status = (typeof STAGES)[number];
export const TRANSITIONS: Partial<Record<Status, Partial<Record<Status, Role>>>> = {
  PENDING: { CONFIRMED: "SA", CANCELLED: "SA" },
  CONFIRMED: { ASSIGNED: "SA" },
  ASSIGNED: { INSPECTING: "TECH" },
  INSPECTING: { ESTIMATE_REVIEW: "TECH" },
  ESTIMATE_REVIEW: { AWAITING_CUSTOMER: "SA" },
  AWAITING_CUSTOMER: { ESTIMATE_APPROVED: "CUSTOMER", ESTIMATE_REJECTED: "CUSTOMER" },
  ESTIMATE_REJECTED: { INSPECTING: "SA", CANCELLED: "SA" },
  ESTIMATE_APPROVED: { PARTS_PENDING: "SA" },
  PARTS_PENDING: { PARTS_ORDERED: "PARTS", PARTS_READY: "PARTS" },
  PARTS_ORDERED: { PARTS_READY: "PARTS" },
  PARTS_READY: { IN_REPAIR: "PARTS" },
  IN_REPAIR: { QC_PENDING: "TECH" },
  QC_PENDING: { QC_IN_PROGRESS: "QC" },
  QC_IN_PROGRESS: { READY_FOR_PICKUP: "QC", IN_REPAIR: "QC" },
  READY_FOR_PICKUP: { COMPLETED: "SA" },
};
export const CANCELLABLE = STAGES.slice(0, 11);
export const ROLE_LABELS: Record<Role, string> = {
  OWNER: "Owner",
  SA: "Service Advisor",
  TECH: "Technician",
  PARTS: "Parts Person",
  QC: "QC Inspector",
  CUSTOMER: "Customer",
};
export const label = (value: string) =>
  value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Qc", "QC");
export const money = (value: number) => "Rs " + Number(value).toLocaleString("en-PK");
export const dateTime = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    timeZone: "Asia/Karachi",
    dateStyle: "medium",
    timeStyle: "short",
  });
