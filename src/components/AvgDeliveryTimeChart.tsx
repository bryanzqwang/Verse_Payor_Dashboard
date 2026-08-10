"use client";

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function AvgDeliveryTimeChart({ data: overrideData }: { data?: { product: string; hours: number }[] } = {}) {
  const [fetchedData, setFetchedData] = useState<{ product: string; hours: number }[]>([]);

  useEffect(() => {
    if (overrideData) return;
    fetch('/data/avg-delivery-time.csv')
      .then((r) => r.text())
      .then((csv) => {
        const parsed = Papa.parse(csv, { header: true });
        setFetchedData(
          (parsed.data as { product: string; hours: string }[])
            .filter((r) => r.product)
            .map((r) => ({ product: r.product, hours: parseFloat(r.hours) }))
        );
      });
  }, [overrideData]);

  const data = overrideData ?? fetchedData;

  const maxHours = data.length ? Math.ceil(Math.max(...data.map((d) => d.hours)) / 12) * 12 : 132;
  const ticks = Array.from({ length: maxHours / 12 + 1 }, (_, i) => i * 12);

  return (
    <div className="bg-white p-6 rounded-lg shadow flex flex-col h-full">
      <h2 className="text-xl font-semibold text-[#093a5b] mb-4">Avg. Order Delivery Time by Product Category</h2>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 4, right: 32, left: 0, bottom: 4 }}>
            <XAxis type="number" ticks={ticks} tickFormatter={(v) => `${v}h`} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="product" width={200} tick={{ fontSize: 11 }} interval={0} />
            <Tooltip formatter={(v) => [`${v} hours`, 'Avg. Delivery Time']} />
            <Bar dataKey="hours" fill="#41b1fa" radius={[0, 4, 4, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
