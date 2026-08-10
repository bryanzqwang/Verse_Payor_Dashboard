export interface PerformanceMetric {
  label: string;
  value: string;
}

export function PerformancePanel({
  title,
  metrics,
  muted,
  large,
}: {
  title: string;
  metrics: PerformanceMetric[];
  muted?: boolean;
  large?: boolean;
}) {
  if (large) {
    const metric = metrics[0];
    return (
      <div className="bg-white rounded-lg shadow p-7 flex flex-col">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
        <p className="text-sm text-gray-400 mt-1">{metric.label}</p>
        <div className="flex-1 flex flex-col justify-center">
          <p className={`text-8xl font-normal ${muted ? 'text-gray-300' : 'text-[#093a5b]'}`}>
            {muted ? 'N/A' : metric.value}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-7 flex flex-col gap-5">
      <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
      {metrics.map((m, i) => (
        <div key={m.label} className="contents">
          {i > 0 && <hr className="border-gray-100" />}
          <div>
            <p className="text-xs text-gray-400 mb-2">{m.label}</p>
            <p className={`text-3xl font-bold ${muted ? 'text-gray-300' : 'text-[#093a5b]'}`}>{muted ? 'N/A' : m.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
