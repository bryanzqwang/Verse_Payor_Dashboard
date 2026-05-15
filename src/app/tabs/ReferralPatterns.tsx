import { StatBox } from '@/components/StatBox';
import { FacilityTable } from '@/components/FacilityTable';

export function ReferralPatterns() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-[#093a5b]">Referral Patterns</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Online Ordering Rate" value="81%" />
        <StatBox label="% of Orders Validated" value="94.2%" />
        <StatBox label="% of Claims Paid to Verse" value="88.7%" />
        <StatBox label="Avg. Subcontractor AR Days" value="22.4" />
      </div>
      <FacilityTable />
    </div>
  );
}
