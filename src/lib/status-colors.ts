/**
 * Status Color Utility
 *
 * Provides consistent color coding across all CRM pages for status badges.
 * Uses Quantum Solar's dark theme color palette.
 *
 * Design Philosophy:
 * - Blue (#3b82f6): New/Initial states
 * - Yellow (#eab308): In-progress/Pending states
 * - Green (#22c55e): Success/Completed states
 * - Purple (#a855f7): Advanced/Special states
 * - Orange (#f97316): Active/Important states
 * - Red (#ef4444): Failed/Rejected states
 * - Gray (#6b7280): Inactive/Withdrawn states
 */

export const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');

  const colors: Record<string, string> = {
    // Lead statuses
    'new': 'bg-blue-500 text-white',
    'contacted': 'bg-yellow-500 text-white',
    'qualified': 'bg-green-500 text-white',
    'proposal': 'bg-purple-500 text-white',
    'proposal_sent': 'bg-purple-500 text-white',
    'negotiation': 'bg-orange-500 text-white',
    'won': 'bg-green-600 text-white',
    'closed': 'bg-green-600 text-white',
    'lost': 'bg-red-500 text-white',
    'disqualified': 'bg-red-500 text-white',

    // Project statuses (unique to projects)
    'lead': 'bg-blue-500 text-white',
    'planning': 'bg-blue-600 text-white',
    'contract_signed': 'bg-purple-500 text-white',
    'permits_submitted': 'bg-orange-400 text-white',
    'permits_approved': 'bg-orange-600 text-white',
    'installation_scheduled': 'bg-yellow-600 text-white',
    'installation_complete': 'bg-green-400 text-white',
    'inspection_passed': 'bg-green-600 text-white',
    'pto_granted': 'bg-green-700 text-white',
    'permits': 'bg-yellow-500 text-white',
    'installation': 'bg-orange-500 text-white',
    'inspection': 'bg-purple-500 text-white',
    'complete': 'bg-green-600 text-white',
    'completed': 'bg-green-600 text-white',
    'on_hold': 'bg-gray-500 text-white',
    'cancelled': 'bg-red-500 text-white',

    // Candidate statuses
    'applied': 'bg-blue-500 text-white',
    'screening': 'bg-yellow-500 text-white',
    'interview': 'bg-orange-500 text-white',
    'offer': 'bg-purple-500 text-white',
    'hired': 'bg-green-600 text-white',
    'rejected': 'bg-red-500 text-white',
    'withdrawn': 'bg-gray-500 text-white',

    // Campaign statuses
    'active': 'bg-green-500 text-white',
    'paused': 'bg-yellow-500 text-white',
    'draft': 'bg-gray-500 text-white',
    'unsubscribed': 'bg-red-500 text-white',
    'bounced': 'bg-red-600 text-white',

    // Email statuses
    'sent': 'bg-blue-500 text-white',
    'delivered': 'bg-green-500 text-white',
    'opened': 'bg-purple-500 text-white',
    'clicked': 'bg-orange-500 text-white',
    'failed': 'bg-red-500 text-white',
    'pending': 'bg-yellow-500 text-white',
  };

  return colors[normalizedStatus] || 'bg-gray-500 text-white';
};

/**
 * Get status badge variant for shadcn/ui Badge component
 */
export const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');

  const successStates = ['won', 'closed', 'completed', 'hired', 'active', 'pto_granted', 'inspection_passed'];
  const warningStates = ['contacted', 'screening', 'pending', 'paused', 'permits'];
  const errorStates = ['lost', 'disqualified', 'rejected', 'cancelled', 'failed', 'bounced'];

  if (successStates.includes(normalizedStatus)) {
    return 'default';
  }
  if (warningStates.includes(normalizedStatus)) {
    return 'secondary';
  }
  if (errorStates.includes(normalizedStatus)) {
    return 'destructive';
  }

  return 'outline';
};

/**
 * Format status text for display
 */
export const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
