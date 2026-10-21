import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="loading-state">
      <h1>Page not found.</h1>
      <p>This page or workshop is not available to your account.</p>
      <Link className="button button-primary" href="/">
        Back to BayFlow →
      </Link>
    </main>
  );
}
