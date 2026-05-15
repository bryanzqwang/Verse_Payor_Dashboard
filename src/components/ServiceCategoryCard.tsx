export function ServiceCategoryCard({ category, slaRate, avgDelivery }: { category: string; slaRate: string; avgDelivery: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-7 flex flex-col gap-5">
      <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{category}</p>
      <div>
        <p className="text-xs text-gray-400 mb-2">SLA Adherence Rate</p>
        <p className="text-3xl font-bold text-[#093a5b]">{slaRate}</p>
      </div>
      <hr className="border-gray-100" />
      <div>
        <p className="text-xs text-gray-400 mb-2">Average Delivery Time</p>
        <p className="text-3xl font-bold text-[#093a5b]">{avgDelivery}</p>
      </div>
    </div>
  );
}
