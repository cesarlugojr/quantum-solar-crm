'use client';

import { TrendingUp, TrendingDown, Users, Building2, Target, DollarSign } from 'lucide-react';
import type { DashboardMetrics } from '@/types/crm';
import { formatCurrency, formatPercentage } from '@/types/crm';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Total Leads',
      value: metrics.totalLeads.toLocaleString(),
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      trend: null,
    },
    {
      title: 'Active Projects',
      value: metrics.activeProjects.toLocaleString(),
      subtitle: `of ${metrics.totalProjects} total`,
      icon: Building2,
      color: 'from-orange-500 to-orange-600',
      trend: null,
    },
    {
      title: 'Conversion Rate',
      value: formatPercentage(metrics.conversionRate),
      icon: Target,
      color: 'from-green-500 to-green-600',
      trend: metrics.conversionRate > 15 ? 'up' : 'down',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(metrics.monthlyRevenue),
      subtitle: `${formatCurrency(metrics.totalRevenue)} total`,
      icon: DollarSign,
      color: 'from-[#ff0000] to-[#cc0000]',
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="relative overflow-hidden bg-gray-900/50 border border-gray-700 rounded-lg p-6 hover:bg-gray-900/70 transition-colors"
        >
          {/* Icon Background */}
          <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-full`}></div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 text-sm font-medium">{card.title}</p>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} bg-opacity-10`}>
                <card.icon className={`h-5 w-5 text-white`} />
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-white">{card.value}</p>
                {card.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                )}
              </div>

              {card.trend && (
                <div className={`flex items-center space-x-1 ${
                  card.trend === 'up' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {card.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Gradient Line */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`}></div>
        </div>
      ))}
    </div>
  );
}
