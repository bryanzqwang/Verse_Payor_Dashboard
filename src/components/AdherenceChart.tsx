"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { loadCsv } from '@/lib/loadCsv';
import { type ChartData } from '@/components/MetricCard';

const adherenceColors: Record<string, string> = {
  'Adherent':      '#b6e7fd',
  'Emerging Risk': '#41b1fa',
  'At-Risk':       '#093a5b',
};

const adherenceSeverityOrder = ['Adherent', 'Emerging Risk', 'At-Risk'];

export function AdherenceChart({ title, dataUrl }: { title: string; dataUrl: string }) {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    loadCsv(dataUrl).then(({ chartData }) => setChartData(chartData));
  }, [dataUrl]);

  const categories = chartData.length ? adherenceSeverityOrder.filter((k) => k in chartData[0]) : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-[#093a5b] mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={50}>
        <BarChart layout="vertical" data={chartData} barSize={20} margin={{ bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip />
          <Legend content={() => (
            <ul className="flex gap-4 justify-center text-sm font-medium text-gray-500 list-none p-0 m-0">
              {adherenceSeverityOrder.map((key) => (
                <li key={key} className="flex items-center gap-1.5">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: adherenceColors[key] }} />
                  {key}
                </li>
              ))}
            </ul>
          )} />
          {categories.map((cat) => (
            <Bar key={cat} dataKey={cat} name={cat} stackId="a" fill={adherenceColors[cat] ?? '#8884d8'} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
