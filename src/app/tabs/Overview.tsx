import { type MetricCardData } from '@/components/MetricCard';
import { MetricCard } from '@/components/MetricCard';
import { StatBox } from '@/components/StatBox';
import { AvgDeliveryTimeChart } from '@/components/AvgDeliveryTimeChart';
import { FacilityTable } from '@/components/FacilityTable';

export function Overview({ metrics }: { metrics: MetricCardData[] }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-[#093a5b]">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatBox label="On-Time Delivery Rate" value="95%" />
        <StatBox label="Performance Period Spend YTD (3-month lag)" value="$2.3M" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="md:h-[680px]">
          {metrics[0] && <MetricCard card={metrics[0]} className="h-full" />}
        </div>
        <div className="h-[460px] md:h-[680px]">
          <AvgDeliveryTimeChart unit="d" unitLabel="days" tickStep={2} minAxisMax={10} />
        </div>
      </div>
      <FacilityTable />
    </div>
  );
}
