import Header from "@/layout/header";
import Footer from "@/layout/footer";
import type { Shop, Actor } from "@/types";
import Hero from "./hero";
import Workshops from "./workshops";
import HowItWorks from "./how-it-works";
import RepairTracking from "./repair-tracking";
import ForWorkshops from "./for-workshops";

export default function HomeMain({
  shops,
  city,
  user,
}: {
  shops: (Shop & { services: string[] })[];
  city: string;
  user: Actor | null;
}) {
  return (
    <>
      <Header user={user} />
      <main id="main">
        <Hero city={city} />
        <Workshops shops={shops} />
        <HowItWorks />
        <RepairTracking />
        <ForWorkshops />
      </main>
      <Footer />
    </>
  );
}
