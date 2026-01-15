import Link from "next/link";
import { Container } from "@/components/Container";

export default function Home() {
  return (
    <Container>
      <h1 className="text-2xl font-semibold">Marketplace Analytics</h1>
      <p className="mt-2 text-slate-700">
        Search vehicle and part listings, and view trends powered by your ASP.NET API + MySQL.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link className="rounded border border-slate-200 p-4 no-underline hover:bg-slate-50" href="/vehicles">
          <div className="font-semibold">Vehicles</div>
          <div className="mt-1 text-sm text-slate-600">Filter by make/model/year/price/state</div>
        </Link>

        <Link className="rounded border border-slate-200 p-4 no-underline hover:bg-slate-50" href="/parts">
          <div className="font-semibold">Parts</div>
          <div className="mt-1 text-sm text-slate-600">Search part listings</div>
        </Link>

        <Link className="rounded border border-slate-200 p-4 no-underline hover:bg-slate-50" href="/analytics">
          <div className="font-semibold">Analytics</div>
          <div className="mt-1 text-sm text-slate-600">Inventory + price trends</div>
        </Link>
      </div>

      <div className="mt-10 rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <div className="font-semibold">Setup</div>
        <ol className="mt-2 list-decimal pl-5">
          <li>Copy <code>.env.example</code> → <code>.env</code></li>
          <li>Set <code>NEXT_PUBLIC_API_BASE_URL</code> to your API URL</li>
          <li>Run <code>npm install</code> then <code>npm run dev</code></li>
        </ol>
      </div>
    </Container>
  );
}
