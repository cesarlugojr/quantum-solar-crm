import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyticsDashboard } from '../AnalyticsDashboard';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockAnalyticsData = {
  total_projects: 50,
  active_projects: 35,
  completed_projects: 15,
  total_value: 1250000,
  monthly_revenue: 180000,
  pipeline_value: 875000,
  average_project_value: 25000,
  conversion_rate: 28.5,
  stage_distribution: {
    lead: 12,
    contacted: 8,
    qualified: 6,
    proposal_sent: 4,
    contract_signed: 8,
    permits_submitted: 3,
    permits_approved: 2,
    installation_scheduled: 3,
    installation_complete: 2,
    inspection_passed: 1,
    pto_granted: 1,
  },
  metrics: {
    lead_count: 26,
    contract_signed_count: 24,
    completion_rate: 30.0,
  },
};

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default fetch responses
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/crm/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockAnalyticsData }),
        });
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' }),
      });
    });
  });

  it('should render dashboard header', async () => {
    render(<AnalyticsDashboard />);

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Solar CRM performance insights and metrics')).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    render(<AnalyticsDashboard />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render time range selector', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  it('should display key metrics cards', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('Pipeline Value')).toBeInTheDocument();
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
      expect(screen.getByText('Avg Project Value')).toBeInTheDocument();
    });
  });

  it('should format currency values correctly', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('$1,250,000')).toBeInTheDocument(); // total value
      expect(screen.getByText('$875,000')).toBeInTheDocument(); // pipeline value
      expect(screen.getByText('$25,000')).toBeInTheDocument(); // avg project value
      expect(screen.getByText('$180,000')).toBeInTheDocument(); // monthly revenue
    });
  });

  it('should format percentage values correctly', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('28.5%')).toBeInTheDocument(); // conversion rate
    });
  });

  it('should display project counts in metrics', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('35 active')).toBeInTheDocument(); // active projects
      expect(screen.getByText('50')).toBeInTheDocument(); // total projects
      expect(screen.getByText('15')).toBeInTheDocument(); // completed projects
    });
  });

  it('should render analytics tabs', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Pipeline' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Performance' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Forecasting' })).toBeInTheDocument();
    });
  });

  it('should switch between tabs', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Project Status Distribution')).toBeInTheDocument();
    });

    // Click on Pipeline tab
    const pipelineTab = screen.getByRole('tab', { name: 'Pipeline' });
    fireEvent.click(pipelineTab);

    expect(screen.getByText('Sales Pipeline Analysis')).toBeInTheDocument();
    expect(screen.getByText('Track project progression through each stage')).toBeInTheDocument();
  });

  it('should display stage distribution in pipeline tab', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      const pipelineTab = screen.getByRole('tab', { name: 'Pipeline' });
      fireEvent.click(pipelineTab);
    });

    await waitFor(() => {
      expect(screen.getByText('Lead')).toBeInTheDocument();
      expect(screen.getByText('Contacted')).toBeInTheDocument();
      expect(screen.getByText('Contract signed')).toBeInTheDocument();
    });

    // Check stage counts
    const badges = screen.getAllByText('12'); // lead count
    expect(badges.length).toBeGreaterThan(0);
  });

  it('should display performance metrics in performance tab', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      const performanceTab = screen.getByRole('tab', { name: 'Performance' });
      fireEvent.click(performanceTab);
    });

    await waitFor(() => {
      expect(screen.getByText('Lead Performance')).toBeInTheDocument();
      expect(screen.getByText('Team Efficiency Metrics')).toBeInTheDocument();
      expect(screen.getByText('26')).toBeInTheDocument(); // total leads
      expect(screen.getByText('24')).toBeInTheDocument(); // contracts signed
    });
  });

  it('should display forecasting data in forecasting tab', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      const forecastingTab = screen.getByRole('tab', { name: 'Forecasting' });
      fireEvent.click(forecastingTab);
    });

    await waitFor(() => {
      expect(screen.getByText('Revenue Forecasting')).toBeInTheDocument();
      expect(screen.getByText('Projected revenue and project completions')).toBeInTheDocument();
      expect(screen.getByText('Growth Trajectory')).toBeInTheDocument();
    });
  });

  it('should calculate projected values correctly', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      const forecastingTab = screen.getByRole('tab', { name: 'Forecasting' });
      fireEvent.click(forecastingTab);
    });

    await waitFor(() => {
      // Projected 30-day revenue should be pipeline_value * 1.2
      const projectedRevenue = mockAnalyticsData.pipeline_value * 1.2;
      expect(screen.getByText(`$${projectedRevenue.toLocaleString()}`)).toBeInTheDocument();

      // Expected completions should be active_projects * 0.75
      const expectedCompletions = Math.round(mockAnalyticsData.active_projects * 0.75);
      expect(screen.getByText(expectedCompletions.toString())).toBeInTheDocument();
    });
  });

  it('should update data when time range changes', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    // Click time range selector
    const timeRangeSelector = screen.getByRole('combobox');
    fireEvent.click(timeRangeSelector);

    // Select different time range
    const option90d = screen.getByText('Last 90 days');
    fireEvent.click(option90d);

    // Should trigger new API call
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/crm/stats?timeRange=90d');
    });
  });

  it('should handle API errors gracefully', async () => {
    // Mock failed API response
    mockFetch.mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'API Error' }),
      });
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Unable to load analytics data')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should display completion rate in overview tab', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('30.0%')).toBeInTheDocument(); // completion rate
    });
  });

  it('should show revenue target progress', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Revenue Target Progress')).toBeInTheDocument();
      expect(screen.getByText('67%')).toBeInTheDocument();
    });
  });

  it('should display pipeline health score', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Pipeline Health Score')).toBeInTheDocument();
      expect(screen.getByText('85/100')).toBeInTheDocument();
    });
  });

  it('should show team performance grade', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      const performanceTab = screen.getByRole('tab', { name: 'Performance' });
      fireEvent.click(performanceTab);
    });

    await waitFor(() => {
      expect(screen.getByText('A+')).toBeInTheDocument();
      expect(screen.getByText('Overall Performance Grade')).toBeInTheDocument();
      expect(screen.getByText('2.3 hours')).toBeInTheDocument(); // avg response time
      expect(screen.getByText('4.8/5.0')).toBeInTheDocument(); // customer satisfaction
    });
  });

  it('should calculate stage percentages correctly', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      const pipelineTab = screen.getByRole('tab', { name: 'Pipeline' });
      fireEvent.click(pipelineTab);
    });

    await waitFor(() => {
      // Lead stage: 12 out of 50 total = 24%
      expect(screen.getByText('24.0% of total')).toBeInTheDocument();
    });
  });

  it('should display correct metric labels', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Per solar installation')).toBeInTheDocument();
      expect(screen.getByText('Lead to contract conversion')).toBeInTheDocument();
      expect(screen.getByText('This month\'s revenue')).toBeInTheDocument();
    });
  });

  it('should render progress bars with correct values', async () => {
    render(<AnalyticsDashboard />);

    await waitFor(() => {
      // Should find progress bars in the overview tab
      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });
});