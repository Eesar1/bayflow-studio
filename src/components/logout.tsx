"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";

export default function Logout() {
  const router = useRouter();
  const [error, setError] = useState("");

  return (
    <>
      <button
        className="small-outline"
        onClick={async () => {
          try {
            await api("/auth/sign-out", {});
            router.push("/");
            router.refresh();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        Log out →
      </button>
      {error && <span role="alert">{error}</span>}
    </>
  );
}
