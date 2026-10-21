import type { Actor, Service, Shop } from "./index";

export interface BookingDates {
  today: string;
  tomorrow: string;
  last: string;
  year: number;
}
export interface BookingProps {
  shop: Shop;
  services: Service[];
  user: Actor | null;
  dates: BookingDates;
}
