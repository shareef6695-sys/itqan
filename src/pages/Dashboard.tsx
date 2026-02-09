import React from 'react';
import { DollarSign, FileText, Users, TrendingUp } from 'lucide-react';

const stats = [
  { name: 'Total Revenue', value: '$45,231.89', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
  { name: 'Outstanding Invoices', value: '$12,500.00', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-100' },
  { name: 'Total Clients', value: '245', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { name: 'Growth', value: '+12.5%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className={`flex-shrink-0 p-3 rounded-md ${item.bg}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                  <dd className="text-lg font-semibold text-gray-900">{item.value}</dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-gray-500 text-sm">
          <p>No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
};
