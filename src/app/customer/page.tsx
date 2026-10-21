import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser, customerData } from "@/lib/data";
import CustomerMain from "@/views/customer/main";

export const metadata: Metadata = {
  title: "My repairs",
  robots: { index: false, follow: false },
};

export default async function Customer({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const user = await requireUser();
  if (user.kind !== "CUSTOMER") redirect("/pos");
  const { created } = await searchParams;

  return (
    <>
      <CustomerMain user={user} created={created} {...await customerData(user)} />
    </>
  );
}
