/**
 * Enphase API Integration
 * 
 * Provides solar system monitoring and performance data from Enphase Energy systems.
 * Used for tracking system performance, energy production, and maintenance alerts.
 * 
 * Features:
 * - System performance monitoring
 * - Energy production data
 * - Inverter status and health
 * - Historical data retrieval
 * - Maintenance alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get('systemId');
    const endpoint = searchParams.get('endpoint') || 'summary';

    if (!systemId) {
      return NextResponse.json(
        { error: 'System ID is required' },
        { status: 400 }
      );
    }

    const enphaseApiKey = process.env.ENPHASE_API_KEY;
    const enphaseUserId = process.env.ENPHASE_API_USER_ID;
    const enphaseApiUrl = process.env.ENPHASE_API_URL;

    if (!enphaseApiKey || !enphaseUserId || !enphaseApiUrl) {
      return NextResponse.json(
        { error: 'Enphase API configuration missing' },
        { status: 500 }
      );
    }

    let apiEndpoint: string;
    
    switch (endpoint) {
      case 'summary':
        apiEndpoint = `${enphaseApiUrl}/systems/${systemId}/summary`;
        break;
      case 'energy_lifetime':
        apiEndpoint = `${enphaseApiUrl}/systems/${systemId}/energy_lifetime`;
        break;
      case 'stats':
        apiEndpoint = `${enphaseApiUrl}/systems/${systemId}/stats`;
        break;
      case 'inventory':
        apiEndpoint = `${enphaseApiUrl}/systems/${systemId}/inventory`;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }

    const response = await fetch(apiEndpoint, {
      headers: {
        'Authorization': `Bearer ${enphaseApiKey}`,
        'User-ID': enphaseUserId,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Enphase API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch data from Enphase API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
    } catch (err) {
      console.error('Error fetching production data:', err);
      return NextResponse.json(
        { error: 'Failed to fetch production data' },
        { status: 500 }
      );
    }
}

// Example usage for CRM dashboard
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { systemIds } = await request.json();

    if (!systemIds || !Array.isArray(systemIds)) {
      return NextResponse.json(
        { error: 'System IDs array is required' },
        { status: 400 }
      );
    }

    // Fetch summary data for multiple systems
    const systemsData = await Promise.all(
      systemIds.map(async (systemId: string) => {
        try {
          const summaryResponse = await fetch(`${process.env.ENPHASE_API_URL}/systems/${systemId}/summary`, {
            headers: {
              'Authorization': `Bearer ${process.env.ENPHASE_API_KEY}`,
              'User-ID': process.env.ENPHASE_API_USER_ID || 'placeholder-user-id',
              'Content-Type': 'application/json'
            }
          });

          if (summaryResponse.ok) {
            const summary = await summaryResponse.json();
            return {
              systemId,
              ...summary
            };
          }
          
          return {
            systemId,
            error: 'Failed to fetch system data'
          };
        } catch {
          return {
            systemId,
            error: 'System fetch error'
          };
        }
      })
    );

    return NextResponse.json({ systems: systemsData });
    
  } catch (error) {
    console.error('Error in Enphase bulk API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
