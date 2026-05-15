export function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow flex flex-col justify-center">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-4xl font-bold text-[#093a5b] mt-2">{value}</p>
    </div>
  );
}
