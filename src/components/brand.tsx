import Link from "next/link";

export default function Brand() {
  return (
    <Link className="brand" href="/" aria-label="BayFlow home">
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
      </span>
      BayFlow<span className="brand-period">.</span>
    </Link>
  );
}
