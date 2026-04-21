export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Healthcare Insurance Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800">Total Patients</h2>
            <p className="text-3xl font-bold text-blue-600">12,345</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800">Active Claims</h2>
            <p className="text-3xl font-bold text-green-600">2,567</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800">Revenue</h2>
            <p className="text-3xl font-bold text-purple-600">$1.2M</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800">Satisfaction</h2>
            <p className="text-3xl font-bold text-yellow-600">94%</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Metrics</h2>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Average Claim Processing Time</span>
                <span className="font-semibold">3.2 days</span>
              </li>
              <li className="flex justify-between">
                <span>Denial Rate</span>
                <span className="font-semibold">5.1%</span>
              </li>
              <li className="flex justify-between">
                <span>Customer Retention</span>
                <span className="font-semibold">87%</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600">New patient enrollment: John Doe</li>
              <li className="text-sm text-gray-600">Claim approved: $5,000</li>
              <li className="text-sm text-gray-600">Policy update: Premium increase</li>
              <li className="text-sm text-gray-600">Report generated: Q1 Summary</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}