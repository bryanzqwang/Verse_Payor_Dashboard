"use client";

import { useEffect, useRef, useState } from 'react';
import Papa from 'papaparse';
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
  deliveryData: { product: string; hours: number }[];
}

interface CategoryRow {
  supplier: string;
  category: string;
  slaRate: string;
  avgDeliveryHours: string;
}

interface DeliveryRow {
  supplier: string;
  product: string;
  hours: string;
}

function SupplierDropdown({
  suppliers,
  selected,
  onSelect,
}: {
  suppliers: SupplierServiceQuality[];
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
          {suppliers.map((s) => (
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
  const [suppliers, setSuppliers] = useState<SupplierServiceQuality[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');

  useEffect(() => {
    Promise.all([
      fetch('/data/service-quality-categories.csv').then((r) => r.text()),
      fetch('/data/service-quality-delivery-time.csv').then((r) => r.text()),
    ]).then(([categoriesCsv, deliveryCsv]) => {
      const categoryRows = (Papa.parse(categoriesCsv, { header: true }).data as CategoryRow[]).filter((r) => r.supplier);
      const deliveryRows = (Papa.parse(deliveryCsv, { header: true }).data as DeliveryRow[]).filter((r) => r.supplier);

      const supplierOrder: string[] = [];
      categoryRows.forEach((r) => {
        if (!supplierOrder.includes(r.supplier)) supplierOrder.push(r.supplier);
      });

      const built = supplierOrder.map((name) => ({
        name,
        categories: categoryRows
          .filter((r) => r.supplier === name)
          .map((r) => ({ category: r.category, slaRate: `${r.slaRate}%`, avgDelivery: `${r.avgDeliveryHours}h` })),
        deliveryData: deliveryRows
          .filter((r) => r.supplier === name)
          .map((r) => ({ product: r.product, hours: parseFloat(r.hours) })),
      }));

      setSuppliers(built);
      setSelectedSupplier((prev) => prev || built[0]?.name || '');
    });
  }, []);

  const supplier = suppliers.find((s) => s.name === selectedSupplier);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#093a5b]">Service Quality</h1>
        {suppliers.length > 0 && (
          <SupplierDropdown suppliers={suppliers} selected={selectedSupplier} onSelect={setSelectedSupplier} />
        )}
      </div>
      {supplier && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {supplier.categories.map((c) => (
              <ServiceCategoryCard key={c.category} category={c.category} slaRate={c.slaRate} avgDelivery={c.avgDelivery} />
            ))}
          </div>
          <div className="h-[400px] md:h-[600px]">
            <AvgDeliveryTimeChart data={supplier.deliveryData} />
          </div>
        </>
      )}
    </div>
  );
}
