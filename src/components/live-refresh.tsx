"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 15000);

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
