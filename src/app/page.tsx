"use client";

import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import { MetricCard, type MetricCardData, type ChartData } from '@/components/MetricCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const initialMetricCards: Omit<MetricCardData, 'value' | 'chartData' | 'secondaryChartData'>[] = [
  {
    title: 'Total Order Volume',
    color: 'text-[#093a5b]',
    dataUrl: '/data/total-order-volume.csv',
    primaryTitle: 'By Product Category',
    secondaryDataUrl: '/data/total-order-volume-by-lob.csv',
    secondaryTitle: 'By Line of Business',
    palette: ['#093a5b', '#0e5180', '#186aaa', '#2484d4', '#41b1fa', '#68c3fb', '#8fd5fc', '#b6e7fd', '#1a5f8a', '#2f93d4'],
  },
  {
    title: 'Total Spend',
    color: 'text-[#093a5b]',
    units: '$',
    dataUrl: '/data/total-spend.csv',
    primaryTitle: 'By Product Category',
    secondaryDataUrl: '/data/total-spend-by-lob.csv',
    secondaryTitle: 'By Line of Business',
    palette: ['#093a5b', '#0e5180', '#186aaa', '#2484d4', '#41b1fa', '#68c3fb', '#8fd5fc', '#b6e7fd', '#1a5f8a', '#2f93d4'],
  },
];

const TABS = [
  { id: 'overview',            label: 'Overview' },
  { id: 'service-quality',     label: 'Service Quality' },
  { id: 'utilization-cost',    label: 'Utilization & Cost' },
  { id: 'disease-management',  label: 'Disease Management' },
  { id: 'referral-patterns',   label: 'Referral Patterns' },
];

const adherenceColors: Record<string, string> = {
  'Adherent':      '#b6e7fd',
  'Emerging Risk': '#41b1fa',
  'At-Risk':       '#093a5b',
};

const adherenceSeverityOrder = ['Adherent', 'Emerging Risk', 'At-Risk'];

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex flex-col justify-center">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-4xl font-bold text-[#093a5b] mt-2">{value}</p>
    </div>
  );
}

function AdherenceChart({ title, dataUrl }: { title: string; dataUrl: string }) {
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

function FacilityTable() {
  const [rows, setRows] = useState<{ facility: string; orderVolume: string; totalSpend: string }[]>([]);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/data/facility-metrics.csv')
      .then((r) => r.text())
      .then((csv) => {
        const parsed = Papa.parse(csv, { header: true });
        setRows((parsed.data as { facility: string; orderVolume: string; totalSpend: string }[]).filter((r) => r.facility));
      });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollDown(el.scrollHeight > el.clientHeight);
  }, [rows]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 0);
    setCanScrollDown(Math.ceil(el.scrollTop + el.clientHeight) < el.scrollHeight);
  };

  return (
    <div className="relative rounded-lg shadow overflow-hidden">
      <div
        ref={scrollRef}
        className="bg-white rounded-lg overflow-y-auto max-h-[408px]"
        onScroll={handleScroll}
      >
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {['Referring Facility', 'Order Volume', 'Total Spend'].map((col) => (
                <th key={col} className="sticky top-0 bg-gray-100 border border-gray-200 px-3 py-2 text-left font-semibold text-[#093a5b] z-10">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-200 px-3 py-2 text-[#093a5b]">{row.facility}</td>
                <td className="border border-gray-200 px-3 py-2 text-right text-[#093a5b]">{Number(row.orderVolume).toLocaleString()}</td>
                <td className="border border-gray-200 px-3 py-2 text-right text-[#093a5b]">${Number(row.totalSpend).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canScrollUp && (
        <div
          className="absolute left-0 right-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none z-20"
          style={{ top: 37 }}
        />
      )}
      {canScrollDown && (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
      )}
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
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectTab = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

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
    <div className="flex min-h-screen bg-gray-100">

      {/* Side nav panel — hidden below lg */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-white border-r border-gray-200 shadow-sm">
        <div className="px-5 pt-7 pb-10">
          <svg width="150" height="18" viewBox="0 0 8053 962" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M0 29.5L218.18 948.5H565.68L781 29.5H586L427 782H360L200.5 29.5H0ZM2561.5 437.5V291.5C2459.5 270 2399.05 259.996 2265.5 260C2142.5 260.004 2033 336.496 2033 473.996C2033 563.496 2058.95 630.68 2146.5 661C2183.28 673.735 2226.68 678.426 2267.22 682.807C2339.68 690.638 2403 697.481 2403 747.496C2403 804.85 2322.62 803.361 2283.31 802.632C2279.43 802.561 2275.96 802.496 2273 802.496C2240.2 802.496 2080.5 794.996 2043.5 778.496V930C2116.5 948 2196.5 960.496 2334.5 960.496C2456 960.496 2578.5 913.996 2578.5 746C2578.5 691 2578.5 619.996 2500 574.496C2452.4 546.904 2391.92 537.696 2338.68 529.591C2269.16 519.007 2212 510.304 2212 465C2212 419.996 2256 387.996 2561.5 437.5ZM1553 948V270.5H1736.5V339.649C1814.11 298.864 1909.7 265.523 1961 260.5V438.5C1894.35 447.194 1829.07 457.601 1736.5 495.262V948H1553ZM1398 787.5V924.5C1340.67 943.5 1229 961.5 1124 961.5C1017.71 961.5 822.5 948.5 822.5 617C822.5 420.5 883 256.5 1134 256.5C1486.5 256.5 1411 686 1411 686H1003C1003 735.5 1007 808.5 1138.5 808.5C1252.41 808.5 1336.22 796.404 1385.67 789.268C1390.05 788.636 1394.16 788.042 1398 787.5ZM1003 550.5H1245C1245 495.5 1245 400 1125.5 400C1041.5 400 1003 447 1003 550.5ZM3260.5 924.5V787.5C3256.67 788.042 3252.57 788.634 3248.19 789.265L3248.17 789.268C3198.72 796.404 3114.91 808.5 3001 808.5C2869.5 808.5 2865.5 735.5 2865.5 686H3273.5C3273.5 686 3349 256.5 2996.5 256.5C2745.5 256.5 2685 420.5 2685 617C2685 948.5 2880.21 961.5 2986.5 961.5C3091.5 961.5 3203.17 943.5 3260.5 924.5ZM3107.5 550.5H2865.5C2865.5 447 2904 400 2988 400C3107.5 400 3107.5 495.5 3107.5 550.5Z" fill="#41b1fa"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M8053 0H7870V949H8053V0ZM3581 948.5H3771.5V235H3791.5L3974.5 904H4163.5L4347.5 235H4372.5V948.5H4556V29.5H4238L4071.5 701.5L3903.5 29.5H3581V948.5ZM5280.5 787.5V924.5C5223.17 943.5 5111.5 961.5 5006.5 961.5C4900.21 961.5 4705 948.5 4705 617C4705 420.5 4765.5 256.5 5016.5 256.5C5369 256.5 5293.5 686 5293.5 686H4885.5C4885.5 735.5 4889.5 808.5 5021 808.5C5134.91 808.5 5218.72 796.404 5268.17 789.268L5268.19 789.265C5272.56 788.634 5276.67 788.042 5280.5 787.5ZM4885.5 550.5H5127.5C5127.5 495.5 5127.5 400 5008 400C4924 400 4885.5 447 4885.5 550.5ZM6378 0H6195V184H6378V0ZM6378 271H6195V949H6378V271ZM7015 430V282.5C6863 243.5 6668.83 244.875 6605.5 311.5C6528.5 392.497 6516.5 497.997 6516.5 626.494C6516.5 627.941 6516.5 629.432 6516.5 630.964V631.097C6516.41 722.33 6516.19 960.997 6787 960.997C6892 960.997 6946 953.994 7015 938.994V783.994C6971.33 793.994 6905 803 6827 803C6763.7 803 6691 773.5 6691 621.494C6691 485.5 6731.5 410 6827 410H6827.05C6875.05 410 6957.52 410 7015 430ZM6026 0H5843V268.116C5705.76 245.282 5556.12 254.571 5502 311.5C5425.01 392.497 5413.01 497.997 5413.01 626.494C5413.01 627.901 5413 629.35 5413 630.839V630.964V631.097C5412.92 722.33 5412.69 960.997 5683.5 960.997C5755.25 960.997 5808.79 938.819 5843 920.146V949H6026V0ZM5843 780.8V415.305C5799.47 410 5754.4 410 5723.55 410H5723.51C5628.01 410 5587.5 485.5 5587.5 621.494C5587.5 773.5 5660.2 803 5723.51 803C5777.94 803 5813.86 793.505 5843 780.8ZM7159 418.496V292.996C7269.5 261.996 7350 258.5 7445.5 258.5C7541 258.5 7687 258.5 7687 510.5V771.497C7687 789.497 7695 824.001 7726 828.5V960.5C7666 960.5 7591.5 960.5 7527.5 914.5C7488 934.504 7417.5 960.5 7324.5 960.5C7215.5 960.5 7114 916.996 7114 750.5C7114 615.004 7150 525.996 7504 525.996C7504 522.735 7504.01 519.471 7504.02 516.215C7504.18 472.053 7504.34 429.408 7475 416C7443.5 401.604 7351.5 402.968 7296 406.5C7252.59 409.263 7205.17 413.496 7159 418.496ZM7504 647V796C7474.5 807 7429 819.5 7378 819.5C7348.5 819.5 7296 812 7296 742.5C7296 647 7392.5 647 7504 647Z" fill="#093a5b"/>
          </svg>
        </div>
        <div className="px-4 pb-4">
<nav className="flex flex-col gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => selectTab(tab.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600 pl-2'
                    : 'text-gray-600 font-medium hover:bg-gray-50 hover:text-[#093a5b]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>


      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-8">

        {/* Mobile nav dropdown — visible below lg */}
        <div className="relative lg:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-left text-sm font-semibold text-[#093a5b] flex justify-between items-center shadow-sm"
          >
            <span>{TABS.find((t) => t.id === activeTab)?.label}</span>
            <span className="text-xs">{mobileMenuOpen ? '▴' : '▾'}</span>
          </button>
          {mobileMenuOpen && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-30 overflow-hidden">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => selectTab(tab.id)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-[#093a5b]">Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatBox label="Average Delivery Time" value="34 hours" />
              <StatBox label="PMPM Spend" value="$9.70" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {metrics[0] && <MetricCard card={metrics[0]} />}
              <AvgDeliveryTimeChart />
            </div>
            <FacilityTable />
          </div>
        )}

        {/* Service Quality */}
        {activeTab === 'service-quality' && (
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-[#093a5b]">Service Quality</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatBox label="Average Delivery Time" value="34 hours" />
              <StatBox label="48-hour Delivery Rate" value="73%" />
              <StatBox label="Patient NPS" value="72" />
              <StatBox label="Clinician NPS" value="68" />
            </div>
            <div className="h-[400px] md:h-[600px]">
              <AvgDeliveryTimeChart />
            </div>
          </div>
        )}

        {/* Utilization & Cost */}
        {activeTab === 'utilization-cost' && (
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-[#093a5b]">Utilization & Cost</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatBox label="PMPM Spend" value="$9.70" />
              <StatBox label="Clean Claim Rate" value="95%" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics[0] && <MetricCard card={metrics[0]} />}
              {metrics[1] && <MetricCard card={metrics[1]} />}
            </div>
          </div>
        )}

        {/* Disease Management */}
        {activeTab === 'disease-management' && (
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-[#093a5b]">Disease Management</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AdherenceChart title="CGM Adherence" dataUrl="/data/device-adherence-cgm.csv" />
              <AdherenceChart title="CPAP Adherence" dataUrl="/data/device-adherence-cpap.csv" />
            </div>
          </div>
        )}

        {/* Referral Patterns */}
        {activeTab === 'referral-patterns' && (
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold text-[#093a5b]">Referral Patterns</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatBox label="Online Ordering Rate" value="81%" />
              <StatBox label="% of Orders Validated" value="94.2%" />
              <StatBox label="% of Claims Paid to Verse" value="88.7%" />
              <StatBox label="Avg. Subcontractor AR Days" value="22.4" />
            </div>
            <FacilityTable />
          </div>
        )}

      </main>
    </div>
  );
}
