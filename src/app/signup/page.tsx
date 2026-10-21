import type { Metadata } from "next";
import AuthMain from "@/views/auth/main";

export const metadata: Metadata = {
  title: "Create an owner account",
  robots: { index: false, follow: false },
};

export default function Signup() {
  return <AuthMain signup />;
}
