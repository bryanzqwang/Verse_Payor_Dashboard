export interface PerformanceMetric {
  label: string;
  value: string;
}

export function PerformancePanel({
  title,
  metrics,
  muted,
  large,
  isStatic,
}: {
  title: string;
  metrics: PerformanceMetric[];
  muted?: boolean;
  large?: boolean;
  isStatic?: boolean;
}) {
  const bgClass = muted ? 'bg-gray-50' : isStatic ? 'bg-[#e6f2fa]' : 'bg-white';

  if (large) {
    const metric = metrics[0];
    return (
      <div className={`${bgClass} ${muted ? 'opacity-60' : ''} rounded-lg shadow p-7 flex flex-col`}>
        <p className={`text-sm font-semibold uppercase tracking-widest ${isStatic ? 'text-[#093a5b]' : 'text-gray-400'}`}>{title}</p>
        <p className={`text-sm mt-1 ${isStatic && !muted ? 'text-[#093a5b]' : 'text-gray-400'}`}>{metric.label}</p>
        <div className="flex-1 flex flex-col justify-center">
          <p className={`text-8xl font-normal ${muted ? 'text-gray-300' : 'text-[#093a5b]'}`}>
            {muted ? 'N/A' : metric.value}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgClass} ${muted ? 'opacity-60' : ''} rounded-lg shadow p-7 flex flex-col gap-5`}>
      <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
      {metrics.map((m, i) => (
        <div key={m.label} className="contents">
          {i > 0 && <hr className={isStatic ? 'border-[#c9e3f5]' : 'border-gray-100'} />}
          <div>
            <p className={`text-xs mb-2 ${isStatic ? 'text-[#093a5b]' : 'text-gray-400'}`}>{m.label}</p>
            <p className={`text-3xl font-bold ${muted ? 'text-gray-300' : 'text-[#093a5b]'}`}>{muted ? 'N/A' : m.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
