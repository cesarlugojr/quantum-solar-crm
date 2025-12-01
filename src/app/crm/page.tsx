import { Suspense } from 'react';
import { Metadata } from 'next';
import { getDashboardMetrics, getRevenueData, getPipelineData, getCashFlowForecast } from './actions';
import { MetricsCards } from '@/components/crm/executive-dashboard/MetricsCards';
import { MetricsCardsSkeleton, ChartSkeleton } from '@/components/crm/LoadingSkeletons';

export const metadata: Metadata = {
  title: 'Dashboard | Quantum Solar CRM',
  description: 'Executive dashboard with KPIs, revenue analytics, and cash flow forecasting',
};

// Server Component to fetch and display metrics
async function DashboardMetrics() {
  const metrics = await getDashboardMetrics();
  return <MetricsCards metrics={metrics} />;
}

// Server Component for revenue chart
async function RevenueChartSection() {
  const revenueData = await getRevenueData(6); // Last 6 months

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Revenue by Type</h2>
      <div className="h-64 flex items-center justify-center text-gray-500">
        Revenue chart (Tremor component to be added)
        <br />
        <span className="text-xs">Data: {revenueData.length} months</span>
      </div>
    </div>
  );
}

// Server Component for pipeline funnel
async function PipelineFunnelSection() {
  const pipelineData = await getPipelineData();

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Pipeline Funnel</h2>
      <div className="h-64 flex items-center justify-center text-gray-500">
        Pipeline funnel (Recharts component to be added)
        <br />
        <span className="text-xs">Stages: {pipelineData.length}</span>
      </div>
    </div>
  );
}

// Server Component for cash flow forecast
async function CashFlowForecastSection() {
  const cashFlowData = await getCashFlowForecast(13);

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">13-Week Cash Flow Forecast</h2>
      <div className="h-80 flex items-center justify-center text-gray-500">
        Cash flow forecast chart (Recharts component to be added)
        <br />
        <span className="text-xs">Weeks: {cashFlowData.length}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome to Quantum Solar CRM - Your solar business command center
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <Suspense fallback={<MetricsCardsSkeleton />}>
        <DashboardMetrics />
      </Suspense>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Suspense fallback={<ChartSkeleton />}>
          <RevenueChartSection />
        </Suspense>

        {/* Pipeline Funnel */}
        <Suspense fallback={<ChartSkeleton />}>
          <PipelineFunnelSection />
        </Suspense>
      </div>

      {/* Cash Flow Forecast */}
      <Suspense fallback={<ChartSkeleton />}>
        <CashFlowForecastSection />
      </Suspense>
    </div>
  );
}
