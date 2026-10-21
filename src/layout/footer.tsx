import Link from "next/link";
import Brand from "@/components/brand";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <div>
          <Brand />
          <p>
            Every repair, in flow.
            <br />
            Built for the roads ahead.
          </p>
        </div>
        <div>
          <b>FOR DRIVERS</b>
          <Link href="/#workshops">Find a workshop</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/customer">My bookings</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 BayFlow. All rights reserved.</span>
        <span>DESIGNED FOR THE WORK. BUILT TO MOVE.</span>
      </div>
    </footer>
  );
}
