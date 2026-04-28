"use client";

import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { MetricCard, type MetricCardData, type ChartData } from '@/components/MetricCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface KeyMetric {
  label: string;
  value: string;
}

interface Activity {
  description: string;
}

const initialMetricCards: Omit<MetricCardData, 'value' | 'chartData' | 'secondaryChartData'>[] = [
  {
    title: 'Total Order Volume',
    color: 'text-green-600',
    dataUrl: '/data/total-order-volume.csv',
    primaryTitle: 'By Product Category',
    secondaryDataUrl: '/data/total-order-volume-by-lob.csv',
    secondaryTitle: 'By Line of Business',
  },
  {
    title: 'Total Spend',
    color: 'text-blue-600',
    units: '$',
    dataUrl: '/data/total-spend.csv',
    primaryTitle: 'By Product Category',
    secondaryDataUrl: '/data/total-spend-by-lob.csv',
    secondaryTitle: 'By Line of Business',
  },
];

const keyMetrics: KeyMetric[] = [
  { label: 'Average Claim Processing Time', value: '3.2 days' },
  { label: 'Denial Rate', value: '5.1%' },
  { label: 'Customer Retention', value: '87%' },
];

const recentActivities: Activity[] = [
  { description: 'New patient enrollment: John Doe' },
  { description: 'Claim approved: $5,000' },
  { description: 'Policy update: Premium increase' },
  { description: 'Report generated: Q1 Summary' },
];

const adherenceColors: Record<string, string> = {
  'At-Risk':       '#ef4444',
  'Emerging Risk': '#f59e0b',
  'Adherent':      '#22c55e',
};

function AdherenceChart({ title, dataUrl }: { title: string; dataUrl: string }) {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    loadCsv(dataUrl).then(({ chartData }) => setChartData(chartData));
  }, [dataUrl]);

  const categories = chartData.length ? Object.keys(chartData[0]).filter((k) => k !== 'name') : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height={50}>
        <BarChart layout="vertical" data={chartData} barSize={20} margin={{ bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip />
          <Legend />
          {categories.map((cat) => (
            <Bar key={cat} dataKey={cat} name={cat} stackId="a" fill={adherenceColors[cat] ?? '#8884d8'} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function AvgDeliveryTimeChart() {
  const [data, setData] = useState<{ product: string; hours: number }[]>([]);

  useEffect(() => {
    fetch('/data/avg-delivery-time.csv')
      .then((r) => r.text())
      .then((csv) => {
        const parsed = Papa.parse(csv, { header: true });
        setData(
          (parsed.data as { product: string; hours: string }[])
            .filter((r) => r.product)
            .map((r) => ({ product: r.product, hours: parseFloat(r.hours) }))
        );
      });
  }, []);

  const maxHours = data.length ? Math.ceil(Math.max(...data.map((d) => d.hours)) / 12) * 12 : 132;
  const ticks = Array.from({ length: maxHours / 12 + 1 }, (_, i) => i * 12);

  return (
    <div className="bg-white p-6 rounded-lg shadow flex flex-col h-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Avg. Order Delivery Time by Product Category</h2>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 4, right: 32, left: 8, bottom: 4 }}>
            <XAxis type="number" ticks={ticks} tickFormatter={(v) => `${v}h`} tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="product" width={90} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [`${v} hours`, 'Avg. Delivery Time']} />
            <Bar dataKey="hours" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function FacilityTable() {
  const [rows, setRows] = useState<{ facility: string; orderVolume: string; totalSpend: string }[]>([]);

  useEffect(() => {
    fetch('/data/facility-metrics.csv')
      .then((r) => r.text())
      .then((csv) => {
        const parsed = Papa.parse(csv, { header: true });
        setRows((parsed.data as { facility: string; orderVolume: string; totalSpend: string }[]).filter((r) => r.facility));
      });
  }, []);

  return (
    <div className="bg-white rounded-lg shadow">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {['Referring Facility', 'Order Volume', 'Total Spend'].map((col) => (
              <th key={col} className="sticky top-0 bg-gray-100 border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700 z-10">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="border border-gray-200 px-3 py-2 text-gray-800">{row.facility}</td>
              <td className="border border-gray-200 px-3 py-2 text-right text-gray-800">{Number(row.orderVolume).toLocaleString()}</td>
              <td className="border border-gray-200 px-3 py-2 text-right text-gray-800">${Number(row.totalSpend).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function loadCsv(url: string): Promise<{ chartData: ChartData[]; value: string }> {
  const response = await fetch(url);
  const csv = await response.text();
  const parsed = Papa.parse(csv, { header: true });
  const data = (parsed.data as { category: string; value: string }[]).filter(item => item.category);
  const total = data.reduce((sum, item) => sum + parseInt(item.value || '0'), 0);
  const chartData: ChartData[] = [{
    name: 'Total',
    ...data.reduce((acc, item) => {
      acc[item.category] = parseInt(item.value || '0');
      return acc;
    }, {} as Record<string, number>),
  }];
  return { chartData, value: total.toLocaleString() };
}

export default function Home(): JSX.Element {
  const [metrics, setMetrics] = useState<MetricCardData[]>([]);
  const chartsColRef = useRef<HTMLDivElement>(null);
  const [chartsHeight, setChartsHeight] = useState<number>(0);

  useEffect(() => {
    const el = chartsColRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setChartsHeight(entry.contentRect.height));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const loaded = await Promise.all(
        initialMetricCards.map(async (card) => {
          const [primary, secondary] = await Promise.all([
            loadCsv(card.dataUrl),
            loadCsv(card.secondaryDataUrl),
          ]);
          return {
            ...card,
            value: primary.value,
            chartData: primary.chartData,
            secondaryChartData: secondary.chartData,
          };
        })
      );
      setMetrics(loaded);
    };
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Executive Summary</h1>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-44 flex-shrink-0 flex flex-col gap-4">
            <div className="bg-white p-4 rounded-lg shadow flex-1 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500">PMPM Spend</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">$9.70</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex-1 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500">Clean Claim Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">95%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex-1 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500">Average Delivery Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">34 hours</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex-1 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500">48-hour Delivery Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">73%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex-1 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500">Online Ordering Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">81%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex-1 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500">Patient NPS</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">72</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex-1 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500">Clinician NPS</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">68</p>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-6 items-stretch">
              {metrics[0] && <MetricCard card={metrics[0]} />}
              <AvgDeliveryTimeChart />
            </div>

            <div className="grid grid-cols-2 gap-6 items-start">
              <div ref={chartsColRef} className="flex flex-col gap-6">
                <AdherenceChart title="CGM Adherence" dataUrl="/data/device-adherence-cgm.csv" />
                <AdherenceChart title="CPAP Adherence" dataUrl="/data/device-adherence-cpap.csv" />
              </div>
              <div
                className="overflow-y-auto rounded-lg"
                style={{ height: chartsHeight > 0 ? chartsHeight : undefined }}
              >
                <FacilityTable />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 items-stretch">
              {metrics[1] && <MetricCard card={metrics[1]} />}
              <div className="flex flex-col gap-4">
                <div className="bg-white p-6 rounded-lg shadow flex-1 flex flex-col justify-center">
                  <p className="text-sm font-medium text-gray-500">% of Orders Validated</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">94.2%</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex-1 flex flex-col justify-center">
                  <p className="text-sm font-medium text-gray-500">% of Claims Paid to Verse</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">88.7%</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow flex-1 flex flex-col justify-center">
                  <p className="text-sm font-medium text-gray-500">Average Subcontractor AR Days</p>
                  <p className="text-4xl font-bold text-gray-900 mt-2">22.4</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </main>
  );
}
