"use client";

import { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type SortCol = 'category' | 'volume' | 'pct';
type SortDir = 'asc' | 'desc';

function CategoryTable({
  chartData,
  label,
  units,
  onHover,
  onLeave,
}: {
  chartData: ChartData[];
  label?: string;
  units?: string;
  onHover: (value: string) => void;
  onLeave: () => void;
}) {
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [sortCol, setSortCol] = useState<SortCol>('category');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const scrollRef = useRef<HTMLDivElement>(null);

  const allCategories = Object.keys(chartData[0]).filter((key) => key !== 'name');
  const total = allCategories.reduce((sum, cat) => sum + (chartData[0][cat] as number), 0);

  const rows = allCategories
    .map((cat) => ({ cat, value: chartData[0][cat] as number, pct: total > 0 ? (chartData[0][cat] as number) / total * 100 : 0 }))
    .sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'category') cmp = a.cat.localeCompare(b.cat);
      else if (sortCol === 'volume') cmp = a.value - b.value;
      else cmp = a.pct - b.pct;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const toggleSort = (col: SortCol) => {
    if (sortCol === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollDown(el.scrollHeight > el.clientHeight);
  }, [chartData]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 0);
    setCanScrollDown(Math.ceil(el.scrollTop + el.clientHeight) < el.scrollHeight);
  };

  const cols: { label: string; col: SortCol; align: string }[] = [
    { label: 'Category', col: 'category', align: 'text-left' },
    { label: 'Volume',   col: 'volume',   align: 'text-right' },
    { label: '% of Total', col: 'pct',   align: 'text-right' },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {label && <p className="text-sm font-medium text-gray-500 mb-2 text-center">{label}</p>}
      <div className="relative rounded-lg overflow-hidden">
        <div ref={scrollRef} className="overflow-y-auto max-h-[320px]" onScroll={handleScroll}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {cols.map(({ label: colLabel, col, align }) => (
                  <th
                    key={col}
                    onClick={() => toggleSort(col)}
                    className={`sticky top-0 bg-gray-100 px-3 py-2 ${align} text-xs font-semibold text-[#093a5b] cursor-pointer select-none hover:bg-gray-200`}
                  >
                    {colLabel}
                    <span className={`ml-1 text-[10px] ${sortCol === col ? 'text-[#093a5b]' : 'text-gray-300'}`}>
                      {sortCol === col && sortDir === 'desc' ? '▼' : '▲'}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ cat, value, pct }, i) => (
                <tr
                  key={cat}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  onMouseEnter={() => onHover(value.toLocaleString())}
                  onMouseLeave={onLeave}
                >
                  <td className="px-3 py-1.5 text-xs text-[#093a5b]">{cat}</td>
                  <td className="px-3 py-1.5 text-xs text-gray-600 text-right">{units}{value.toLocaleString()}</td>
                  <td className="px-3 py-1.5 text-xs text-gray-500 text-right">{pct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {canScrollUp && (
          <div className="absolute left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none z-20" style={{ top: 29 }} />
        )}
        {canScrollDown && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none z-20" />
        )}
      </div>
    </div>
  );
}

export interface ChartData {
  name: string;
  [key: string]: string | number;
}

export interface MetricCardData {
  title: string;
  color: string;
  dataUrl: string;
  secondaryDataUrl: string;
  primaryTitle?: string;
  secondaryTitle?: string;
  units?: string;
  palette?: string[];
  value?: string;
  chartData?: ChartData[];
  secondaryChartData?: ChartData[];
}

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#FF4560', '#775DD0', '#00E396', '#FEB019', '#FF4560', '#008FFB', '#546E7A', '#26a69a', '#D10CE8'];

function Chart({
  chartData,
  label,
  palette,
  onHover,
  onLeave,
}: {
  chartData: ChartData[];
  label?: string;
  palette?: string[];
  onHover: (value: string) => void;
  onLeave: () => void;
}) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [pinnedCategory, setPinnedCategory] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activePalette = palette ?? colors;
  const categories = Object.keys(chartData[0])
    .filter((key) => key !== 'name')
    .sort((a, b) => (chartData[0][b] as number) - (chartData[0][a] as number));

  const activeCategory = hoveredCategory ?? pinnedCategory;
  const dropdownLabel = hoveredCategory ?? pinnedCategory ?? 'View segments';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hoverCategory = (cat: string) => {
    setHoveredCategory(cat);
    onHover((chartData[0][cat] as number).toLocaleString());
  };

  const clearHover = () => {
    setHoveredCategory(null);
    if (pinnedCategory) {
      onHover((chartData[0][pinnedCategory] as number).toLocaleString());
    } else {
      onLeave();
    }
  };

  const pinCategory = (cat: string) => {
    setPinnedCategory(cat);
    onHover((chartData[0][cat] as number).toLocaleString());
    setDropdownOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center justify-between mb-1">
        {label && <p className="text-sm font-medium text-gray-500">{label}</p>}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-500 flex items-center gap-1.5 hover:bg-gray-50 max-w-[160px]"
          >
            <span className="truncate">{dropdownLabel}</span>
            <span className="flex-shrink-0">{dropdownOpen ? '▴' : '▾'}</span>
          </button>
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-20 max-h-48 overflow-y-auto min-w-[160px]">
              {categories.map((cat, idx) => (
                <div
                  key={cat}
                  className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-xs text-[#093a5b] ${pinnedCategory === cat ? 'bg-[#e6f2fa]' : 'hover:bg-gray-50'}`}
                  onClick={() => pinCategory(cat)}
                  onMouseEnter={() => hoverCategory(cat)}
                  onMouseLeave={clearHover}
                >
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: activePalette[idx % activePalette.length] }} />
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={() => null} />
            {categories.map((cat, idx) => {
              const CustomBar = (props: any) => {
                const { fill, x, y, width, height } = props;
                const isActive = activeCategory === cat;
                const scale = isActive ? 1.1 : 1;
                const opacity = activeCategory && !isActive ? 0.5 : 1;
                const newWidth = width * scale;
                const newHeight = height * scale;
                const newX = x - (newWidth - width) / 2;
                const newY = y - (newHeight - height) / 2;
                return <rect x={newX} y={newY} width={newWidth} height={newHeight} fill={fill} opacity={opacity} />;
              };
              return (
                <Bar
                  key={cat}
                  dataKey={cat}
                  stackId="a"
                  fill={activePalette[idx % activePalette.length]}
                  shape={CustomBar}
                  onMouseEnter={() => hoverCategory(cat)}
                  onMouseLeave={clearHover}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MetricCard({ card, className }: { card: MetricCardData; className?: string }) {
  const [displayValue, setDisplayValue] = useState(card.value || '0');

  return (
    <div className={`bg-white p-6 rounded-lg shadow min-h-[500px] flex flex-col ${className ?? ''}`}>
      <h2 className="text-xl font-semibold text-[#093a5b] mb-10">{card.title}</h2>
      <div className="flex gap-6 flex-1">
        {card.secondaryChartData && (
          <div className="flex-1 flex flex-col max-h-[380px]">
            <p className={`text-5xl font-bold ${card.color} mb-4 text-center`}>{card.units ?? ''}{displayValue}</p>
            <Chart
              chartData={card.secondaryChartData}
              label={card.secondaryTitle}
              palette={card.palette}
              onHover={setDisplayValue}
              onLeave={() => setDisplayValue(card.value || '0')}
            />
          </div>
        )}
        {card.chartData && (
          <div className="flex-1 flex flex-col border-l pl-6 pt-[16px]">
            <CategoryTable
              chartData={card.chartData}
              label={card.primaryTitle}
              units={card.units}
              onHover={setDisplayValue}
              onLeave={() => setDisplayValue(card.value || '0')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
