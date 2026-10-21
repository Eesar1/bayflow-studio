import type { Metadata } from "next";
import AuthMain from "@/views/auth/main";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const bookingPath = next && /^\/book\/[a-z0-9-]+$/.test(next) ? next : undefined;

  return <AuthMain bookingPath={bookingPath} />;
}
