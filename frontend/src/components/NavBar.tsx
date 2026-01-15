"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearAuth, isAdmin, loadAuth } from "@/lib/auth";

export function NavBar() {
  const [email, setEmail] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const a = loadAuth();
    setEmail(a?.email ?? null);
    setAdmin(isAdmin(a));
  }, []);

  return (
    <header className="border-b border-slate-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-slate-900 no-underline">
            Marketplace Analytics
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/vehicles">Vehicles</Link>
            <Link href="/parts">Parts</Link>
            <Link href="/analytics">Analytics</Link>
            {admin ? <Link href="/admin/ingest">Admin Ingest</Link> : null}
          </nav>
        </div>

        <div className="flex items-center gap-3 text-sm">
          {email ? (
            <>
              <span className="text-slate-600">{email}</span>
              <button
                className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-50"
                onClick={() => {
                  clearAuth();
                  location.href = "/";
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
