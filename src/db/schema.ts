import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  unique,
  index,
  primaryKey,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const id = () => text("id").primaryKey();
const created = () =>
  timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull();
export const user = pgTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  kind: text("kind").default("CUSTOMER").notNull(),
  phone: text("phone").default("").notNull(),
});
export const session = pgTable("sessions", {
  id: id(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
export const account = pgTable("accounts", {
  id: id(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const verification = pgTable("verifications", {
  id: id(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const shops = pgTable(
  "shops",
  {
    id: id(),
    owner_id: text("owner_id")
      .notNull()
      .references(() => user.id),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    city: text("city").notNull(),
    address: text("address").notNull(),
    phone: text("phone").notNull(),
    description: text("description").notNull().default(""),
    hours_start: text("hours_start").default("09:00").notNull(),
    hours_end: text("hours_end").default("18:00").notNull(),
    slot_minutes: integer("slot_minutes").default(60).notNull(),
    capacity: integer("capacity").default(2).notNull(),
    created_at: created(),
  },
  (t) => [check("capacity_positive", sql`${t.capacity} > 0`)],
);
export const memberships = pgTable(
  "memberships",
  {
    shop_id: text("shop_id")
      .notNull()
      .references(() => shops.id),
    user_id: text("user_id")
      .notNull()
      .references(() => user.id),
    role: text("role").notNull(),
    active: boolean("active").default(true).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.shop_id, t.user_id] }),
    check("membership_role", sql`${t.role} in ('SA','TECH','PARTS','QC')`),
  ],
);
export const services = pgTable("services", {
  id: id(),
  shop_id: text("shop_id")
    .notNull()
    .references(() => shops.id),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  minutes: integer("minutes").notNull().default(60),
  base_price: integer("base_price").notNull().default(0),
});
export const inventory = pgTable(
  "inventory",
  {
    id: id(),
    shop_id: text("shop_id")
      .notNull()
      .references(() => shops.id),
    sku: text("sku").notNull(),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull().default(0),
    reorder_level: integer("reorder_level").notNull().default(2),
    unit_cost: integer("unit_cost").notNull().default(0),
  },
  (t) => [
    unique().on(t.shop_id, t.sku),
    check("stock_nonnegative", sql`${t.quantity} >= 0`),
  ],
);
export const vehicles = pgTable("vehicles", {
  id: id(),
  customer_id: text("customer_id")
    .notNull()
    .references(() => user.id),
  plate: text("plate").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  color: text("color").default(""),
  mileage: integer("mileage"),
});
export const bookings = pgTable(
  "bookings",
  {
    id: id(),
    reference: text("reference").notNull().unique(),
    shop_id: text("shop_id")
      .notNull()
      .references(() => shops.id),
    customer_id: text("customer_id")
      .notNull()
      .references(() => user.id),
    vehicle_id: text("vehicle_id")
      .notNull()
      .references(() => vehicles.id),
    scheduled_at: timestamp("scheduled_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    notes: text("notes").notNull().default(""),
    status: text("status").notNull().default("PENDING"),
    technician_id: text("technician_id").references(() => user.id),
    parts_person_id: text("parts_person_id").references(() => user.id),
    qc_inspector_id: text("qc_inspector_id").references(() => user.id),
    estimate_revision: integer("estimate_revision").default(0).notNull(),
    ready_notified: boolean("ready_notified").default(false).notNull(),
    created_at: created(),
    updated_at: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("bookings_shop_slot").on(t.shop_id, t.scheduled_at)],
);
export const bookingServices = pgTable(
  "booking_services",
  {
    booking_id: text("booking_id")
      .notNull()
      .references(() => bookings.id),
    service_id: text("service_id")
      .notNull()
      .references(() => services.id),
  },
  (t) => [primaryKey({ columns: [t.booking_id, t.service_id] })],
);
export const estimates = pgTable(
  "estimates",
  {
    id: id(),
    booking_id: text("booking_id")
      .notNull()
      .references(() => bookings.id),
    revision: integer("revision").notNull(),
    status: text("status").default("DRAFT").notNull(),
    notes: text("notes").default("").notNull(),
    total: integer("total").notNull(),
    created_by: text("created_by")
      .notNull()
      .references(() => user.id),
    created_at: created(),
  },
  (t) => [unique().on(t.booking_id, t.revision)],
);
export const estimateItems = pgTable(
  "estimate_items",
  {
    id: id(),
    estimate_id: text("estimate_id")
      .notNull()
      .references(() => estimates.id),
    kind: text("kind").notNull(),
    description: text("description").notNull(),
    inventory_id: text("inventory_id").references(() => inventory.id),
    quantity: integer("quantity").notNull(),
    unit_price: integer("unit_price").notNull(),
  },
  (t) => [
    check("estimate_positive_qty", sql`${t.quantity} > 0`),
    check("estimate_nonnegative_cost", sql`${t.unit_price} >= 0`),
  ],
);
export const purchaseOrders = pgTable("purchase_orders", {
  id: id(),
  reference: text("reference").notNull().unique(),
  shop_id: text("shop_id")
    .notNull()
    .references(() => shops.id),
  booking_id: text("booking_id")
    .notNull()
    .references(() => bookings.id),
  supplier: text("supplier").notNull(),
  status: text("status").notNull().default("ORDERED"),
  created_by: text("created_by")
    .notNull()
    .references(() => user.id),
  created_at: created(),
});
export const purchaseItems = pgTable(
  "purchase_items",
  {
    id: id(),
    po_id: text("po_id")
      .notNull()
      .references(() => purchaseOrders.id),
    inventory_id: text("inventory_id")
      .notNull()
      .references(() => inventory.id),
    quantity: integer("quantity").notNull(),
    received: integer("received").notNull().default(0),
  },
  (t) => [
    check(
      "purchase_valid_qty",
      sql`${t.quantity} > 0 and ${t.received} >= 0 and ${t.received} <= ${t.quantity}`,
    ),
  ],
);
export const allocations = pgTable("allocations", {
  id: id(),
  booking_id: text("booking_id")
    .notNull()
    .references(() => bookings.id),
  inventory_id: text("inventory_id")
    .notNull()
    .references(() => inventory.id),
  quantity: integer("quantity").notNull(),
  released: boolean("released").notNull().default(false),
});
export const qcIssues = pgTable("qc_issues", {
  id: id(),
  booking_id: text("booking_id")
    .notNull()
    .references(() => bookings.id),
  inspector_id: text("inspector_id")
    .notNull()
    .references(() => user.id),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  resolved: boolean("resolved").notNull().default(false),
  created_at: created(),
});
export const qcReports = pgTable("qc_reports", {
  id: id(),
  booking_id: text("booking_id")
    .notNull()
    .references(() => bookings.id),
  inspector_id: text("inspector_id")
    .notNull()
    .references(() => user.id),
  outcome: text("outcome").notNull(),
  checklist: text("checklist").notNull(),
  notes: text("notes").default("").notNull(),
  created_at: created(),
});
export const history = pgTable("history", {
  id: id(),
  booking_id: text("booking_id")
    .notNull()
    .references(() => bookings.id),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id),
  from_status: text("from_status").notNull(),
  to_status: text("to_status").notNull(),
  note: text("note").default("").notNull(),
  created_at: created(),
});
export const notifications = pgTable("notifications", {
  id: id(),
  user_id: text("user_id")
    .notNull()
    .references(() => user.id),
  shop_id: text("shop_id").references(() => shops.id),
  booking_id: text("booking_id").references(() => bookings.id),
  title: text("title").notNull(),
  detail: text("detail").default("").notNull(),
  read_at: timestamp("read_at", { withTimezone: true, mode: "string" }),
  created_at: created(),
});
