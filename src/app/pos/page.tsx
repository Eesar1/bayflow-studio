import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser, dashboardData } from "@/lib/data";
import { AppError } from "@/lib/workflow";
import PosMain from "@/views/pos/main";

export const metadata: Metadata = {
  title: "Workshop POS",
  robots: { index: false, follow: false },
};

export default async function POS({
  searchParams,
}: {
  searchParams: Promise<{ shop?: string; view?: string; job?: string }>;
}) {
  const user = await requireUser();
  if (user.kind === "CUSTOMER") redirect("/customer");
  const params = await searchParams;
  let data;
  try {
    data = await dashboardData(user, params.shop);
  } catch (e) {
    if (e instanceof AppError && e.status === 404) notFound();
    throw e;
  }

  return <PosMain data={data} view={params.view ?? "overview"} selectedId={params.job} />;
}
