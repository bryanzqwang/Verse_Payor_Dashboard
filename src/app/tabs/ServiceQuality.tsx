"use client";

import { useEffect, useRef, useState } from 'react';
import Papa from 'papaparse';
import { PerformancePanel, type PerformanceMetric } from '@/components/PerformancePanel';
import { AvgDeliveryTimeChart } from '@/components/AvgDeliveryTimeChart';

interface SubcontractorRow {
  supplier: string;
  onTimeDeliveryRate: string;
}

interface DeliveryRow {
  supplier: string;
  product: string;
  days: string;
}

interface MetricRow {
  metric: string;
  value: string;
}

interface SubcontractorData {
  name: string;
  onTimeDeliveryRate: string;
  deliveryData: { product: string; hours: number | null }[];
}

const VERSE_MEDICAL = 'Verse Medical';

function SubcontractorDropdown({
  subcontractors,
  selected,
  onSelect,
}: {
  subcontractors: string[];
  selected: string;
  onSelect: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white text-[#093a5b] font-medium flex items-center gap-2 hover:bg-gray-50 min-w-[220px] justify-between shadow-sm"
      >
        <span className="truncate">{selected}</span>
        <span className="flex-shrink-0 text-xs text-gray-400">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[220px] overflow-hidden">
          {subcontractors.map((name) => (
            <div
              key={name}
              onClick={() => {
                onSelect(name);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer ${
                selected === name ? 'bg-[#e6f2fa] text-[#093a5b] font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ServiceQuality() {
  const [overallPerformance, setOverallPerformance] = useState<PerformanceMetric[]>([]);
  const [versePerformance, setVersePerformance] = useState<PerformanceMetric[]>([]);
  const [experience, setExperience] = useState<PerformanceMetric[]>([]);
  const [subcontractors, setSubcontractors] = useState<SubcontractorData[]>([]);
  const [selectedSubcontractor, setSelectedSubcontractor] = useState<string>('');

  useEffect(() => {
    Promise.all([
      fetch('/data/service-quality-overall-performance.csv').then((r) => r.text()),
      fetch('/data/service-quality-verse-performance.csv').then((r) => r.text()),
      fetch('/data/service-quality-experience.csv').then((r) => r.text()),
      fetch('/data/service-quality-subcontractor-performance.csv').then((r) => r.text()),
      fetch('/data/service-quality-delivery-time.csv').then((r) => r.text()),
    ]).then(([overallCsv, verseCsv, experienceCsv, subPerfCsv, deliveryCsv]) => {
      const toMetrics = (csv: string) =>
        (Papa.parse(csv, { header: true }).data as MetricRow[])
          .filter((r) => r.metric)
          .map((r) => ({ label: r.metric, value: `${r.value}%` }));

      setOverallPerformance(toMetrics(overallCsv));
      setVersePerformance(toMetrics(verseCsv));
      setExperience(
        (Papa.parse(experienceCsv, { header: true }).data as MetricRow[])
          .filter((r) => r.metric)
          .map((r) => ({ label: r.metric, value: r.value }))
      );

      const subPerfRows = (Papa.parse(subPerfCsv, { header: true }).data as SubcontractorRow[]).filter((r) => r.supplier);
      const deliveryRows = (Papa.parse(deliveryCsv, { header: true }).data as DeliveryRow[]).filter((r) => r.supplier);

      const allProducts: string[] = [];
      deliveryRows.forEach((r) => {
        if (!allProducts.includes(r.product)) allProducts.push(r.product);
      });
      allProducts.sort((a, b) => a.localeCompare(b));

      const built = subPerfRows.map((row) => {
        const supplierRows = deliveryRows.filter((r) => r.supplier === row.supplier);
        return {
          name: row.supplier,
          onTimeDeliveryRate: row.onTimeDeliveryRate,
          deliveryData: allProducts.map((product) => {
            const match = supplierRows.find((r) => r.product === product);
            return { product, hours: match ? parseFloat(match.days) : null };
          }),
        };
      });

      setSubcontractors(built);
      setSelectedSubcontractor((prev) => prev || built[0]?.name || '');
    });
  }, []);

  const subcontractor = subcontractors.find((s) => s.name === selectedSubcontractor);
  const isVerse = selectedSubcontractor === VERSE_MEDICAL;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#093a5b]">Service Quality</h1>
        {subcontractors.length > 0 && (
          <SubcontractorDropdown
            subcontractors={subcontractors.map((s) => s.name)}
            selected={selectedSubcontractor}
            onSelect={setSelectedSubcontractor}
          />
        )}
      </div>
      {subcontractor && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <PerformancePanel title="Overall Performance" metrics={overallPerformance} muted={!isVerse} large />
            <PerformancePanel title="Verse Performance" metrics={versePerformance} muted={!isVerse} />
            <PerformancePanel
              title="Subcontractor Performance"
              metrics={[{ label: 'On-Time Delivery Rate', value: `${subcontractor.onTimeDeliveryRate}%` }]}
              large
            />
            <PerformancePanel title="Experience" metrics={experience} muted={!isVerse} />
          </div>
          <div className="h-[600px] md:h-[900px]">
            <AvgDeliveryTimeChart
              data={subcontractor.deliveryData}
              title="On-Time Delivery Rate"
              unit="d"
              unitLabel="days"
              tickStep={2}
              minAxisMax={10}
            />
          </div>
        </>
      )}
    </div>
  );
}
