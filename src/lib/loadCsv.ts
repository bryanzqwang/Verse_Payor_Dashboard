import Papa from 'papaparse';
import { type ChartData } from '@/components/MetricCard';

export async function loadCsv(url: string): Promise<{ chartData: ChartData[]; value: string }> {
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
