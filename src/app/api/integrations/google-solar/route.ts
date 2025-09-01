/**
 * Google Solar API Integration
 * 
 * Provides solar potential analysis, roof suitability assessment, and solar savings
 * calculations using Google's Solar API. Helps generate accurate solar proposals.
 * 
 * Features:
 * - Solar potential analysis
 * - Roof suitability assessment
 * - Solar panel layout optimization
 * - Energy production estimates
 * - Cost and savings calculations
 * - Weather data integration
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
    const address = searchParams.get('address');
    const endpoint = searchParams.get('endpoint') || 'buildingInsights';

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_SOLAR_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Solar API key is missing' },
        { status: 500 }
      );
    }

    let apiEndpoint: string;
    let params: URLSearchParams;

    switch (endpoint) {
      case 'buildingInsights':
        apiEndpoint = 'https://solar.googleapis.com/v1/buildingInsights:findClosest';
        params = new URLSearchParams({
          'location.latitude': '', // Will be geocoded from address
          'location.longitude': '', // Will be geocoded from address
          'requiredQuality': 'HIGH',
          'key': apiKey
        });
        break;
      
      case 'dataLayers':
        apiEndpoint = 'https://solar.googleapis.com/v1/dataLayers:get';
        params = new URLSearchParams({
          'location.latitude': '', // Will be geocoded from address
          'location.longitude': '', // Will be geocoded from address
          'radiusMeters': '100',
          'view': 'FULL_LAYERS',
          'requiredQuality': 'HIGH',
          'pixelSizeMeters': '0.5',
          'key': apiKey
        });
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid endpoint' },
          { status: 400 }
        );
    }

    // First, geocode the address to get lat/lng
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );

    if (!geocodeResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to geocode address' },
        { status: geocodeResponse.status }
      );
    }

    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData.results || geocodeData.results.length === 0) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    const location = geocodeData.results[0].geometry.location;
    
    // Update the parameters with the geocoded coordinates
    params.set('location.latitude', location.lat.toString());
    params.set('location.longitude', location.lng.toString());

    const response = await fetch(`${apiEndpoint}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Google Solar API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch data from Google Solar API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Add the original address to the response for context
    return NextResponse.json({
      ...data,
      requestedAddress: address,
      geocodedLocation: location
    });
    
  } catch (error) {
    console.error('Error in Google Solar API integration:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Solar savings calculation endpoint
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      address, 
      monthlyBill, 
      systemSizeKw, 
      electricityRatePerKwh 
    } = await request.json();

    if (!address || !monthlyBill) {
      return NextResponse.json(
        { error: 'Address and monthly bill are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_SOLAR_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Solar API key is missing' },
        { status: 500 }
      );
    }

    // Get building insights first
    const geocodeResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );

    if (!geocodeResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to geocode address' },
        { status: geocodeResponse.status }
      );
    }

    const geocodeData = await geocodeResponse.json();
    const location = geocodeData.results[0]?.geometry.location;

    if (!location) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }

    const buildingInsightsResponse = await fetch(
      `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${location.lat}&location.longitude=${location.lng}&requiredQuality=HIGH&key=${apiKey}`
    );

    if (!buildingInsightsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get building insights' },
        { status: buildingInsightsResponse.status }
      );
    }

    const buildingData = await buildingInsightsResponse.json();

    // Calculate solar potential and savings
    const solarPotential = buildingData.solarPotential;
    const maxSunshineHoursPerYear = solarPotential?.maxSunshineHoursPerYear || 1500;
    const carbonOffsetFactorKgPerMwh = solarPotential?.carbonOffsetFactorKgPerMwh || 428;

    // Use provided system size or estimate from roof area
    const estimatedSystemSize = systemSizeKw || 
      Math.min(solarPotential?.maxArrayAreaMeters2 / 6 || 10, 15); // ~6 sq meters per kW, max 15kW

    // Calculate annual energy production (kWh)
    const annualEnergyProduction = estimatedSystemSize * maxSunshineHoursPerYear;
    
    // Calculate current electricity rate from monthly bill
    const currentRate = electricityRatePerKwh || (monthlyBill * 12) / (estimatedSystemSize * maxSunshineHoursPerYear);
    
    // Calculate savings
    const annualElectricityCost = monthlyBill * 12;
    const annualSolarSavings = annualEnergyProduction * currentRate;
    const netAnnualSavings = Math.min(annualSolarSavings, annualElectricityCost);
    const monthlySavings = netAnnualSavings / 12;
    const twentyYearSavings = netAnnualSavings * 20 * 0.85; // Account for system degradation

    // Calculate environmental impact
    const annualCarbonOffset = (annualEnergyProduction / 1000) * carbonOffsetFactorKgPerMwh;
    const twentyYearCarbonOffset = annualCarbonOffset * 20;

    // Estimate system cost (rough estimate)
    const systemCostEstimate = estimatedSystemSize * 3000; // $3/W average

    return NextResponse.json({
      address,
      buildingInsights: buildingData,
      solarAnalysis: {
        estimatedSystemSizeKw: estimatedSystemSize,
        annualEnergyProductionKwh: annualEnergyProduction,
        maxSunshineHoursPerYear,
        roofAreaMeters2: solarPotential?.maxArrayAreaMeters2 || 0
      },
      financialProjection: {
        currentMonthlyBill: monthlyBill,
        currentAnnualCost: annualElectricityCost,
        estimatedMonthlySavings: Math.round(monthlySavings),
        estimatedAnnualSavings: Math.round(netAnnualSavings),
        twentyYearSavings: Math.round(twentyYearSavings),
        estimatedSystemCost: Math.round(systemCostEstimate),
        paybackPeriodYears: Math.round(systemCostEstimate / netAnnualSavings * 10) / 10
      },
      environmentalImpact: {
        annualCarbonOffsetKg: Math.round(annualCarbonOffset),
        twentyYearCarbonOffsetKg: Math.round(twentyYearCarbonOffset),
        equivalentTreesPlanted: Math.round(twentyYearCarbonOffset / 20) // ~20kg CO2 per tree per year
      }
    });
    
  } catch (error) {
    console.error('Error in Google Solar savings calculation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
