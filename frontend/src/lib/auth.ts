import type { AuthResponse } from "./api";

const KEY = "marketplace_auth_v1";

export function saveAuth(a: AuthResponse) {
  localStorage.setItem(KEY, JSON.stringify(a));
}

export function loadAuth(): AuthResponse | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function isAdmin(a: AuthResponse | null): boolean {
  return !!a?.roles?.some((r) => r.toLowerCase() === "admin");
}
