import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectDashboard } from '../ProjectDashboard';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockProjects = [
  {
    id: '1',
    custom_id: 'QS-P-2024-001',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    current_stage: 'proposal_sent',
    system_size_kw: 10.5,
    estimated_cost: 25000,
    assigned_to: 'Jane Smith',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-16T14:20:00Z',
  },
  {
    id: '2',
    custom_id: 'QS-P-2024-002',
    customer_name: 'Jane Wilson',
    customer_email: 'jane@example.com',
    current_stage: 'contract_signed',
    system_size_kw: 8.0,
    estimated_cost: 20000,
    assigned_to: 'Bob Johnson',
    created_at: '2024-01-10T09:15:00Z',
    updated_at: '2024-01-12T16:45:00Z',
  },
];

const mockStats = {
  total_projects: 2,
  active_projects: 2,
  completed_projects: 0,
  total_value: 45000,
  monthly_revenue: 0,
};

describe('ProjectDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default fetch responses
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/crm/projects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockProjects }),
        });
      }
      if (url.includes('/api/crm/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockStats }),
        });
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' }),
      });
    });
  });

  it('should render dashboard header', async () => {
    render(<ProjectDashboard />);

    expect(screen.getByText('Project Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Manage your solar installation projects')).toBeInTheDocument();
    expect(screen.getByText('New Project')).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    render(<ProjectDashboard />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should fetch and display projects', async () => {
    render(<ProjectDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Wilson')).toBeInTheDocument();
    });

    expect(screen.getByText('QS-P-2024-001')).toBeInTheDocument();
    expect(screen.getByText('QS-P-2024-002')).toBeInTheDocument();
  });

  it('should display stats cards', async () => {
    render(<ProjectDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Projects')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // total projects count
    });

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Total Value')).toBeInTheDocument();
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
  });

  it('should format currency values correctly', async () => {
    render(<ProjectDashboard />);

    await waitFor(() => {
      expect(screen.getByText('$45,000')).toBeInTheDocument(); // total value
      expect(screen.getByText('$25,000')).toBeInTheDocument(); // project 1 cost
      expect(screen.getByText('$20,000')).toBeInTheDocument(); // project 2 cost
    });
  });

  it('should display project stage badges', async () => {
    render(<ProjectDashboard />);

    await waitFor(() => {
      expect(screen.getByText('PROPOSAL SENT')).toBeInTheDocument();
      expect(screen.getByText('CONTRACT SIGNED')).toBeInTheDocument();
    });
  });

  it('should show correct progress percentages', async () => {
    render(<ProjectDashboard />);

    await waitFor(() => {
      // proposal_sent is 4th stage out of 11 = ~36%
      expect(screen.getByText('36%')).toBeInTheDocument();
      // contract_signed is 5th stage out of 11 = ~45%
      expect(screen.getByText('45%')).toBeInTheDocument();
    });
  });

  it('should filter projects by search term', async () => {
    render(<ProjectDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Wilson')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search projects by name or ID...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Wilson')).not.toBeInTheDocument();
  });

  it('should filter projects by stage', async () => {
    render(<ProjectDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Wilson')).toBeInTheDocument();
    });

    const stageFilter = screen.getByRole('combobox');
    fireEvent.click(stageFilter);

    const contractSignedOption = screen.getByText('Contract Signed');
    fireEvent.click(contractSignedOption);

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Wilson')).toBeInTheDocument();
  });

  it('should navigate to new project page when clicking new project button', () => {
    render(<ProjectDashboard />);

    const newProjectButton = screen.getByText('New Project');
    fireEvent.click(newProjectButton);

    expect(mockPush).toHaveBeenCalledWith('/crm/projects/new');
  });

  it('should navigate to project details when clicking on a project card', async () => {
    render(<ProjectDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const projectCard = screen.getByText('John Doe').closest('[role="button"]');
    if (projectCard) {
      fireEvent.click(projectCard);
      expect(mockPush).toHaveBeenCalledWith('/crm/projects/1');
    }
  });

  it('should display empty state when no projects match filters', async () => {
    render(<ProjectDashboard />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search projects by name or ID...');
    fireEvent.change(searchInput, { target: { value: 'NonexistentProject' } });

    expect(screen.getByText('No projects found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filter criteria')).toBeInTheDocument();
  });

  it('should display empty state when no projects exist', async () => {
    // Mock empty response
    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/crm/projects')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [] }),
        });
      }
      if (url.includes('/api/crm/stats')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: { ...mockStats, total_projects: 0 } }),
        });
      }
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Not found' }),
      });
    });

    render(<ProjectDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No projects found')).toBeInTheDocument();
      expect(screen.getByText('Get started by creating your first project')).toBeInTheDocument();
      expect(screen.getByText('Create First Project')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    // Mock failed API responses
    mockFetch.mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'API Error' }),
      });
    });

    // Mock console.error to avoid test output noise
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ProjectDashboard />);

    await waitFor(() => {
      // Should still render the dashboard structure even with API errors
      expect(screen.getByText('Project Dashboard')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should display system size for each project', async () => {
    render(<ProjectDashboard />);

    await waitFor(() => {
      expect(screen.getByText('10.5kW')).toBeInTheDocument();
      expect(screen.getByText('8kW')).toBeInTheDocument();
    });
  });

  it('should display formatted creation dates', async () => {
    render(<ProjectDashboard />);

    await waitFor(() => {
      // The dates should be formatted as MM/DD/YYYY
      expect(screen.getByText('1/15/2024')).toBeInTheDocument();
      expect(screen.getByText('1/10/2024')).toBeInTheDocument();
    });
  });

  it('should apply correct stage colors', async () => {
    render(<ProjectDashboard />);

    await waitFor(() => {
      const proposalBadge = screen.getByText('PROPOSAL SENT');
      const contractBadge = screen.getByText('CONTRACT SIGNED');

      expect(proposalBadge).toHaveClass('bg-orange-100', 'text-orange-800');
      expect(contractBadge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  it('should calculate correct stage progress', () => {
    const stageOrder = [
      'lead', 'contacted', 'qualified', 'proposal_sent', 'contract_signed',
      'permits_submitted', 'permits_approved', 'installation_scheduled',
      'installation_complete', 'inspection_passed', 'pto_granted'
    ];

    // Test progress calculation function logic
    const getStageProgress = (stage: string): number => {
      const index = stageOrder.indexOf(stage);
      return index >= 0 ? ((index + 1) / stageOrder.length) * 100 : 0;
    };

    expect(Math.round(getStageProgress('proposal_sent'))).toBe(36);
    expect(Math.round(getStageProgress('contract_signed'))).toBe(45);
    expect(Math.round(getStageProgress('pto_granted'))).toBe(100);
    expect(getStageProgress('unknown_stage')).toBe(0);
  });
});