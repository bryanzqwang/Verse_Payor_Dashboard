"use client";

import { useEffect, useRef, useState } from 'react';
import { ServiceCategoryCard } from '@/components/ServiceCategoryCard';
import { AvgDeliveryTimeChart } from '@/components/AvgDeliveryTimeChart';

interface CategoryMetric {
  category: string;
  slaRate: string;
  avgDelivery: string;
}

interface SupplierServiceQuality {
  name: string;
  categories: CategoryMetric[];
  deliveryData?: { product: string; hours: number }[];
}

// Base per-product delivery hours, sourced from public/data/avg-delivery-time.csv (Verse Medical).
const BASE_DELIVERY: { product: string; hours: number }[] = [
  { product: 'Ambulatory', hours: 10 },
  { product: 'Bath Supplies', hours: 15 },
  { product: 'Bed Supplies', hours: 20 },
  { product: 'Compression', hours: 12 },
  { product: 'CPAP/BiPAP Supplies', hours: 48 },
  { product: 'Diabetes', hours: 36 },
  { product: 'Enteral', hours: 24 },
  { product: 'Incontinence', hours: 18 },
  { product: 'Living Aids', hours: 30 },
  { product: 'Maternal', hours: 8 },
  { product: 'Mobility', hours: 40 },
  { product: 'Ostomy', hours: 18 },
  { product: 'Post Mastectomy', hours: 14 },
  { product: 'Rehabilitation', hours: 25 },
  { product: 'Respiratory Supplies', hours: 48 },
  { product: 'Skincare', hours: 20 },
  { product: 'Urology', hours: 16 },
  { product: 'Wound Care', hours: 22 },
  { product: 'Specialty & LTSS Products', hours: 30 },
];

// Hypothetical scaling to approximate a competitor's delivery times for demo purposes.
function scaleDelivery(multiplier: number, offset: number) {
  return BASE_DELIVERY.map((d) => ({
    product: d.product,
    hours: Math.max(4, Math.round(d.hours * multiplier + offset)),
  }));
}

const SUPPLIERS: SupplierServiceQuality[] = [
  {
    name: 'Verse Medical',
    categories: [
      { category: 'Bent Metal', slaRate: '91%', avgDelivery: '18h' },
      { category: 'Discharge', slaRate: '87%', avgDelivery: '6h' },
      { category: 'Mail Order', slaRate: '94%', avgDelivery: '37h' },
      { category: 'Oxygen', slaRate: '89%', avgDelivery: '24h' },
    ],
    // No deliveryData override — falls back to the live CSV fetch.
  },
  {
    name: 'Apex Home Medical',
    categories: [
      { category: 'Bent Metal', slaRate: '84%', avgDelivery: '26h' },
      { category: 'Discharge', slaRate: '79%', avgDelivery: '11h' },
      { category: 'Mail Order', slaRate: '88%', avgDelivery: '45h' },
      { category: 'Oxygen', slaRate: '81%', avgDelivery: '33h' },
    ],
    deliveryData: scaleDelivery(1.15, 4),
  },
  {
    name: 'Coastal DME Solutions',
    categories: [
      { category: 'Bent Metal', slaRate: '88%', avgDelivery: '21h' },
      { category: 'Discharge', slaRate: '82%', avgDelivery: '9h' },
      { category: 'Mail Order', slaRate: '90%', avgDelivery: '40h' },
      { category: 'Oxygen', slaRate: '85%', avgDelivery: '29h' },
    ],
    deliveryData: scaleDelivery(1.05, 2),
  },
  {
    name: 'Summit Health Equipment',
    categories: [
      { category: 'Bent Metal', slaRate: '93%', avgDelivery: '15h' },
      { category: 'Discharge', slaRate: '90%', avgDelivery: '5h' },
      { category: 'Mail Order', slaRate: '96%', avgDelivery: '33h' },
      { category: 'Oxygen', slaRate: '92%', avgDelivery: '20h' },
    ],
    deliveryData: scaleDelivery(0.85, -3),
  },
  {
    name: 'Pinnacle Care Supply',
    categories: [
      { category: 'Bent Metal', slaRate: '79%', avgDelivery: '31h' },
      { category: 'Discharge', slaRate: '74%', avgDelivery: '14h' },
      { category: 'Mail Order', slaRate: '83%', avgDelivery: '52h' },
      { category: 'Oxygen', slaRate: '77%', avgDelivery: '38h' },
    ],
    deliveryData: scaleDelivery(1.35, 6),
  },
];

function SupplierDropdown({
  selected,
  onSelect,
}: {
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
        className="text-sm border border-gray-300 rounded-md px-3 py-2 bg-white text-[#093a5b] font-medium flex items-center gap-2 hover:bg-gray-50 min-w-[200px] justify-between shadow-sm"
      >
        <span className="truncate">{selected}</span>
        <span className="flex-shrink-0 text-xs text-gray-400">{open ? '▴' : '▾'}</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20 min-w-[200px] overflow-hidden">
          {SUPPLIERS.map((s) => (
            <div
              key={s.name}
              onClick={() => {
                onSelect(s.name);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer ${
                selected === s.name ? 'bg-[#e6f2fa] text-[#093a5b] font-semibold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ServiceQuality() {
  const [selectedSupplier, setSelectedSupplier] = useState(SUPPLIERS[0].name);
  const supplier = SUPPLIERS.find((s) => s.name === selectedSupplier) ?? SUPPLIERS[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#093a5b]">Service Quality</h1>
        <SupplierDropdown selected={selectedSupplier} onSelect={setSelectedSupplier} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {supplier.categories.map((c) => (
          <ServiceCategoryCard key={c.category} category={c.category} slaRate={c.slaRate} avgDelivery={c.avgDelivery} />
        ))}
      </div>
      <div className="h-[400px] md:h-[600px]">
        <AvgDeliveryTimeChart data={supplier.deliveryData} />
      </div>
    </div>
  );
}
