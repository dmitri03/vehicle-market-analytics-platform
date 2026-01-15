"use client";

import { Container } from "@/components/Container";
import { TrendChart } from "@/components/TrendChart";
import { apiFetch, type TrendResponse } from "@/lib/api";
import { useState } from "react";

function toQS(params: Record<string, any>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export default function AnalyticsPage() {
  const [stateCode, setStateCode] = useState("WA");
  const [listingType, setListingType] = useState<"vehicle" | "part">("vehicle");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [inv, setInv] = useState<TrendResponse | null>(null);
  const [avg, setAvg] = useState<TrendResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setErr(null);
    setLoading(true);
    try {
      const invQs = toQS({ listingType, state: stateCode, make, model, from, to });
      const invRes = await apiFetch<TrendResponse>(`/api/analytics/inventory-trend${invQs}`);
      setInv(invRes);

      if (listingType === "vehicle") {
        const avgQs = toQS({ state: stateCode, make, model, from, to });
        const avgRes = await apiFetch<TrendResponse>(`/api/analytics/avg-price-trend${avgQs}`);
        setAvg(avgRes);
      } else {
        setAvg(null);
      }
    } catch (e: any) {
      setErr(e.message || "Analytics failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <h1 className="text-xl font-semibold">Analytics</h1>
      <p className="mt-1 text-sm text-slate-600">
        Inventory trend uses <code>inventory_daily</code> (Option B). Avg price trend uses <code>vehicle_listings</code>.
      </p>

      <div className="mt-4 grid gap-3 rounded border border-slate-200 p-4 md:grid-cols-4">
        <select className="rounded border border-slate-300 px-3 py-2"
          value={listingType}
          onChange={(e) => setListingType(e.target.value as any)}
        >
          <option value="vehicle">Vehicle inventory</option>
          <option value="part">Part inventory</option>
        </select>

        <input className="rounded border border-slate-300 px-3 py-2" placeholder="State (WA)"
          value={stateCode} onChange={(e) => setStateCode(e.target.value.toUpperCase())} />

        <input className="rounded border border-slate-300 px-3 py-2" placeholder="Make (optional)"
          value={make} onChange={(e) => setMake(e.target.value)} />

        <input className="rounded border border-slate-300 px-3 py-2" placeholder="Model (optional)"
          value={model} onChange={(e) => setModel(e.target.value)} />

        <input className="rounded border border-slate-300 px-3 py-2" placeholder="From (YYYY-MM-DD)"
          value={from} onChange={(e) => setFrom(e.target.value)} />

        <input className="rounded border border-slate-300 px-3 py-2" placeholder="To (YYYY-MM-DD)"
          value={to} onChange={(e) => setTo(e.target.value)} />

        <button
          className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 md:col-span-2"
          onClick={run}
          disabled={loading}
        >
          {loading ? "Loading..." : "Run"}
        </button>
      </div>

      {err ? <div className="mt-3 text-sm text-red-600">{err}</div> : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {inv ? (
          <div className="space-y-2">
            <TrendChart title="Inventory count" points={inv.series} />
            <div className="text-xs text-slate-600">
              slope/day: {inv.slopePerDay ?? "n/a"} | r²: {inv.rSquared ?? "n/a"}
            </div>
          </div>
        ) : (
          <div className="rounded border border-slate-200 p-4 text-sm text-slate-600">
            Run a query to view inventory trend.
          </div>
        )}

        {avg ? (
          <div className="space-y-2">
            <TrendChart title="Average price" points={avg.series} />
            <div className="text-xs text-slate-600">
              slope/day: {avg.slopePerDay ?? "n/a"} | r²: {avg.rSquared ?? "n/a"}
            </div>
          </div>
        ) : (
          <div className="rounded border border-slate-200 p-4 text-sm text-slate-600">
            Avg price trend shows only for vehicle listing type.
          </div>
        )}
      </div>
    </Container>
  );
}
