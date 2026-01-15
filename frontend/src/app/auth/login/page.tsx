"use client";

import { Container } from "@/components/Container";
import { apiFetch, type AuthResponse } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  return (
    <Container>
      <h1 className="text-xl font-semibold">Login</h1>

      <div className="mt-4 max-w-md space-y-3">
        <input className="w-full rounded border border-slate-300 px-3 py-2" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full rounded border border-slate-300 px-3 py-2" placeholder="Password" type="password"
          value={password} onChange={(e) => setPassword(e.target.value)} />

        <button
          className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
          onClick={async () => {
            setErr(null); setOk(null);
            try {
              const res = await apiFetch<AuthResponse>("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
              });
              saveAuth(res);
              setOk("Logged in.");
              setTimeout(() => (location.href = "/"), 500);
            } catch (e: any) {
              setErr(e.message || "Login failed");
            }
          }}
        >
          Login
        </button>

        {err ? <div className="text-sm text-red-600">{err}</div> : null}
        {ok ? <div className="text-sm text-green-700">{ok}</div> : null}
      </div>
    </Container>
  );
}
