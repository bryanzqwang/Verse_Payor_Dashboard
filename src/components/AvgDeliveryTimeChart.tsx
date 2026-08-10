"use client";

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function ProductTick({ x, y, payload, missingProducts }: any) {
  const isMissing = missingProducts.has(payload.value);
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fontSize={11}
      fill={isMissing ? '#d1d5db' : '#666'}
    >
      {payload.value}
    </text>
  );
}

export function AvgDeliveryTimeChart({
  data: overrideData,
  title = 'Avg. Order Delivery Time by Product Category',
  unit = 'h',
  unitLabel = 'hours',
  tickStep = 12,
  minAxisMax = 0,
}: {
  data?: { product: string; hours: number | null }[];
  title?: string;
  unit?: string;
  unitLabel?: string;
  tickStep?: number;
  minAxisMax?: number;
} = {}) {
  const [fetchedData, setFetchedData] = useState<{ product: string; hours: number | null }[]>([]);

  useEffect(() => {
    if (overrideData) return;
    fetch('/data/avg-delivery-time.csv')
      .then((r) => r.text())
      .then((csv) => {
        const parsed = Papa.parse(csv, { header: true });
        setFetchedData(
          (parsed.data as { product: string; days: string }[])
            .filter((r) => r.product)
            .map((r) => ({ product: r.product, hours: parseFloat(r.days) }))
            .sort((a, b) => a.product.localeCompare(b.product))
        );
      });
  }, [overrideData]);

  const data = overrideData ?? fetchedData;
  const missingProducts = new Set(data.filter((d) => d.hours == null).map((d) => d.product));

  const presentValues = data.map((d) => d.hours).filter((h): h is number => h != null);
  const dataMax = presentValues.length ? Math.max(...presentValues) : tickStep * 11;
  const axisMax = Math.max(minAxisMax, Math.ceil(dataMax / tickStep) * tickStep);
  const ticks = Array.from({ length: axisMax / tickStep + 1 }, (_, i) => i * tickStep);

  return (
    <div className="bg-white p-6 rounded-lg shadow flex flex-col h-full">
      <h2 className="text-xl font-semibold text-[#093a5b] mb-4">{title}</h2>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 4, right: 32, left: 0, bottom: 4 }}>
            <XAxis type="number" domain={[0, axisMax]} ticks={ticks} tickFormatter={(v) => `${v}${unit}`} tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="product"
              width={200}
              interval={0}
              tick={(props) => <ProductTick {...props} missingProducts={missingProducts} />}
            />
            <Tooltip formatter={(v) => [`${v} ${unitLabel}`, 'Avg. Delivery Time']} />
            <Bar dataKey="hours" fill="#41b1fa" radius={[0, 4, 4, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
