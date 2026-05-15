import { AdherenceChart } from '@/components/AdherenceChart';

export function DiseaseManagement() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-[#093a5b]">Disease Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AdherenceChart title="CGM Adherence" dataUrl="/data/device-adherence-cgm.csv" />
        <AdherenceChart title="CPAP Adherence" dataUrl="/data/device-adherence-cpap.csv" />
      </div>
    </div>
  );
}
