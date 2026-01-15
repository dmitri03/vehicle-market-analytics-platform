"use client";

import { Container } from "@/components/Container";
import { Table } from "@/components/Table";
import { apiFetch, type PagedResponse, type PartListing } from "@/lib/api";
import { useEffect, useState } from "react";

function toQS(params: Record<string, any>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export default function PartsPage() {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const [items, setItems] = useState<PartListing[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    setLoading(true);
    setErr(null);
    try {
      const qs = toQS({
        make,
        model,
        state: stateCode,
        yearMin,
        yearMax,
        priceMin,
        priceMax,
        page: 1,
        pageSize: 50
      });
      const res = await apiFetch<PagedResponse<PartListing>>(`/api/parts${qs}`);
      setItems(res.items);
    } catch (e: any) {
      setErr(e.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = items.map((x) => [
    <a key={x.listingHash} href={x.url} target="_blank" rel="noreferrer">
      {x.year ?? ""} {x.make ?? ""} {x.model ?? ""} {x.title ?? "Part listing"}
    </a>,
    x.price?.toLocaleString() ?? "",
    `${x.city ?? ""}${x.city && x.state ? ", " : ""}${x.state ?? ""}`,
    x.isDealership ? "Yes" : "No",
    new Date(x.scrapedAt).toLocaleDateString()
  ]);

  return (
    <Container>
      <h1 className="text-xl font-semibold">Part Listings</h1>

      <div className="mt-4 grid gap-3 rounded border border-slate-200 p-4 md:grid-cols-4">
        <input className="rounded border border-slate-300 px-3 py-2" placeholder="Make (e.g., bmw)"
          value={make} onChange={(e) => setMake(e.target.value)} />
        <input className="rounded border border-slate-300 px-3 py-2" placeholder="Model (e.g., x5)"
          value={model} onChange={(e) => setModel(e.target.value)} />
        <input className="rounded border border-slate-300 px-3 py-2" placeholder="State (e.g., WA)"
          value={stateCode} onChange={(e) => setStateCode(e.target.value.toUpperCase())} />

        <div className="flex gap-2">
          <input className="w-full rounded border border-slate-300 px-3 py-2" placeholder="Year min"
            value={yearMin} onChange={(e) => setYearMin(e.target.value)} />
          <input className="w-full rounded border border-slate-300 px-3 py-2" placeholder="Year max"
            value={yearMax} onChange={(e) => setYearMax(e.target.value)} />
        </div>

        <div className="flex gap-2 md:col-span-2">
          <input className="w-full rounded border border-slate-300 px-3 py-2" placeholder="Price min"
            value={priceMin} onChange={(e) => setPriceMin(e.target.value)} />
          <input className="w-full rounded border border-slate-300 px-3 py-2" placeholder="Price max"
            value={priceMax} onChange={(e) => setPriceMax(e.target.value)} />
        </div>

        <button
          className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 md:col-span-2"
          onClick={search}
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {err ? <div className="mt-3 text-sm text-red-600">{err}</div> : null}

      <div className="mt-4">
        <Table
          headers={["Listing", "Price", "Location", "Dealer", "Scraped"]}
          rows={rows}
        />
      </div>
    </Container>
  );
}
