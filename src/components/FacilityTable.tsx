"use client";

import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';

type SortCol = 'facility' | 'orderVolume' | 'totalSpend';
type SortDir = 'asc' | 'desc';

export function FacilityTable() {
  const [rows, setRows] = useState<{ facility: string; orderVolume: string; totalSpend: string }[]>([]);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [sortCol, setSortCol] = useState<SortCol>('facility');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
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

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const sortedRows = [...rows].sort((a, b) => {
    let cmp = 0;
    if (sortCol === 'facility') cmp = a.facility.localeCompare(b.facility);
    else if (sortCol === 'orderVolume') cmp = Number(a.orderVolume) - Number(b.orderVolume);
    else cmp = Number(a.totalSpend) - Number(b.totalSpend);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const cols: { label: string; col: SortCol; align: string }[] = [
    { label: 'Referring Facility', col: 'facility',    align: 'text-left' },
    { label: 'Order Volume',       col: 'orderVolume', align: 'text-right' },
    { label: 'Total Spend',        col: 'totalSpend',  align: 'text-right' },
  ];

  return (
    <div className="relative rounded-lg shadow overflow-hidden">
      <div ref={scrollRef} className="bg-white rounded-lg overflow-y-auto max-h-[408px]" onScroll={handleScroll}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {cols.map(({ label, col, align }) => (
                <th
                  key={col}
                  onClick={() => toggleSort(col)}
                  className={`sticky top-0 bg-gray-100 border border-gray-200 px-3 py-2 ${align} font-semibold text-[#093a5b] z-10 cursor-pointer select-none hover:bg-gray-200`}
                >
                  {label}
                  <span className={`ml-1 text-[10px] ${sortCol === col ? 'text-[#093a5b]' : 'text-gray-300'}`}>
                    {sortCol === col && sortDir === 'desc' ? '▼' : '▲'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, i) => (
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
        <div className="absolute left-0 right-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none z-20" style={{ top: 37 }} />
      )}
      {canScrollDown && (
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
      )}
    </div>
  );
}
