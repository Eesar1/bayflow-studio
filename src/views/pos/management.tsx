import type { Dashboard } from "@/types";
import InventoryView from "./inventory";
import TeamView from "./team";
import ServicesView from "./services";
import NotificationsView from "./notifications";

export default function Management({ data, view }: { data: Dashboard; view: string }) {
  switch (view) {
    case "inventory":
      return <InventoryView data={data} />;
    case "team":
      return <TeamView data={data} />;
    case "services":
      return data.role === "OWNER" ? <ServicesView data={data} /> : null;
    case "notifications":
      return <NotificationsView data={data} />;
    default:
      return null;
  }
}
