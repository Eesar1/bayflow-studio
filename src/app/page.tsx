import type { Metadata } from "next";
import HomeMain from "@/views/home/main";
import { publicShops, currentUser } from "@/lib/data";

export const metadata: Metadata = { title: "Workshop booking and repair tracking" };
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ city?: string }>;
}) {
  const { city = "" } = await searchParams;
  const [shops, user] = await Promise.all([publicShops(city), currentUser()]);

  return <HomeMain shops={shops} city={city} user={user} />;
}
