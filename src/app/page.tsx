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
    title: 'Total Spend',
    color: 'text-blue-600',
    units: '$',
    dataUrl: '/data/total-spend.csv',
    primaryTitle: 'By Product',
    secondaryDataUrl: '/data/total-spend-by-lob.csv',
    secondaryTitle: 'By Line of Business',
  },
  {
    title: 'Total Order Volume',
    color: 'text-green-600',
    dataUrl: '/data/total-order-volume.csv',
    primaryTitle: 'By Product',
    secondaryDataUrl: '/data/total-order-volume-by-lob.csv',
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

const deviceDataUrls: Record<string, string> = {
  CGM:  '/data/device-adherence-cgm.csv',
  CPAP: '/data/device-adherence-cpap.csv',
};

const faxOnlineColors: Record<string, string> = {
  'Fax':    '#8884d8',
  'Online': '#82ca9d',
};

function FaxOnlineChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    loadCsv('/data/fax-vs-online-usage.csv').then(({ chartData }) => setChartData(chartData));
  }, []);

  const categories = chartData.length ? Object.keys(chartData[0]).filter((k) => k !== 'name') : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Fax vs Online Usage</h2>
      <ResponsiveContainer width="100%" height={50}>
        <BarChart layout="vertical" data={chartData} barSize={20} margin={{ bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" hide />
          <Tooltip />
          <Legend />
          {categories.map((cat) => (
            <Bar key={cat} dataKey={cat} name={cat} stackId="a" fill={faxOnlineColors[cat] ?? '#8884d8'} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const adherenceColors: Record<string, string> = {
  'At-Risk':       '#ef4444',
  'Emerging Risk': '#f59e0b',
  'Adherent':      '#22c55e',
};

function DeviceAdherenceChart() {
  const [selectedDevice, setSelectedDevice] = useState('CGM');
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    loadCsv(deviceDataUrls[selectedDevice]).then(({ chartData }) => setChartData(chartData));
  }, [selectedDevice]);

  const categories = chartData.length ? Object.keys(chartData[0]).filter((k) => k !== 'name') : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Device Adherence</h2>
        <select
          value={selectedDevice}
          onChange={(e) => setSelectedDevice(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
        >
          {Object.keys(deviceDataUrls).map((device) => (
            <option key={device} value={device}>{device}</option>
          ))}
        </select>
      </div>
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
            {['Facility', 'Order Volume', 'Total Spend'].map((col) => (
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

        <div className="grid grid-cols-[11rem_1fr_1fr] gap-6 mb-8">
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-white p-4 rounded-lg shadow flex-1 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500">PMPM Spend</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">$842</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow flex-1 flex flex-col justify-center">
              <p className="text-sm font-medium text-gray-500">Calls per Order</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">1.2</p>
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
          {metrics[0] && <MetricCard card={metrics[0]} className="h-full" />}
          {metrics[1] && <MetricCard card={metrics[1]} className="h-full" />}
        </div>

        <div className="grid grid-cols-2 gap-6 items-start">
          <div ref={chartsColRef} className="flex flex-col gap-6">
            <DeviceAdherenceChart />
            <FaxOnlineChart />
          </div>
          <div
            className="overflow-y-auto rounded-lg"
            style={{ height: chartsHeight > 0 ? chartsHeight : undefined }}
          >
            <FacilityTable />
          </div>
        </div>
        
      </div>
    </main>
  );
}
