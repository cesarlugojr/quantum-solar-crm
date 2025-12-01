import { Metadata } from 'next';
import { Suspense } from 'react';
import {
  BarChart3,
  Calendar,
  Clock,
  Zap,
  Battery,
  Wrench,
  TrendingUp,
} from 'lucide-react';
import { getReportData } from '../actions';
import { formatCurrency } from '@/types/crm';

export const metadata: Metadata = {
  title: 'Reports | Quantum Solar CRM',
  description: 'Project analytics and performance metrics',
};

async function AddersBreakdownCard() {
  const data = await getReportData('adders');

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <BarChart3 className="h-5 w-5 text-blue-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">Projects by Adders Breakdown</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-gray-400">MPU Only</span>
          </div>
          <p className="text-2xl font-bold text-white">{data?.mpu_only || 0}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Battery className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-400">Battery Only</span>
          </div>
          <p className="text-2xl font-bold text-white">{data?.battery_only || 0}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-400">Trench Only</span>
          </div>
          <p className="text-2xl font-bold text-white">{data?.trench_only || 0}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-400">MPU + Battery</span>
          </div>
          <p className="text-2xl font-bold text-white">{data?.mpu_battery || 0}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-gray-400">MPU + Trench</span>
          </div>
          <p className="text-2xl font-bold text-white">{data?.mpu_trench || 0}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Battery className="h-4 w-4 text-teal-400" />
            <span className="text-sm text-gray-400">Battery + Trench</span>
          </div>
          <p className="text-2xl font-bold text-white">{data?.battery_trench || 0}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-red-400" />
            <span className="text-sm text-gray-400">All Three</span>
          </div>
          <p className="text-2xl font-bold text-white">{data?.mpu_battery_trench || 0}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">No Adders</span>
          </div>
          <p className="text-2xl font-bold text-white">{data?.no_adders || 0}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total Projects</span>
          <span className="text-white font-medium">{data?.total_projects || 0}</span>
        </div>
      </div>
    </div>
  );
}

async function AverageDaysMetricsCard() {
  const data = await getReportData('average-days');

  const metrics = data || [];
  const latestMonth = metrics[0]; // Most recent month

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Clock className="h-5 w-5 text-purple-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">Average Days Between Stages</h2>
      </div>

      {latestMonth ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Permit Approved → Install Scheduled</p>
              <p className="text-2xl font-bold text-white">
                {latestMonth.avg_days_permit_to_install_scheduled?.toFixed(1) || '-'} days
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Install Scheduled → Install Complete</p>
              <p className="text-2xl font-bold text-white">
                {latestMonth.avg_days_install_scheduled_to_complete?.toFixed(1) || '-'} days
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Install Complete → Inspection</p>
              <p className="text-2xl font-bold text-white">
                {latestMonth.avg_days_install_to_inspection?.toFixed(1) || '-'} days
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Inspection Scheduled → Complete</p>
              <p className="text-2xl font-bold text-white">
                {latestMonth.avg_days_inspection_scheduled_to_complete?.toFixed(1) || '-'} days
              </p>
            </div>
          </div>

          {/* Monthly Trend Table */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Monthly Trend</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 pb-2">Month</th>
                    <th className="text-right text-gray-400 pb-2">Permit→Install</th>
                    <th className="text-right text-gray-400 pb-2">Install Time</th>
                    <th className="text-right text-gray-400 pb-2">To Inspection</th>
                    <th className="text-right text-gray-400 pb-2">Inspection</th>
                    <th className="text-right text-gray-400 pb-2">Projects</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.slice(0, 6).map((month: any) => (
                    <tr key={month.month} className="border-b border-gray-800">
                      <td className="py-2 text-white">
                        {new Date(month.month).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-2 text-right text-gray-300">
                        {month.avg_days_permit_to_install_scheduled?.toFixed(1) || '-'}
                      </td>
                      <td className="py-2 text-right text-gray-300">
                        {month.avg_days_install_scheduled_to_complete?.toFixed(1) || '-'}
                      </td>
                      <td className="py-2 text-right text-gray-300">
                        {month.avg_days_install_to_inspection?.toFixed(1) || '-'}
                      </td>
                      <td className="py-2 text-right text-gray-300">
                        {month.avg_days_inspection_scheduled_to_complete?.toFixed(1) || '-'}
                      </td>
                      <td className="py-2 text-right text-gray-300">
                        {month.project_count || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No data available yet</p>
          <p className="text-sm text-gray-600 mt-1">
            Data will appear once projects have permit approval dates
          </p>
        </div>
      )}
    </div>
  );
}

async function MonthlyKWCard() {
  const data = await getReportData('monthly-kw');

  const months = data || [];

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-500/20 rounded-lg">
          <Zap className="h-5 w-5 text-yellow-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">Permit Approved kW by Month</h2>
      </div>

      {months.length > 0 ? (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Last Month</p>
              <p className="text-2xl font-bold text-white">
                {months[0]?.total_kw?.toFixed(1) || 0} kW
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Avg per Project</p>
              <p className="text-2xl font-bold text-white">
                {months[0]?.avg_kw_per_project?.toFixed(1) || 0} kW
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Projects</p>
              <p className="text-2xl font-bold text-white">
                {months[0]?.project_count || 0}
              </p>
            </div>
          </div>

          {/* Monthly Trend Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 pb-2">Month</th>
                  <th className="text-right text-gray-400 pb-2">Total kW</th>
                  <th className="text-right text-gray-400 pb-2">Avg kW/Project</th>
                  <th className="text-right text-gray-400 pb-2">Projects</th>
                </tr>
              </thead>
              <tbody>
                {months.slice(0, 12).map((month: any) => (
                  <tr key={month.month} className="border-b border-gray-800">
                    <td className="py-2 text-white">
                      {new Date(month.month).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-2 text-right text-gray-300">
                      {month.total_kw?.toFixed(1) || 0} kW
                    </td>
                    <td className="py-2 text-right text-gray-300">
                      {month.avg_kw_per_project?.toFixed(1) || 0} kW
                    </td>
                    <td className="py-2 text-right text-gray-300">
                      {month.project_count || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No data available yet</p>
          <p className="text-sm text-gray-600 mt-1">
            Data will appear once projects have permit approval dates
          </p>
        </div>
      )}
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-gray-700 rounded-lg"></div>
        <div className="h-5 w-48 bg-gray-700 rounded"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-4">
            <div className="h-4 w-24 bg-gray-700 rounded mb-2"></div>
            <div className="h-8 w-16 bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-gray-400 mt-1">
          Project analytics and performance metrics
        </p>
      </div>

      {/* Report Cards */}
      <div className="space-y-6">
        <Suspense fallback={<LoadingCard />}>
          <AddersBreakdownCard />
        </Suspense>

        <Suspense fallback={<LoadingCard />}>
          <AverageDaysMetricsCard />
        </Suspense>

        <Suspense fallback={<LoadingCard />}>
          <MonthlyKWCard />
        </Suspense>
      </div>
    </div>
  );
}
