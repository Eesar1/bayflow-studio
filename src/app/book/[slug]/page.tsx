import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { bookingShop, currentUser } from "@/lib/data";
import { pakistanDay } from "@/lib/slots";
import BookingMain from "@/views/booking/main";

export const metadata: Metadata = {
  title: "Book your service",
  robots: { index: false, follow: false },
};

export default async function Booking({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await bookingShop(slug);
  if (!data) notFound();
  const user = await currentUser();
  if (!user || user.kind !== "CUSTOMER") {
    redirect("/login?next=" + encodeURIComponent("/book/" + data.shop.slug));
  }
  const dates = {
    today: pakistanDay(),
    tomorrow: pakistanDay(new Date(new Date().getTime() + 86400000)),
    last: pakistanDay(new Date(new Date().getTime() + 45 * 86400000)),
    year: new Date().getFullYear(),
  };

  return (
    <>
      <BookingMain {...data} user={user} dates={dates} />
    </>
  );
}
