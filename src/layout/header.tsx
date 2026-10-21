import Link from "next/link";
import Brand from "@/components/brand";
import Logout from "@/components/logout";
import type { Actor } from "@/types";

export default function Header({ user }: { user?: Actor | null }) {
  return (
    <nav className="public-nav" aria-label="Main navigation">
      <div className="container nav-inner">
        <Brand />
        <div className="nav-links">
          <Link href="/#workshops">Shops</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#business">For workshops</Link>
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              <Link
                className="nav-login"
                href={user.kind === "CUSTOMER" ? "/customer" : "/pos"}
              >
                My workspace
              </Link>
              <Logout />
            </>
          ) : (
            <Link className="nav-login" href="/login">
              Sign in
            </Link>
          )}
          <Link href="/#workshops" className="button button-primary nav-cta">
            Book a service →
          </Link>
        </div>
      </div>
    </nav>
  );
}
