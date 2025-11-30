// CRM v2 Type Definitions
// Enhanced types with solar-specific fields for the v2 CRM interface

// ============================================
// LEAD STATUS SYSTEM
// ============================================

// Main lead statuses
export type LeadMainStatus = 'new' | 'contacted' | 'appointment_scheduled' | 'lead_lost';

// Sub-status details for "contacted"
export type ContactedDetail =
  | 'phone_call'
  | 'texted_back'
  | 'emailed_back'
  | 'left_message_text'
  | 'left_message_voicemail';

// Sub-status details for "lead_lost"
export type LeadLostReason =
  | 'dnc'
  | 'renter'
  | 'exhausted'
  | 'too_much_shading'
  | 'other';

// Drip campaign status
export type DripCampaignStatus =
  | 'not_enrolled'
  | 'enrolled'
  | 'paused'
  | 'completed'
  | 'unsubscribed';

// Legacy status type for backward compatibility
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'disqualified' | LeadMainStatus;

// Status history entry for audit trail
export interface StatusHistoryEntry {
  timestamp: string;
  previous_status: string;
  new_status: string;
  previous_detail?: string;
  new_detail?: string;
  changed_by?: string;
  notes?: string;
}

// Lead status labels for display
export const LEAD_STATUS_LABELS: Record<LeadMainStatus, string> = {
  new: 'New Lead',
  contacted: 'Contacted',
  appointment_scheduled: 'Appointment Scheduled',
  lead_lost: 'Lead Lost',
};

// Contacted sub-status labels
export const CONTACTED_DETAIL_LABELS: Record<ContactedDetail, string> = {
  phone_call: 'Phone Call',
  texted_back: 'Texted Back',
  emailed_back: 'Emailed Back',
  left_message_text: 'Left Message (Text)',
  left_message_voicemail: 'Left Message (Voicemail)',
};

// Lead lost reason labels
export const LEAD_LOST_REASON_LABELS: Record<LeadLostReason, string> = {
  dnc: 'Do Not Contact',
  renter: 'Renter',
  exhausted: 'Exhausted',
  too_much_shading: 'Too Much Shading',
  other: 'Other',
};

// ============================================
// OPPORTUNITY STATUS SYSTEM
// ============================================

// Main opportunity statuses
export type OpportunityMainStatus =
  | 'appointment_scheduled'
  | 'followup_needed'
  | 'followup_booked'
  | 'sale'
  | 'opportunity_lost';

// Sub-status details for "opportunity_lost"
export type OpportunityLostReason =
  | 'failed_credit'
  | 'needs_to_think'
  | 'moving'
  | 'too_much_shading'
  | 'other';

// Appointment types
export type AppointmentType = 'initial' | 'follow_up';

// Opportunity status labels for display
export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityMainStatus, string> = {
  appointment_scheduled: 'Appointment Scheduled',
  followup_needed: 'Follow-up Needed',
  followup_booked: 'Follow-up Booked',
  sale: 'Sale',
  opportunity_lost: 'Opportunity Lost',
};

// Opportunity lost reason labels
export const OPPORTUNITY_LOST_REASON_LABELS: Record<OpportunityLostReason, string> = {
  failed_credit: 'Failed Credit',
  needs_to_think: 'Needs to Think About It',
  moving: 'Moving',
  too_much_shading: 'Too Much Shading',
  other: 'Other',
};

// ============================================
// PROJECT STAGE SYSTEM
// ============================================

// Main project stages
export type ProjectMainStage =
  | 'site_survey'
  | 'design'
  | 'permitting'
  | 'installation'
  | 'inspection'
  | 'pto'
  | 'complete';

// Sub-stages for each main stage
export type SiteSurveySubStage = 'pending' | 'scheduled' | 'completed';
export type DesignSubStage = 'pending' | 'started' | 'completed';
export type PermittingSubStage =
  | 'pending_ix'
  | 'ix_submitted'
  | 'permitting_submitted'
  | 'ix_approved'
  | 'permitting_approved';
export type InstallationSubStage = 'pending' | 'scheduled' | 'complete';
export type InspectionSubStage = 'scheduled' | 'complete';
export type PTOSubStage = 'submitted' | 'approved';

// Project main stage labels
export const PROJECT_MAIN_STAGE_LABELS: Record<ProjectMainStage, string> = {
  site_survey: 'Site Survey',
  design: 'Design',
  permitting: 'Permitting',
  installation: 'Installation',
  inspection: 'Inspection',
  pto: 'PTO',
  complete: 'Project Complete',
};

// Project sub-stage labels (nested by main stage)
export const PROJECT_SUB_STAGE_LABELS: Record<ProjectMainStage, Record<string, string>> = {
  site_survey: {
    pending: 'Pending Site Survey',
    scheduled: 'Site Survey Scheduled',
    completed: 'Site Survey Completed',
  },
  design: {
    pending: 'Pending Design',
    started: 'Design Started',
    completed: 'Design Completed',
  },
  permitting: {
    pending_ix: 'Pending Interconnection',
    ix_submitted: 'Interconnection Submitted',
    permitting_submitted: 'Permitting Submitted',
    ix_approved: 'Interconnection Approved',
    permitting_approved: 'Permitting Approved',
  },
  installation: {
    pending: 'Pending Installation',
    scheduled: 'Installation Scheduled',
    complete: 'Installation Complete',
  },
  inspection: {
    scheduled: 'Inspection Scheduled',
    complete: 'Inspection Complete',
  },
  pto: {
    submitted: 'PTO Submitted',
    approved: 'PTO Approved',
  },
  complete: {},
};

// Project dates interface
export interface ProjectDates {
  site_survey_scheduled_date?: string;
  site_survey_completed_date?: string;
  design_started_date?: string;
  design_completed_date?: string;
  interconnection_submitted_date?: string;
  permitting_submitted_date?: string;
  interconnection_approved_date?: string;
  permitting_approved_date?: string;
  installation_scheduled_date?: string;
  installation_complete_date?: string;
  inspection_scheduled_date?: string;
  inspection_complete_date?: string;
  pto_submitted_date?: string;
  pto_approved_date?: string;
  project_complete_date?: string;
}

// ============================================
// LEAD TYPES
// ============================================

export type HomeownerStatus = 'owner' | 'renter' | 'other';

export type CreditScore = 'excellent' | 'good' | 'fair' | 'poor';

export interface LeadV2 {
  id: string;
  session_id?: string;

  // Basic contact information
  first_name: string;
  last_name: string;
  name: string;  // Full name for display
  email: string;
  phone: string;

  // Address information
  street_address?: string;
  address?: string;  // Alternative field name from splash_leads
  city?: string;
  state?: string;
  zip_code?: string;
  county?: string;
  location?: string;  // Formatted location string

  // Solar-specific fields
  system_size_kw?: number;
  utility_company?: string;
  average_monthly_bill?: number;
  electric_bill?: number;  // Alias for backward compatibility
  homeowner_status?: HomeownerStatus;
  credit_score?: CreditScore;
  property_type?: string;
  roof_condition?: string;
  shading_concerns?: string;

  // Lead management - Enhanced status system
  status: LeadStatus | LeadMainStatus;
  status_detail?: ContactedDetail | LeadLostReason | string;
  drip_campaign_status?: DripCampaignStatus;
  assigned_to?: string;
  source_campaign?: string;
  source_medium?: string;
  lost_reason?: LeadLostReason;

  // Appointment (when status = appointment_scheduled)
  appointment_date?: string;

  // Contact tracking
  last_contacted_at?: string;

  // Status history for audit trail
  status_history?: StatusHistoryEntry[];

  // Timestamps
  created_at: string;
  updated_at?: string;

  // Additional metadata
  notes?: string;
  tags?: string[];
}

// ============================================
// OPPORTUNITY TYPES
// ============================================

export interface OpportunityV2 {
  id: string;
  lead_id?: string;

  // Customer information
  customer_name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  county?: string;

  // Opportunity tracking
  status: OpportunityMainStatus;
  status_detail?: string;
  lost_reason?: OpportunityLostReason;

  // Appointment details
  appointment_date?: string;
  appointment_type?: AppointmentType;
  appointment_notes?: string;

  // Solar assessment
  utility_company?: string;
  average_monthly_bill?: number;
  system_size_kw?: number;
  estimated_monthly_savings?: number;
  proposal_amount?: number;
  credit_score?: CreditScore;

  // Assignment
  assigned_to?: string;

  // Conversion tracking
  converted_at?: string;
  project_id?: string;

  // Status history
  status_history?: StatusHistoryEntry[];

  // Timestamps
  created_at: string;
  updated_at?: string;

  // Notes
  notes?: string;
}

// ============================================
// PROJECT TYPES
// ============================================

export type ProjectStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type RevenueType = 'goodpwr' | 'self_gen';

export type FinancingType = 'cash' | 'loan' | 'lease' | 'ppa';

export interface MilestonePayment {
  name: string;
  percentage: number;
  amount: number;
  due_date: string;
  paid: boolean;
  paid_date?: string;
}

export interface ProjectV2 {
  id: string;
  lead_id?: string;
  opportunity_id?: string;

  // Customer information
  customer_name: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  county?: string;
  email?: string;
  phone?: string;

  // System details
  system_size_kw: number;
  panel_count?: number;
  inverter_type?: string;
  battery_included?: boolean;

  // Revenue tracking
  revenue_type: RevenueType;
  estimated_revenue: number;
  actual_revenue?: number;

  // Financial details
  financing_type?: FinancingType;
  monthly_payment?: number;
  milestone_payments?: MilestonePayment[];

  // Project stages - Legacy numeric system
  current_stage: ProjectStage;

  // Project stages - New hierarchical system
  main_stage?: ProjectMainStage;
  sub_stage?: string;

  // Adders (for reports)
  has_mpu?: boolean;
  has_battery?: boolean;
  has_trench?: boolean;
  adders?: Array<{ type: string; cost?: number; notes?: string }>;

  // Permitting and compliance
  ahj_jurisdiction?: string;
  permit_number?: string;
  utility_account_number?: string;

  // All project dates
  contract_signed_date?: string;
  site_survey_scheduled_date?: string;
  site_survey_completed_date?: string;
  design_started_date?: string;
  design_completed_date?: string;
  interconnection_submitted_date?: string;
  permitting_submitted_date?: string;
  interconnection_approved_date?: string;
  permitting_approved_date?: string;
  installation_scheduled_date?: string;
  installation_complete_date?: string;
  inspection_scheduled_date?: string;
  inspection_complete_date?: string;
  pto_submitted_date?: string;
  pto_approved_date?: string;
  project_complete_date?: string;

  // Legacy date fields
  installation_date?: string;
  estimated_completion_date?: string;
  pto_date?: string;

  // Team assignment
  assigned_installer_id?: string;
  assigned_installer?: string;

  // Stage history
  stage_history?: StatusHistoryEntry[];

  // Timestamps
  created_at: string;
  updated_at?: string;

  // Additional information
  project_notes?: string;
  tags?: string[];
}

// Project stage labels for display
export const PROJECT_STAGE_LABELS: Record<ProjectStage, string> = {
  1: 'Lead',
  2: 'Contacted',
  3: 'Site Survey',
  4: 'Proposal Sent',
  5: 'Contract Signed',
  6: 'Permits Submitted',
  7: 'Permits Approved',
  8: 'Installation Scheduled',
  9: 'Installation In Progress',
  10: 'Installation Complete',
  11: 'Inspection Passed',
  12: 'PTO Granted',
};

// Revenue type display information
export const REVENUE_TYPE_INFO: Record<RevenueType, { label: string; rate: number; color: string }> = {
  goodpwr: {
    label: 'GoodPWR',
    rate: 0.60,  // $0.60/W
    color: 'bg-blue-500',
  },
  self_gen: {
    label: 'Self-Gen',
    rate: 1.47,  // $1.47/W
    color: 'bg-green-500',
  },
};

// ============================================
// CANDIDATE TYPES
// ============================================

export type CandidateStatus = 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

export interface CandidateV2 {
  id: string;

  // Contact information
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone: string;

  // Application details
  position: string;
  desired_role?: string;
  status: CandidateStatus;

  // Experience (NEW)
  experience_years?: number;
  certifications?: string[];

  // Documents
  resume_url?: string;
  portfolio_url?: string;

  // Availability
  availability_date?: string;
  hourly_rate?: number;

  // Timestamps
  created_at: string;
  applied_at?: string;
  updated_at?: string;

  // Notes
  notes?: string;
}

// ============================================
// CAMPAIGN TYPES
// ============================================

export type TriggerType = 'lead_created' | 'status_change' | 'manual' | 'time_based';

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject_template: string;
  html_template: string;
  text_template: string;
  variables: string[];
  active: boolean;
  language: string;
  created_at: string;
  updated_at?: string;
}

export interface EmailSequence {
  id: string;
  campaign_id: string;
  send_order: number;
  send_delay_minutes: number;
  active: boolean;
  email_templates: EmailTemplate;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  trigger_type: TriggerType;
  active: boolean;
  created_at: string;
  updated_at?: string;

  // Relationships
  sequences?: EmailSequence[];

  // Stats (calculated)
  stats?: {
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    unsubscribedEnrollments: number;
  };
}

// ============================================
// DASHBOARD / ANALYTICS TYPES
// ============================================

export interface DashboardMetrics {
  totalLeads: number;
  totalProjects: number;
  activeProjects: number;
  conversionRate: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageSystemSize: number;
  averageDealSize: number;
}

export interface RevenueData {
  month: string;
  revenue_type: RevenueType;
  project_count: number;
  total_kw: number;
  total_revenue: number;
  avg_system_size: number;
}

export interface PipelineData {
  stage: ProjectStage;
  stage_label: string;
  project_count: number;
  total_revenue: number;
  avg_days_in_stage: number;
}

export interface CashFlowForecast {
  week_number: number;
  week_start_date: string;
  week_end_date: string;
  expected_inflows: number;
  expected_outflows: number;
  net_cash_flow: number;
  cumulative_cash_flow?: number;
}

export interface LeadConversionData {
  month: string;
  status: LeadStatus;
  county?: string;
  utility_company?: string;
  lead_count: number;
  converted_count: number;
  conversion_rate: number;
}

// ============================================
// DATA TABLE TYPES
// ============================================

export interface DataTableFilterOption {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableSearchableColumn {
  id: string;
  title: string;
}

export interface DataTableFilterableColumn {
  id: string;
  title: string;
  options: DataTableFilterOption[];
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// FORM TYPES
// ============================================

export interface LeadFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  county?: string;
  utility_company?: string;
  average_monthly_bill?: number;
  homeowner_status?: HomeownerStatus;
  credit_score?: CreditScore;
  property_type?: string;
  roof_condition?: string;
  shading_concerns?: string;
  status: LeadStatus;
  notes?: string;
}

export interface ProjectFormData {
  customer_name: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  system_size_kw: number;
  revenue_type: RevenueType;
  panel_count?: number;
  inverter_type?: string;
  battery_included?: boolean;
  financing_type?: FinancingType;
  monthly_payment?: number;
  current_stage: ProjectStage;
  ahj_jurisdiction?: string;
  permit_number?: string;
  installation_date?: string;
  estimated_completion_date?: string;
  assigned_installer_id?: string;
  project_notes?: string;
}

// ============================================
// UTILITY TYPES
// ============================================

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export interface FilterConfig {
  [key: string]: string | string[] | number | boolean | undefined;
}

// Helper function to calculate revenue from system size
export function calculateEstimatedRevenue(systemSizeKw: number, revenueType: RevenueType): number {
  const watts = systemSizeKw * 1000;
  return watts * REVENUE_TYPE_INFO[revenueType].rate;
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper function to format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Helper function to get status color
export function getLeadStatusColor(status: LeadStatus | LeadMainStatus | string): string {
  const colors: Record<string, string> = {
    // Legacy statuses
    new: 'bg-blue-500',
    contacted: 'bg-yellow-500',
    qualified: 'bg-green-500',
    proposal: 'bg-purple-500',
    negotiation: 'bg-orange-500',
    won: 'bg-green-600',
    lost: 'bg-red-500',
    disqualified: 'bg-gray-500',
    // New statuses
    appointment_scheduled: 'bg-green-500',
    lead_lost: 'bg-red-500',
  };
  return colors[status] || 'bg-gray-500';
}

// Helper function to get project stage color
export function getProjectStageColor(stage: ProjectStage): string {
  if (stage <= 4) return 'bg-blue-500';  // Lead to Proposal
  if (stage <= 7) return 'bg-yellow-500';  // Contract to Permits Approved
  if (stage <= 10) return 'bg-orange-500';  // Installation
  return 'bg-green-500';  // Inspection & PTO
}
