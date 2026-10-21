"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import DemoAccounts from "./demo-accounts";

export default function SigninForm({ bookingPath }: { bookingPath?: string }) {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <>
      <form
        className="form-grid"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            await api(
              register ? "/auth/sign-up/email" : "/auth/sign-in/email",
              register ? { name, email, password } : { email, password },
            );
            const session = await api<{ user: { kind: string } }>("/auth/get-session");
            window.location.href =
              session.user.kind === "CUSTOMER" ? (bookingPath ?? "/customer") : "/pos";
          } catch (error) {
            setError((error as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {register && (
          <label>
            Full name
            <input
              name="name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>
        )}
        <label>
          Email address
          <input
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={register ? 10 : undefined}
            maxLength={128}
            autoComplete={register ? "new-password" : "current-password"}
          />
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="button button-primary" disabled={busy}>
          {busy ? "Please wait…" : register ? "Create customer account →" : "Sign in →"}
        </button>
      </form>
      <button
        className="text-link auth-mode"
        type="button"
        disabled={busy}
        onClick={() => {
          setRegister(!register);
          setError("");
        }}
      >
        {register ? "Already registered? Sign in" : "New customer? Create an account"}
      </button>
      <DemoAccounts
        onSelect={(email, password) => {
          setEmail(email);
          setPassword(password);
        }}
      />
    </>
  );
}
