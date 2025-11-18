'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Target,
  PieChart,
  BarChart3,
  Activity,
  Zap,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";
import { crmRealtime } from '@/lib/realtime-crm';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_value: number;
  monthly_revenue: number;
  pipeline_value: number;
  average_project_value: number;
  conversion_rate: number;
  stage_distribution: Record<string, number>;
  metrics: {
    lead_count: number;
    contract_signed_count: number;
    completion_rate: number;
  };
}

interface TeamPerformance {
  total_leads: number;
  converted_leads: number;
  avg_response_time: number;
  revenue_generated: number;
}

export const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  // Real-time updates handler for projects and leads
  const handleDataUpdate = useCallback((payload: any) => {
    // Refresh analytics when significant changes occur
    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
      fetchAnalyticsData();
      setLastUpdated(new Date());

      toast({
        title: 'Analytics Updated',
        description: 'Dashboard data refreshed with latest changes',
        duration: 2000,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchAnalyticsData();

    // Set up real-time subscriptions for analytics updates
    const projectSubscription = crmRealtime.subscribeToProjects(handleDataUpdate);
    const leadSubscription = crmRealtime.subscribeToLeads(handleDataUpdate);
    setRealtimeConnected(true);

    // Auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchAnalyticsData();
    }, 5 * 60 * 1000);

    return () => {
      crmRealtime.disconnect();
      clearInterval(refreshInterval);
      setRealtimeConnected(false);
    };
  }, [timeRange, handleDataUpdate]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/crm/analytics?timeRange=${timeRange}&includeTimeSeries=true`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const getStageColor = (stage: string): string => {
    const stageColors: Record<string, string> = {
      'lead': 'bg-blue-500',
      'contacted': 'bg-yellow-500',
      'qualified': 'bg-purple-500',
      'proposal_sent': 'bg-orange-500',
      'contract_signed': 'bg-green-500',
      'permits_submitted': 'bg-indigo-500',
      'permits_approved': 'bg-cyan-500',
      'installation_scheduled': 'bg-pink-500',
      'installation_complete': 'bg-emerald-500',
      'inspection_passed': 'bg-lime-500',
      'pto_granted': 'bg-green-600'
    };
    return stageColors[stage] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Solar CRM performance insights and metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.total_value)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analyticsData.monthly_revenue)} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.pipeline_value)}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.active_projects} active projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analyticsData.conversion_rate)}</div>
            <p className="text-xs text-muted-foreground">
              Lead to contract conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Project Value</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.average_project_value)}</div>
            <p className="text-xs text-muted-foreground">
              Per solar installation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Project Status Distribution
                </CardTitle>
                <CardDescription>
                  Current breakdown of project statuses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Projects</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {analyticsData.active_projects}
                    </Badge>
                  </div>
                  <Progress value={(analyticsData.active_projects / analyticsData.total_projects) * 100} />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed Projects</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {analyticsData.completed_projects}
                    </Badge>
                  </div>
                  <Progress value={(analyticsData.completed_projects / analyticsData.total_projects) * 100} />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Completion Rate</span>
                    <span className="font-bold text-green-600">
                      {formatPercentage(analyticsData.metrics.completion_rate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Analytics
                </CardTitle>
                <CardDescription>
                  Financial performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(analyticsData.monthly_revenue)}
                    </div>
                    <div className="text-xs text-green-700">Monthly Revenue</div>
                  </div>

                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(analyticsData.pipeline_value)}
                    </div>
                    <div className="text-xs text-blue-700">Pipeline Value</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Revenue Target Progress</span>
                    <span>67%</span>
                  </div>
                  <Progress value={67} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Pipeline Analysis</CardTitle>
              <CardDescription>
                Track project progression through each stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analyticsData.stage_distribution).map(([stage, count]) => (
                  <div key={stage} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">
                        {stage.replace('_', ' ')}
                      </span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStageColor(stage)}`}></div>
                      <span className="text-xs text-gray-600">
                        {analyticsData.total_projects > 0
                          ? formatPercentage((count / analyticsData.total_projects) * 100)
                          : '0%'
                        } of total
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Lead Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Leads</span>
                  <span className="font-bold">{analyticsData.metrics.lead_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Contracts Signed</span>
                  <span className="font-bold">{analyticsData.metrics.contract_signed_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Conversion Rate</span>
                  <span className="font-bold text-green-600">
                    {formatPercentage(analyticsData.conversion_rate)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Efficiency Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 mb-2">A+</div>
                  <div className="text-sm text-gray-600">Overall Performance Grade</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Avg Response Time</div>
                    <div className="font-bold">2.3 hours</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Customer Satisfaction</div>
                    <div className="font-bold">4.8/5.0</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Forecasting</CardTitle>
              <CardDescription>
                Projected revenue and project completions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(analyticsData.pipeline_value * 1.2)}
                  </div>
                  <div className="text-sm text-blue-700">Projected 30-day Revenue</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(analyticsData.active_projects * 0.75)}
                  </div>
                  <div className="text-sm text-green-700">Expected Completions</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(analyticsData.metrics.lead_count * 1.15)}
                  </div>
                  <div className="text-sm text-purple-700">Projected New Leads</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Growth Trajectory</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Revenue Growth (YoY)</span>
                    <span className="text-green-600 font-medium">+23%</span>
                  </div>
                  <Progress value={78} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pipeline Health Score</span>
                    <span className="text-blue-600 font-medium">85/100</span>
                  </div>
                  <Progress value={85} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};