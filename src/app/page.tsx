interface MetricCard {
  title: string;
  value: string;
  color: string;
}

interface KeyMetric {
  label: string;
  value: string;
}

interface Activity {
  description: string;
}

const metricCards: MetricCard[] = [
  { title: 'Total Patients', value: '12,345', color: 'text-blue-600' },
  { title: 'Active Claims', value: '2,567', color: 'text-green-600' },
  { title: 'Revenue', value: '$1.2M', color: 'text-purple-600' },
  { title: 'Satisfaction', value: '94%', color: 'text-yellow-600' },
];

const keyMetrics: KeyMetric[] = [
  { label: 'Average Claim Processing Time', value: '3.2 days' },
  { label: 'Denial Rate', value: '5.1%' },
  { label: 'Customer Retention', value: '87%' },
];

const recentActivities: Activity[] = [
  { description: 'New patient enrollment: John Doe' },
  { description: 'Claim approved: $5,000' },
  { description: 'Policy update: Premium increase' },
  { description: 'Report generated: Q1 Summary' },
];

export default function Home(): JSX.Element {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Healthcare Insurance Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricCards.map((card: MetricCard, index: number) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-800">{card.title}</h2>
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Metrics</h2>
            <ul className="space-y-2">
              {keyMetrics.map((metric: KeyMetric, index: number) => (
                <li key={index} className="flex justify-between">
                  <span>{metric.label}</span>
                  <span className="font-semibold">{metric.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <ul className="space-y-2">
              {recentActivities.map((activity: Activity, index: number) => (
                <li key={index} className="text-sm text-gray-600">{activity.description}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}