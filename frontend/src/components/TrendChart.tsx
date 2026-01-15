"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from "chart.js";
import type { TrendPoint } from "@/lib/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export function TrendChart({
  title,
  points
}: {
  title: string;
  points: TrendPoint[];
}) {
  const labels = points.map((p) => p.snapshotDate.slice(0, 10));
  const data = points.map((p) => p.value);

  return (
    <div className="rounded border border-slate-200 p-4">
      <div className="mb-3 font-semibold">{title}</div>
      <Line
        data={{
          labels,
          datasets: [
            {
              label: title,
              data
            }
          ]
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } }
        }}
      />
    </div>
  );
}
