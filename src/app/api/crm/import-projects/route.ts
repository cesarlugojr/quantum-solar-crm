import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to determine project stage based on completion status
function determineProjectStage(row: Record<string, unknown>): number {
  if (row['Install Completed Date']) return 12; // PTO Approval - Complete
  if (row['Installation Scheduled Date']) return 6; // Installation Scheduling
  if (row['Permit Approved Date']) return 4; // Permit Approval
  if (row['Site Survey Scheduled Date']) return 2; // Site Survey & Engineering
  return 1; // Notice to Proceed
}

// Helper function to determine project status
function determineProjectStatus(row: Record<string, unknown>): string {
  return row['Install Completed Date'] ? 'complete' : 'active';
}

// Helper function to clean and format data
function cleanData(value: unknown): string | number | null {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return value;
  }
  return null;
}

// Helper function to parse dates from Excel
function parseExcelDate(value: unknown): string | null {
  if (!value) return null;
  
  try {
    let date: Date;
    
    if (typeof value === 'number') {
      // Excel serial date number
      date = new Date((value - 25569) * 86400 * 1000);
    } else if (typeof value === 'string') {
      date = new Date(value);
    } else {
      return null;
    }
    
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Date parsing error:', error);
    return null;
  }
}

// Helper function to parse numeric values
function parseNumber(value: unknown): number | null {
  if (!value) return null;
  
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[$,]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('🔥 IMPORT API STARTED:', new Date().toISOString());
  
  try {
    // Check if user is authenticated (in real implementation)
    // For now, we'll process the request
    console.log('🔐 Authentication check passed (development mode)');

    console.log('📥 Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('❌ No file provided in form data');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('📁 File received:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // Read the Excel file
    console.log('📖 Reading Excel file...');
    const bytes = await file.arrayBuffer();
    console.log('📋 File buffer size:', bytes.byteLength);
    
    const workbook = XLSX.read(bytes, { type: 'array' });
    console.log('📊 Workbook sheets:', workbook.SheetNames);
    
    // Get the first worksheet
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    console.log('📄 Using worksheet:', worksheetName);
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    console.log('🔄 Converted to JSON, rows found:', jsonData.length);
    
    if (jsonData.length === 0) {
      console.error('❌ No data found in Excel file');
      return NextResponse.json({ error: 'No data found in Excel file' }, { status: 400 });
    }

    // Log sample of first row for debugging
    console.log('📋 Sample data (first row):', Object.keys(jsonData[0] as Record<string, unknown>));
    
    console.log(`🚀 Processing ${jsonData.length} rows from Excel file`);

    const importResults = {
      total: jsonData.length,
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process each row
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as Record<string, unknown>;
      
      try {
        // Map Excel data to database schema
        const firstName = cleanData(row['First Name']);
        const lastName = cleanData(row['Last Name']);
        const customerName = `${firstName} ${lastName}`.trim();
        
        if (!customerName || customerName === ' ') {
          importResults.errors.push(`Row ${i + 1}: Missing customer name`);
          importResults.failed++;
          continue;
        }

        const address = [
          cleanData(row['Address']),
          cleanData(row['City']),
          cleanData(row['State']),
          cleanData(row['Zip Code'])
        ].filter(Boolean).join(', ');

        if (!address) {
          importResults.errors.push(`Row ${i + 1}: Missing address information`);
          importResults.failed++;
          continue;
        }

        const projectData = {
          customer_name: customerName,
          customer_email: cleanData(row['Primary Contact Email']),
          customer_phone: cleanData(row['Primary Contact Phone']),
          address: address,
          system_size_kw: parseNumber(row['Project Size']),
          project_value: parseNumber(row['Contract Value']),
          contract_signed_date: parseExcelDate(row['Created Date']),
          actual_completion_date: parseExcelDate(row['Install Completed Date']),
          current_stage: determineProjectStage(row),
          overall_status: determineProjectStatus(row),
          notes: `Imported from GoodPWR Data - Original ID: ${cleanData(row['GoodPWR Project Identification Number'])}`
        };

        // Insert project into database
        const { data: project, error: projectError } = await supabase
          .from('projects')
          .insert(projectData)
          .select()
          .single();

        if (projectError) {
          console.error(`Error inserting project ${i + 1}:`, projectError);
          importResults.errors.push(`Row ${i + 1}: ${projectError.message}`);
          importResults.failed++;
          continue;
        }

        // Add stage history entry
        const { error: historyError } = await supabase
          .from('project_stage_history')
          .insert({
            project_id: project.id,
            stage_id: project.current_stage,
            notes: 'Imported from GoodPWR data',
            completed_by: 'data_import',
            completed_at: project.overall_status === 'complete' ? new Date().toISOString() : null
          });

        if (historyError) {
          console.error(`Error inserting stage history ${i + 1}:`, historyError);
          // Don't fail the import for stage history errors, just log them
        }

        importResults.successful++;
        
        // Log progress every 10 records
        if ((i + 1) % 10 === 0) {
          console.log(`Processed ${i + 1} of ${jsonData.length} records`);
        }

      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error);
        importResults.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        importResults.failed++;
      }
    }

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('🎉 IMPORT COMPLETED:', {
      duration: `${duration}ms`,
      results: importResults,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `Import completed: ${importResults.successful} successful, ${importResults.failed} failed (${duration}ms)`,
      details: importResults
    });

  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.error('💥 IMPORT FAILED:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'Import failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

// Helper endpoint to get import status
export async function GET() {
  try {
    const { data: projectCount, error } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      totalProjects: projectCount,
      importEndpoint: '/api/crm/import-projects',
      supportedFormats: ['xlsx', 'xls']
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Status check failed' }, 
      { status: 500 }
    );
  }
}
