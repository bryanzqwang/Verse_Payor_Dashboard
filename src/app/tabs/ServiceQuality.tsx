import { ServiceCategoryCard } from '@/components/ServiceCategoryCard';
import { AvgDeliveryTimeChart } from '@/components/AvgDeliveryTimeChart';

export function ServiceQuality() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-[#093a5b]">Service Quality</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ServiceCategoryCard category="Bent Metal" slaRate="91%" avgDelivery="18h" />
        <ServiceCategoryCard category="Discharge" slaRate="87%" avgDelivery="6h" />
        <ServiceCategoryCard category="Mail Order" slaRate="94%" avgDelivery="37h" />
        <ServiceCategoryCard category="Oxygen" slaRate="89%" avgDelivery="24h" />
      </div>
      <div className="h-[400px] md:h-[600px]">
        <AvgDeliveryTimeChart />
      </div>
    </div>
  );
}
