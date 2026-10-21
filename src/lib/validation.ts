import { z } from "zod";
import { STAGES } from "@/constant/workflow";

const text = (max = 120) => z.string().trim().min(1).max(max);
const int = (max = 100000000) => z.coerce.number().int().min(0).max(max);
const hours = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
export const scheduleSchema = z
  .object({
    hours_start: hours,
    hours_end: hours,
    slot_minutes: z.coerce.number().refine((v) => [30, 45, 60, 90, 120].includes(v)),
    capacity: z.coerce.number().int().min(1).max(20),
  })
  .refine((d) => d.hours_end > d.hours_start, "Closing time must follow opening time.");
export const shopSchema = z
  .object({
    name: text(),
    city: text(100),
    address: text(255),
    phone: text(40),
    description: z.string().max(500).default(""),
    hours_start: hours.default("09:00"),
    hours_end: hours.default("18:00"),
    slot_minutes: z.coerce.number().default(60),
    capacity: z.coerce.number().default(2),
  })
  .refine((d) => scheduleSchema.safeParse(d).success, "Invalid schedule.");
export const serviceSchema = z.object({
  name: text(),
  description: z.string().max(255).default(""),
  minutes: z.coerce.number().int().min(15).max(480).default(60),
  base_price: int().default(0),
});
export const inventorySchema = z.object({
  name: text(),
  sku: text(40),
  quantity: int(1000000).default(0),
  unit_cost: int().default(0),
  reorder_level: int(1000000).default(2),
});
export const memberSchema = z.object({
  name: text(),
  email: z.email().toLowerCase(),
  password: z.string().min(10).max(128),
  role: z.enum(["SA", "TECH", "PARTS", "QC"]),
});
export const bookingSchema = z.object({
  shop_id: text(),
  service_ids: z
    .array(text())
    .min(1)
    .max(8)
    .refine((a) => new Set(a).size === a.length),
  scheduled_at: z
    .string()
    .refine(
      (v) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\+05:00$/.test(v) && !isNaN(Date.parse(v)),
      "Use a Pakistan-time slot.",
    ),
  notes: z.string().max(1200).default(""),
  name: text(100),
  email: z.email().toLowerCase(),
  password: z.string().max(128).optional(),
  phone: z.string().max(40).default(""),
  plate: text(32),
  make: text(60),
  model: text(60),
  year: z.coerce
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1),
  color: z.string().max(40).default(""),
  mileage: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    int(2000000).optional(),
  ),
});
export const estimateSchema = z.object({
  notes: z.string().max(600).default(""),
  items: z
    .array(
      z.object({
        kind: z.enum(["PART", "LABOUR"]),
        description: text(180),
        inventory_id: z.string().nullable().optional(),
        quantity: z.coerce.number().int().min(1).max(1000),
        unit_price: int(),
      }),
    )
    .min(1)
    .max(30),
});
export const moveSchema = z.object({
  target: z.enum(STAGES),
  note: z.string().max(500).optional(),
  technician_id: z.string().optional(),
  parts_person_id: z.string().optional(),
  issue_title: z.string().max(180).optional(),
  issue_description: z.string().max(1000).optional(),
  qc_notes: z.string().max(600).optional(),
  qc_checks: z
    .object({ brakes: z.boolean(), fluids: z.boolean(), road_test: z.boolean() })
    .strict()
    .optional(),
});
export const orderSchema = z.object({
  supplier: text(120),
  items: z
    .array(
      z.object({
        inventory_id: text(),
        quantity: z.coerce.number().int().min(1).max(1000),
      }),
    )
    .min(1)
    .max(30),
});
export const receiptSchema = z.object({
  quantities: z.record(z.string(), z.coerce.number().int().min(0).max(1000)),
});
