"use client";

import { Container } from "@/components/Container";
import { apiFetch } from "@/lib/api";
import { isAdmin, loadAuth } from "@/lib/auth";
import { useEffect, useMemo, useState } from "react";

type UploadResult = {
  type: string;
  linesRead: number;
  stagingRowsInserted: number;
};

type S3Result = {
  bucket: string;
  type: string;
  results: UploadResult[];
};

export default function AdminIngestPage() {
  const auth = useMemo(() => (typeof window !== "undefined" ? loadAuth() : null), []);
  const token = auth?.accessToken;

  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(isAdmin(auth));
  }, [auth]);

  const [uploadType, setUploadType] = useState<"vehicle" | "part">("vehicle");
  const [file, setFile] = useState<File | null>(null);

  const [s3Type, setS3Type] = useState<"vehicle" | "part" | "both">("both");
  const [bucket, setBucket] = useState("");
  const [vehicleKey, setVehicleKey] = useState("");
  const [partKey, setPartKey] = useState("");

  const [truncate, setTruncate] = useState(true);

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!allowed) {
    return (
      <Container>
        <h1 className="text-xl font-semibold">Admin Ingest</h1>
        <div className="mt-3 rounded border border-slate-200 p-4 text-sm text-slate-700">
          You must be logged in as <code>admin</code> to access this page.
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="text-xl font-semibold">Admin Ingest</h1>
      <p className="mt-1 text-sm text-slate-600">
        Use upload for demos. Use S3 for real AWS pipeline.
      </p>

      <label className="mt-4 inline-flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={truncate}
          onChange={(e) => setTruncate(e.target.checked)}
        />
        Truncate staging before ingest
      </label>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded border border-slate-200 p-4">
          <div className="font-semibold">Upload NDJSON</div>

          <div className="mt-3 grid gap-2">
            <select
              className="rounded border border-slate-300 px-3 py-2"
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value as any)}
            >
              <option value="vehicle">vehicle</option>
              <option value="part">part</option>
            </select>

            <input
              type="file"
              accept=".ndjson,.jsonl,.txt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            <button
              className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
              onClick={async () => {
                setErr(null);
                setMsg(null);
                if (!file) return setErr("Choose a file first.");

                const fd = new FormData();
                fd.append("file", file);

                try {
                  const res = await apiFetch<UploadResult>(
                    `/api/admin/ingest/ndjson?type=${uploadType}&truncateStaging=${truncate}`,
                    { method: "POST", body: fd },
                    token
                  );
                  setMsg(`OK: ${res.type} lines=${res.linesRead} inserted=${res.stagingRowsInserted}`);
                } catch (e: any) {
                  setErr(e.message || "Upload ingest failed");
                }
              }}
            >
              Upload & ingest
            </button>
          </div>
        </div>

        <div className="rounded border border-slate-200 p-4">
          <div className="font-semibold">Ingest from S3</div>

          <div className="mt-3 grid gap-2">
            <select
              className="rounded border border-slate-300 px-3 py-2"
              value={s3Type}
              onChange={(e) => setS3Type(e.target.value as any)}
            >
              <option value="vehicle">vehicle</option>
              <option value="part">part</option>
              <option value="both">both</option>
            </select>

            <input
              className="rounded border border-slate-300 px-3 py-2"
              placeholder="Bucket"
              value={bucket}
              onChange={(e) => setBucket(e.target.value)}
            />

            <input
              className="rounded border border-slate-300 px-3 py-2"
              placeholder="Vehicle key (e.g., ndjson/vehicles.ndjson)"
              value={vehicleKey}
              onChange={(e) => setVehicleKey(e.target.value)}
            />

            <input
              className="rounded border border-slate-300 px-3 py-2"
              placeholder="Part key (e.g., ndjson/parts.ndjson)"
              value={partKey}
              onChange={(e) => setPartKey(e.target.value)}
            />

            <button
              className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
              onClick={async () => {
                setErr(null);
                setMsg(null);

                try {
                  const res = await apiFetch<S3Result>(
                    `/api/admin/ingest/from-s3?truncateStaging=${truncate}`,
                    {
                      method: "POST",
                      body: JSON.stringify({
                        type: s3Type,
                        bucket,
                        vehicleKey: vehicleKey || null,
                        partKey: partKey || null
                      })
                    },
                    token
                  );
                  const summary = res.results
                    .map((r) => `${r.type}: lines=${r.linesRead} inserted=${r.stagingRowsInserted}`)
                    .join(" | ");
                  setMsg(`OK: ${summary}`);
                } catch (e: any) {
                  setErr(e.message || "S3 ingest failed");
                }
              }}
            >
              Ingest from S3
            </button>
          </div>
        </div>
      </div>

      {err ? <div className="mt-4 text-sm text-red-600">{err}</div> : null}
      {msg ? <div className="mt-4 text-sm text-green-700">{msg}</div> : null}
    </Container>
  );
}
