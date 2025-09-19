// Database Types for Quantum Solar CRM Extension
// Auto-generated TypeScript definitions for enhanced schema

export interface Database {
  public: {
    Tables: {
      splash_leads: {
        Row: SplashLead
        Insert: Omit<SplashLead, 'id' | 'custom_id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SplashLead, 'id' | 'custom_id'>>
      }
      opportunities: {
        Row: Opportunity
        Insert: Omit<Opportunity, 'id' | 'custom_id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Opportunity, 'id' | 'custom_id'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'custom_id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Project, 'id' | 'custom_id'>>
      }
      installation_equipment: {
        Row: InstallationEquipment
        Insert: Omit<InstallationEquipment, 'id' | 'custom_id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<InstallationEquipment, 'id' | 'custom_id'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id'>>
      }
    }
    Functions: {
      generate_lead_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_opportunity_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_project_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_installation_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
  }
}

// Enhanced SplashLead interface with new fields
export interface SplashLead {
  id: string
  custom_id: string // QSLID000001 format
  first_name: string | null
  last_name: string | null
  phone: string | null
  email: string | null
  street_address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  utility_company: string | null
  homeowner_status: string | null
  credit_score: string | null
  shading: string | null
  is_partial: boolean | null
  current_step: number | null
  form_type: string | null
  source: string | null
  created_at: string | null
  completed_at: string | null
  ip_address: string | null
  user_agent: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  status: string | null
  assigned_to: string | null
  notes: string | null
  follow_up_date: string | null
  session_id: string | null
  email_sent: boolean | null
  updated_at: string | null
  tcpa_consent: boolean | null
  sms_consent: boolean | null
  consent_timestamp: string | null
  average_monthly_bill: number | null
  roof_condition: string | null
  roof_material: string | null
  home_square_footage: number | null
  energy_usage_pattern: string | null
  preferred_contact_time: string | null
  how_heard_about_us: string | null
  existing_solar: boolean | null
  hoa_restrictions: boolean | null
  financing_preference: string | null
  timeline_preference: string | null
  additional_notes: string | null
  form_variant: string | null
  lead_score: number | null
  qualification_status: string | null
  
  // New enhanced fields
  monthly_electric_bill: number | null
  roof_type: RoofType | null
  roof_age: number | null
  roof_shading_percentage: number | null
  home_ownership: HomeOwnership | null
  credit_score_range: CreditScoreRange | null
  tcpa_consent_ip_address: string | null
  tcpa_consent_method: TCPAConsentMethod | null
}

// New Opportunity interface
export interface Opportunity {
  id: string
  custom_id: string // QSOID000001 format
  lead_id: string
  
  // Solar system details
  estimated_system_size: number | null
  estimated_annual_savings: number | null
  estimated_cost: number | null
  financing_type: FinancingType | null
  
  // Appointment scheduling
  site_survey_scheduled: string | null
  site_survey_completed: string | null
  proposal_sent_date: string | null
  contract_signed_date: string | null
  
  // Status and assignment
  status: string
  assigned_to: string | null
  priority: Priority
  probability: number
  
  // Solar-specific details
  roof_analysis_complete: boolean
  shading_analysis_complete: boolean
  utility_interconnection_approved: boolean
  hoa_approval_required: boolean
  hoa_approval_received: boolean
  
  // Financial details
  down_payment_amount: number | null
  monthly_payment_amount: number | null
  loan_term_months: number | null
  interest_rate: number | null
  
  // Communication tracking
  last_contact_date: string | null
  next_follow_up_date: string | null
  contact_attempts: number
  
  // Notes
  notes: string | null
  internal_notes: string | null
  
  // Audit fields
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

// Enhanced Project interface
export interface Project {
  id: string
  custom_id: string // QSPID000001 format
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  address: string
  system_size_kw: number | null
  estimated_annual_production_kwh: number | null
  project_value: number | null
  contract_signed_date: string | null
  notice_to_proceed_date: string | null
  estimated_completion_date: string | null
  actual_completion_date: string | null
  current_stage: number | null
  overall_status: string | null
  assigned_project_manager: string | null
  assigned_installer: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
  
  // New enhanced fields
  panel_count: number | null
  panel_model: string | null
  inverter_type: string | null
  inverter_model: string | null
  battery_included: boolean
  battery_model: string | null
  google_drive_folder_id: string | null
  site_latitude: number | null
  site_longitude: number | null
  
  // 11-stage pipeline tracking
  site_survey_date: string | null
  design_completed_date: string | null
  permits_submitted_date: string | null
  permits_approved_date: string | null
  installation_scheduled_date: string | null
  installation_completed_date: string | null
  inspection_scheduled_date: string | null
  inspection_completed_date: string | null
  pto_submitted_date: string | null
  pto_approved_date: string | null
  system_activated_date: string | null
}

// New InstallationEquipment interface
export interface InstallationEquipment {
  id: string
  custom_id: string // QSIID000001 format
  project_id: string
  
  // Equipment classification
  equipment_type: EquipmentType
  equipment_category: EquipmentCategory | null
  
  // Equipment details
  manufacturer: string
  model: string
  serial_number: string | null
  part_number: string | null
  quantity: number
  
  // Technical specifications
  wattage: number | null
  voltage: number | null
  amperage: number | null
  efficiency_rating: number | null
  temperature_coefficient: number | null
  
  // Warranty and compliance
  warranty_years: number | null
  warranty_start_date: string | null
  warranty_end_date: string | null
  certification_standards: string[] | null
  
  // Installation details
  installed_date: string | null
  installer_id: string | null
  installation_location: string | null
  installation_notes: string | null
  
  // Status and condition
  status: EquipmentStatus
  condition_rating: number | null
  condition_notes: string | null
  
  // Cost tracking
  unit_cost: number | null
  total_cost: number | null
  supplier: string | null
  purchase_order_number: string | null
  invoice_number: string | null
  
  // Performance data
  performance_data: Record<string, any> | null
  last_maintenance_date: string | null
  next_maintenance_due: string | null
  
  // Audit fields
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
}

// New Profile interface
export interface Profile {
  id: string
  user_id: string
  email: string | null
  full_name: string | null
  role: UserRole
  department: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Enum types
export type RoofType = 'asphalt_shingle' | 'tile' | 'metal' | 'flat' | 'other'
export type HomeOwnership = 'own' | 'rent'
export type CreditScoreRange = 'excellent' | 'good' | 'fair' | 'poor'
export type TCPAConsentMethod = 'website' | 'phone' | 'email' | 'in_person'
export type FinancingType = 'cash' | 'loan' | 'lease' | 'ppa'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type UserRole = 'admin' | 'manager' | 'sales_rep' | 'installer' | 'user'

export type EquipmentType = 
  | 'solar_panel' 
  | 'inverter' 
  | 'battery' 
  | 'mounting_system' 
  | 'monitoring' 
  | 'electrical' 
  | 'safety' 
  | 'conduit' 
  | 'disconnect'

export type EquipmentCategory = 'primary' | 'secondary' | 'accessory' | 'safety' | 'monitoring'

export type EquipmentStatus = 
  | 'ordered' 
  | 'received' 
  | 'inspected' 
  | 'installed' 
  | 'commissioned' 
  | 'failed' 
  | 'replaced' 
  | 'removed'

// Custom ID formats
export type LeadCustomId = `QSLID${string}`
export type OpportunityCustomId = `QSOID${string}`
export type ProjectCustomId = `QSPID${string}`
export type InstallationCustomId = `QSIID${string}`

// Utility types for form handling
export type CreateLeadData = Database['public']['Tables']['splash_leads']['Insert']
export type UpdateLeadData = Database['public']['Tables']['splash_leads']['Update']
export type CreateOpportunityData = Database['public']['Tables']['opportunities']['Insert']
export type UpdateOpportunityData = Database['public']['Tables']['opportunities']['Update']
export type CreateProjectData = Database['public']['Tables']['projects']['Insert']
export type UpdateProjectData = Database['public']['Tables']['projects']['Update']
export type CreateEquipmentData = Database['public']['Tables']['installation_equipment']['Insert']
export type UpdateEquipmentData = Database['public']['Tables']['installation_equipment']['Update']

// Query result types with relations
export interface LeadWithOpportunities extends SplashLead {
  opportunities: Opportunity[]
}

export interface OpportunityWithLead extends Opportunity {
  lead: SplashLead
}

export interface ProjectWithEquipment extends Project {
  equipment: InstallationEquipment[]
  opportunity?: Opportunity
}

export interface EquipmentWithProject extends InstallationEquipment {
  project: Project
}