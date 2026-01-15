export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "";

export type AuthResponse = {
  accessToken: string;
  userId: number;
  email: string;
  roles: string[];
};

export type PagedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  returned: number;
};

export type VehicleListing = {
  listingHash: string;
  url: string;
  make: string | null;
  model: string | null;
  year: number | null;
  modelConfig: string | null;
  price: number | null;
  mileage: string | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  isDealership: boolean;
  scrapedAt: string;
};

export type PartListing = {
  listingHash: string;
  url: string;
  make: string | null;
  model: string | null;
  year: number | null;
  title: string | null;
  description: string | null;
  price: number | null;
  city: string | null;
  state: string | null;
  latitude: number | null;
  longitude: number | null;
  isDealership: boolean;
  scrapedAt: string;
};

export type TrendPoint = { snapshotDate: string; value: number };
export type TrendResponse = {
  metric: string;
  series: TrendPoint[];
  slopePerDay: number | null;
  intercept: number | null;
  rSquared: number | null;
};

function joinUrl(path: string) {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set");
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  token?: string
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(joinUrl(path), {
    ...init,
    headers
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg =
      data?.error ||
      data?.message ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}
