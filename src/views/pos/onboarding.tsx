import Brand from "@/components/brand";
import Logout from "@/components/logout";
import NewShop from "./new-shop";
import type { Dashboard } from "@/types";

export default function PosOnboarding({ data }: { data: Dashboard }) {
  return (
    <main id="main" className="onboarding">
      <Brand />
      <h1>
        {data.role === "OWNER"
          ? "Start with your first workshop."
          : "No active workshop membership."}
      </h1>
      <p>
        {data.role === "OWNER"
          ? "Create a shop, then add its services and team."
          : "Ask the workshop owner to add or reactivate your account."}
      </p>
      {data.role === "OWNER" && <NewShop />}
      <Logout />
    </main>
  );
}
