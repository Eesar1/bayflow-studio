export type Role = "OWNER" | "SA" | "TECH" | "PARTS" | "QC" | "CUSTOMER";
export type Actor = { id: string; name: string; email: string; kind: string };
export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  city: string;
  address: string;
  phone: string;
  description: string;
  hours_start: string;
  hours_end: string;
  slot_minutes: number;
  capacity: number;
}
export interface Service {
  id: string;
  shop_id: string;
  name: string;
  description: string;
  minutes: number;
  base_price: number;
}
export interface Part {
  id: string;
  shop_id: string;
  sku: string;
  name: string;
  quantity: number;
  reorder_level: number;
  unit_cost: number;
}
export interface EstimateItem {
  id?: string;
  kind: "PART" | "LABOUR";
  description: string;
  inventory_id?: string | null;
  quantity: number;
  unit_price: number;
}
export interface Estimate {
  id: string;
  revision: number;
  status: string;
  notes: string;
  total: number;
  items: EstimateItem[];
}
export interface History {
  id: string;
  from_status: string;
  to_status: string;
  note: string;
  actor: string;
  created_at: string;
}
export interface Issue {
  id: string;
  title: string;
  description: string;
  resolved: boolean;
}
export interface RequiredPart {
  inventory_id: string;
  sku: string;
  name: string;
  stock: number;
  needed: number;
}
export interface Job {
  id: string;
  reference: string;
  shop_id: string;
  customer_id: string;
  scheduled_at: string;
  notes: string;
  status: string;
  technician_id: string | null;
  parts_person_id: string | null;
  qc_inspector_id: string | null;
  estimate_revision: number;
  ready_notified: boolean;
  customer_name: string;
  customer_email: string;
  make: string;
  model: string;
  year: number;
  plate: string;
  technician_name: string | null;
  estimate: Estimate | null;
  history: History[];
  issues: Issue[];
  qc_reports: { outcome: string; notes: string; created_at: string }[];
  required_parts: RequiredPart[];
  services: string[];
}
export interface Member {
  user_id: string;
  shop_id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}
export interface Notice {
  id: string;
  title: string;
  detail: string;
  read_at: string | null;
  booking_id: string | null;
}
export interface PurchaseOrder {
  id: string;
  reference: string;
  booking_id: string;
  supplier: string;
  status: string;
  items: { id: string; name: string; quantity: number; received: number }[];
}
export interface Dashboard {
  user: Actor;
  shops: Shop[];
  shop: Shop | null;
  role: Role;
  bookings: Job[];
  inventory: Part[];
  members: Member[];
  services: Service[];
  orders: PurchaseOrder[];
  notifications: Notice[];
}
