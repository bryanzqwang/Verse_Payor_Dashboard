"use client";

import { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
  value?: string;
  chartData?: ChartData[];
  secondaryChartData?: ChartData[];
}

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#FF4560', '#775DD0', '#00E396', '#FEB019', '#FF4560', '#008FFB', '#546E7A', '#26a69a', '#D10CE8'];

function Chart({
  chartData,
  label,
  onHover,
  onLeave,
}: {
  chartData: ChartData[];
  label?: string;
  onHover: (value: string) => void;
  onLeave: () => void;
}) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const categories = Object.keys(chartData[0])
    .filter((key) => key !== 'name')
    .sort((a, b) => (chartData[0][b] as number) - (chartData[0][a] as number));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activateCategory = (cat: string) => {
    setActiveCategory(cat);
    onHover((chartData[0][cat] as number).toLocaleString());
  };

  const clearCategory = () => {
    setActiveCategory(null);
    onLeave();
  };

  return (
    <div className="flex-1 flex flex-col">
      {label && <p className="text-sm font-medium text-gray-500 mb-2 text-center">{label}</p>}
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
                  fill={colors[idx % colors.length]}
                  shape={CustomBar}
                  onMouseEnter={() => activateCategory(cat)}
                  onMouseLeave={clearCategory}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-5 mt-1 text-center">
        {activeCategory && (
          <span className="text-xs text-gray-600 font-medium">{activeCategory}</span>
        )}
      </div>

      <div ref={dropdownRef} className="relative mt-1">
        <button
          onClick={() => setDropdownOpen((o) => !o)}
          className="w-full text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-500 flex justify-between items-center hover:bg-gray-50"
        >
          <span>View segments</span>
          <span>{dropdownOpen ? '▴' : '▾'}</span>
        </button>
        {dropdownOpen && (
          <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-20 max-h-48 overflow-y-auto">
            {categories.map((cat, idx) => (
              <div
                key={cat}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-default text-xs text-gray-700"
                onMouseEnter={() => activateCategory(cat)}
                onMouseLeave={clearCategory}
              >
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                {cat}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function MetricCard({ card, className }: { card: MetricCardData; className?: string }) {
  const [displayValue, setDisplayValue] = useState(card.value || '0');

  return (
    <div className={`bg-white p-6 rounded-lg shadow min-h-[500px] flex flex-col ${className ?? ''}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{card.title}</h2>
      <p className={`text-5xl font-bold ${card.color} mt-4 mb-6 text-center`}>{card.units ?? ''}{displayValue}</p>
      <div className="flex gap-6 flex-1">
        {card.chartData && (
          <Chart
            chartData={card.chartData}
            label={card.primaryTitle}
            onHover={setDisplayValue}
            onLeave={() => setDisplayValue(card.value || '0')}
          />
        )}
        {card.secondaryChartData && (
          <div className="flex-1 flex flex-col border-l pl-6">
            <Chart
              chartData={card.secondaryChartData}
              label={card.secondaryTitle}
              onHover={setDisplayValue}
              onLeave={() => setDisplayValue(card.value || '0')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
