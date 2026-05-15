"use client";

import { useState, useEffect } from 'react';
import { type MetricCardData } from '@/components/MetricCard';
import { loadCsv } from '@/lib/loadCsv';
import { Overview } from '@/components/tabs/Overview';
import { ServiceQuality } from '@/components/tabs/ServiceQuality';
import { UtilizationCost } from '@/components/tabs/UtilizationCost';
import { ReferralPatterns } from '@/components/tabs/ReferralPatterns';
import { DiseaseManagement } from '@/components/tabs/DiseaseManagement';

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
  { id: 'overview',           label: 'Overview' },
  { id: 'service-quality',    label: 'Service Quality' },
  { id: 'utilization-cost',   label: 'Utilization & Cost' },
  { id: 'referral-patterns',  label: 'Referral Patterns' },
  { id: 'disease-management', label: 'Disease Management' },
];

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
                    ? 'bg-[#e6f2ff] text-[#0099ff] font-semibold border-l-4 border-[#0099ff] pl-2'
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
                      ? 'bg-[#e6f2ff] text-[#0099ff] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {activeTab === 'overview'           && <Overview metrics={metrics} />}
        {activeTab === 'service-quality'    && <ServiceQuality />}
        {activeTab === 'utilization-cost'   && <UtilizationCost metrics={metrics} />}
        {activeTab === 'referral-patterns'  && <ReferralPatterns />}
        {activeTab === 'disease-management' && <DiseaseManagement />}

      </main>
    </div>
  );
}
