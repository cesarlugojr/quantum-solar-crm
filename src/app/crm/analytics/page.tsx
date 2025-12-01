import { Metadata } from 'next';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Analytics | Quantum Solar CRM',
  description: 'Business analytics and performance insights',
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">
          Business performance insights and trends
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl mb-6">
          <BarChart3 className="h-8 w-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard Coming Soon</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          We're building comprehensive analytics to help you track lead conversion rates, 
          revenue trends, team performance, and more.
        </p>

        {/* Preview Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">Conversion Tracking</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <DollarSign className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">Revenue Analytics</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">Team Performance</p>
          </div>
        </div>
      </div>
    </div>
  );
}
