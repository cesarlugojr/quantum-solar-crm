import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, User, Calendar, Zap, DollarSign, Battery, Wrench, CheckCircle, Home, Car, Mountain } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getProjectById } from '../../actions';
import { formatCurrency, PROJECT_STAGE_LABELS, REVENUE_TYPE_INFO, getProjectStageColor } from '@/types/crm';
import { EditProjectDialog } from '@/components/crm/EditProjectDialog';
import { DeleteRecordButton } from '@/components/crm/DeleteRecordButton';
import { ProjectInvoicesSection } from '@/components/crm/ProjectInvoicesSection';

export const metadata: Metadata = {
  title: 'Project Details | Quantum Solar CRM',
};

// Force dynamic rendering - this page fetches data by ID
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  const stageLabel = PROJECT_STAGE_LABELS[project.current_stage as keyof typeof PROJECT_STAGE_LABELS] || `Stage ${project.current_stage}`;
  const revenueInfo = REVENUE_TYPE_INFO[project.revenue_type as keyof typeof REVENUE_TYPE_INFO];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/crm/projects">
        <Button variant="ghost" className="text-gray-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </Link>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{project.customer_name}</h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {project.address}
            {project.city && `, ${project.city}`}
            {project.state && `, ${project.state}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <EditProjectDialog project={project} />
          <Badge
            variant="outline"
            className={`${getProjectStageColor(project.current_stage)} bg-opacity-20 border-current text-lg px-4 py-2`}
          >
            {stageLabel}
          </Badge>
        </div>
      </div>

      {/* Project Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            <p className="text-gray-400 text-sm">System Size</p>
          </div>
          <p className="text-2xl font-bold text-white">{project.system_size_kw || 0} kW</p>
          <div className="text-sm text-gray-500 mt-1 space-y-0.5">
            {project.panel_count && <p>{project.panel_count} panels</p>}
            {project.module_wattage && <p>{project.module_wattage}W modules</p>}
            {project.array_count && <p>{project.array_count} array{project.array_count > 1 ? 's' : ''}</p>}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <p className="text-gray-400 text-sm">Revenue Type</p>
          </div>
          <p className="text-2xl font-bold text-white">{revenueInfo?.label || project.revenue_type}</p>
          <p className="text-sm text-gray-500 mt-1">${revenueInfo?.rate || 0}/W</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-blue-400" />
            <p className="text-gray-400 text-sm">Estimated Revenue</p>
          </div>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(project.estimated_revenue || 0)}
          </p>
          {project.actual_revenue && (
            <p className="text-sm text-green-400 mt-1">
              Actual: {formatCurrency(project.actual_revenue)}
            </p>
          )}
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            <p className="text-gray-400 text-sm">Project Stage</p>
          </div>
          <p className="text-2xl font-bold text-white">{project.current_stage}/12</p>
          <p className="text-sm text-gray-500 mt-1">{stageLabel}</p>
        </div>
      </div>

      {/* Project Detail Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Customer Name</p>
                <p className="text-white">{project.customer_name}</p>
              </div>
              {project.email && (
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <a href={`mailto:${project.email}`} className="text-blue-400 hover:underline">
                    {project.email}
                  </a>
                </div>
              )}
              {project.phone && (
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <a href={`tel:${project.phone}`} className="text-blue-400 hover:underline">
                    {project.phone}
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400">Address</p>
                <p className="text-white">
                  {project.address}
                  {project.city && <><br />{project.city}, {project.state} {project.zip_code}</>}
                </p>
              </div>
            </div>
          </div>

          {/* Pipeline Timeline */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Pipeline Progress</h2>
            <div className="space-y-3">
              {Object.entries(PROJECT_STAGE_LABELS).map(([stageNum, label]) => {
                const stage = parseInt(stageNum);
                const isComplete = stage <= project.current_stage;
                const isCurrent = stage === project.current_stage;

                return (
                  <div key={stage} className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isComplete ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}
                      ${isCurrent ? 'ring-2 ring-green-400 ring-offset-2 ring-offset-gray-900' : ''}
                    `}>
                      {isComplete ? <CheckCircle className="h-5 w-5" /> : stage}
                    </div>
                    <div className="flex-1">
                      <p className={`${isComplete ? 'text-white' : 'text-gray-500'} font-medium`}>
                        {label}
                      </p>
                    </div>
                    {isCurrent && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500">
                        Current
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Dates */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Key Dates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.installation_date && (
                <div>
                  <p className="text-sm text-gray-400">Installation Date</p>
                  <p className="text-white">
                    {new Date(project.installation_date).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {project.pto_date && (
                <div>
                  <p className="text-sm text-gray-400">PTO Date</p>
                  <p className="text-white">
                    {new Date(project.pto_date).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {project.permitting_approved_date && (
                <div>
                  <p className="text-sm text-gray-400">Permit Approved</p>
                  <p className="text-white">
                    {new Date(project.permitting_approved_date).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {project.inspection_complete_date && (
                <div>
                  <p className="text-sm text-gray-400">Inspection Complete</p>
                  <p className="text-white">
                    {new Date(project.inspection_complete_date).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-400">Project Created</p>
                <p className="text-white">
                  {new Date(project.created_at).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Project Invoices */}
          <ProjectInvoicesSection
            projectId={project.id}
            projectName={project.customer_name}
            projectAddress={project.address}
            systemSizeKw={project.system_size_kw}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Adders */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Project Adders</h3>
            <div className="space-y-3">
              <div className={`flex items-center gap-3 ${project.has_mpu ? 'text-white' : 'text-gray-500'}`}>
                <Wrench className={`h-5 w-5 ${project.has_mpu ? 'text-orange-400' : ''}`} />
                <span>MPU Upgrade</span>
                {project.has_mpu && <CheckCircle className="h-4 w-4 text-green-400 ml-auto" />}
              </div>
              <div className={`flex items-center gap-3 ${project.has_battery ? 'text-white' : 'text-gray-500'}`}>
                <Battery className={`h-5 w-5 ${project.has_battery ? 'text-green-400' : ''}`} />
                <span>Battery Storage{project.battery_count ? ` (${project.battery_count})` : ''}</span>
                {project.has_battery && <CheckCircle className="h-4 w-4 text-green-400 ml-auto" />}
              </div>
              <div className={`flex items-center gap-3 ${project.has_trench ? 'text-white' : 'text-gray-500'}`}>
                <Wrench className={`h-5 w-5 ${project.has_trench ? 'text-yellow-400' : ''}`} />
                <span>Trench Work{project.trench_length_ft ? ` (${project.trench_length_ft} ft)` : ''}</span>
                {project.has_trench && <CheckCircle className="h-4 w-4 text-green-400 ml-auto" />}
              </div>
              <div className={`flex items-center gap-3 ${project.has_ground_mount ? 'text-white' : 'text-gray-500'}`}>
                <Mountain className={`h-5 w-5 ${project.has_ground_mount ? 'text-emerald-400' : ''}`} />
                <span>Ground Mount</span>
                {project.has_ground_mount && <CheckCircle className="h-4 w-4 text-green-400 ml-auto" />}
              </div>
              <div className={`flex items-center gap-3 ${project.has_ev_charger ? 'text-white' : 'text-gray-500'}`}>
                <Car className={`h-5 w-5 ${project.has_ev_charger ? 'text-blue-400' : ''}`} />
                <span>EV Charger</span>
                {project.has_ev_charger && <CheckCircle className="h-4 w-4 text-green-400 ml-auto" />}
              </div>
              <div className={`flex items-center gap-3 ${project.has_three_story ? 'text-white' : 'text-gray-500'}`}>
                <Home className={`h-5 w-5 ${project.has_three_story ? 'text-purple-400' : ''}`} />
                <span>3-Story Building</span>
                {project.has_three_story && <CheckCircle className="h-4 w-4 text-green-400 ml-auto" />}
              </div>
            </div>
          </div>

          {/* Roof Sections */}
          {project.roof_sections && Array.isArray(project.roof_sections) && project.roof_sections.length > 0 && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-white mb-4">
                Roof Sections ({project.roof_sections.length})
              </h3>
              <div className="space-y-3">
                {project.roof_sections.map((section: { section_name: string; panel_count: number; pitch_degrees?: number; pitch_ratio?: string; orientation?: string; azimuth?: number }, idx: number) => (
                  <div key={idx} className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{section.section_name}</span>
                      <span className="text-gray-400 text-sm">{section.panel_count} panels</span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {section.pitch_ratio && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                          Pitch: {section.pitch_ratio}
                        </span>
                      )}
                      {section.pitch_degrees && (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                          {section.pitch_degrees}°
                        </span>
                      )}
                      {section.orientation && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded">
                          {section.orientation}
                        </span>
                      )}
                      {section.azimuth && (
                        <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded">
                          {section.azimuth}° azimuth
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Roof Details */}
          {(project.roof_type || project.has_steep_pitch || project.has_flat_roof || project.has_tile_roof || project.has_metal_roof) && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-white mb-4">Roof Details</h3>
              <div className="space-y-3">
                {project.roof_type && (
                  <div>
                    <p className="text-sm text-gray-400">Roof Type</p>
                    <p className="text-white capitalize">{project.roof_type}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.has_steep_pitch && (
                    <Badge variant="outline" className="text-orange-400 border-orange-400">Steep Pitch</Badge>
                  )}
                  {project.has_flat_roof && (
                    <Badge variant="outline" className="text-blue-400 border-blue-400">Flat Roof</Badge>
                  )}
                  {project.has_tile_roof && (
                    <Badge variant="outline" className="text-amber-400 border-amber-400">Tile Roof</Badge>
                  )}
                  {project.has_metal_roof && (
                    <Badge variant="outline" className="text-gray-400 border-gray-400">Metal Roof</Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Equipment Details */}
          {(project.module_model || project.inverter_type) && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-white mb-4">Equipment</h3>
              <div className="space-y-3">
                {project.module_model && (
                  <div>
                    <p className="text-sm text-gray-400">Module Model</p>
                    <p className="text-white">{project.module_model}</p>
                  </div>
                )}
                {project.inverter_type && (
                  <div>
                    <p className="text-sm text-gray-400">Inverter</p>
                    <p className="text-white">{project.inverter_type}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignment */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Assignment</h3>
            <div className="space-y-3">
              {project.assigned_installer && (
                <div>
                  <p className="text-sm text-gray-400">Installer</p>
                  <p className="text-white flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {project.assigned_installer}
                  </p>
                </div>
              )}
              {project.ahj_jurisdiction && (
                <div>
                  <p className="text-sm text-gray-400">AHJ Jurisdiction</p>
                  <p className="text-white">{project.ahj_jurisdiction}</p>
                </div>
              )}
              {project.permit_number && (
                <div>
                  <p className="text-sm text-gray-400">Permit Number</p>
                  <p className="text-white font-mono">{project.permit_number}</p>
                </div>
              )}
            </div>
          </div>

          {/* Project Notes */}
          {project.project_notes && (
            <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
              <h3 className="font-semibold text-white mb-4">Notes</h3>
              <p className="text-gray-300 text-sm whitespace-pre-wrap">{project.project_notes}</p>
            </div>
          )}

          {/* Project ID */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Project Details</h3>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-400">Project ID</p>
                <p className="text-white text-sm font-mono">{project.id}</p>
              </div>
              {(project as unknown as { custom_id?: string }).custom_id && (
                <div>
                  <p className="text-sm text-gray-400">Custom ID</p>
                  <p className="text-white">{(project as unknown as { custom_id?: string }).custom_id}</p>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-gray-900/50 border border-red-900/50 rounded-lg p-6">
            <h3 className="font-semibold text-white mb-4">Danger Zone</h3>
            <p className="text-gray-400 text-sm mb-4">
              Permanently delete this project and all associated data.
            </p>
            <DeleteRecordButton
              recordId={project.id}
              recordName={project.customer_name}
              recordType="project"
              redirectPath="/crm/projects"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
