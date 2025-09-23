import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import LeadsPage from '@/app/crm/leads/page'
import ProjectsPage from '@/app/crm/projects/page'
import CandidatesPage from '@/app/crm/candidates/page'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

const mockPush = vi.fn()
const mockRouter = {
  push: mockPush,
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
}

describe('CRM Pages', () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue(mockRouter)
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('LeadsPage', () => {
    it('renders leads page with correct title', async () => {
      render(<LeadsPage />)

      expect(screen.getByText('Leads')).toBeInTheDocument()
      expect(screen.getByText('Manage and track your solar leads')).toBeInTheDocument()
    })

    it('displays add lead button', () => {
      render(<LeadsPage />)

      const addButton = screen.getByText('Add Lead')
      expect(addButton).toBeInTheDocument()
    })

    it('shows search input', () => {
      render(<LeadsPage />)

      const searchInput = screen.getByPlaceholderText('Search leads...')
      expect(searchInput).toBeInTheDocument()
    })

    it('displays statistics cards', () => {
      render(<LeadsPage />)

      expect(screen.getByText('Total Leads')).toBeInTheDocument()
      expect(screen.getByText('New Leads')).toBeInTheDocument()
      expect(screen.getAllByText('Qualified').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Converted').length).toBeGreaterThan(0)
    })

    it('calls API to fetch leads on mount', async () => {
      render(<LeadsPage />)

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/crm/leads')
      })
    })
  })

  describe('ProjectsPage', () => {
    it('renders projects page with correct title', async () => {
      render(<ProjectsPage />)

      expect(screen.getByText('Projects')).toBeInTheDocument()
      expect(screen.getByText('Track solar installation projects')).toBeInTheDocument()
    })

    it('displays new project button', () => {
      render(<ProjectsPage />)

      const newButton = screen.getByText('New Project')
      expect(newButton).toBeInTheDocument()
    })

    it('shows search and filter inputs', () => {
      render(<ProjectsPage />)

      const searchInput = screen.getByPlaceholderText('Search projects...')
      expect(searchInput).toBeInTheDocument()
    })

    it('displays project statistics', () => {
      render(<ProjectsPage />)

      expect(screen.getByText('Total Projects')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Completed')).toBeInTheDocument()
      expect(screen.getByText('Total Value')).toBeInTheDocument()
    })

    it('calls API to fetch projects on mount', async () => {
      render(<ProjectsPage />)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/crm/projects')
      })
    })
  })

  describe('CandidatesPage', () => {
    it('renders candidates page with correct title', async () => {
      render(<CandidatesPage />)

      expect(screen.getByText('Job Candidates')).toBeInTheDocument()
      expect(screen.getByText('Manage solar industry job applications')).toBeInTheDocument()
    })

    it('displays add candidate button', () => {
      render(<CandidatesPage />)

      const addButton = screen.getByText('Add Candidate')
      expect(addButton).toBeInTheDocument()
    })

    it('shows search and filter controls', () => {
      render(<CandidatesPage />)

      const searchInput = screen.getByPlaceholderText('Search candidates...')
      expect(searchInput).toBeInTheDocument()
    })

    it('displays candidate statistics', () => {
      render(<CandidatesPage />)

      expect(screen.getByText('Total Candidates')).toBeInTheDocument()
      expect(screen.getByText('Active Applications')).toBeInTheDocument()
      expect(screen.getByText('In Interview')).toBeInTheDocument()
      expect(screen.getByText('Offers Extended')).toBeInTheDocument()
      expect(screen.getByText('Hired')).toBeInTheDocument()
    })

    it('calls API to fetch candidates on mount', async () => {
      render(<CandidatesPage />)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/crm/candidates')
      })
    })
  })
})