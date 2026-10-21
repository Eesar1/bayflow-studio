import Link from "next/link";
import Header from "@/layout/header";
import AuthIntro from "./intro";
import SigninForm from "./signin-form";
import SignupForm from "./signup-form";

export default function AuthMain({
  signup = false,
  bookingPath,
}: {
  signup?: boolean;
  bookingPath?: string;
}) {
  return (
    <>
      <Header />
      <main id="main" className="auth-page">
        <AuthIntro />
        <section className="auth-card">
          <div className="eyebrow dark">
            {signup ? "FOR WORKSHOP OWNERS" : "WELCOME BACK"}
          </div>
          <h2>{signup ? "Build your workspace." : "Sign in to BayFlow."}</h2>
          {bookingPath && (
            <p>
              Sign in or create a customer account to book and approve your repair
              estimate securely. Workshop team accounts are for the POS.
            </p>
          )}
          {signup ? <SignupForm /> : <SigninForm bookingPath={bookingPath} />}
          <p className="auth-switch">
            {signup ? "Already have an account?" : "Own a workshop?"}{" "}
            <Link href={signup ? "/login" : "/signup"}>
              {signup ? "Sign in" : "Create an owner account"}
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}
