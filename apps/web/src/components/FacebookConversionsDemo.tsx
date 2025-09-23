/**
 * Facebook Conversions API Demo Component
 * 
 * Demonstrates the enhanced Facebook Conversions API integration
 * with Dataset Quality API monitoring and real-time metrics.
 * 
 * This component is for development/testing purposes to showcase
 * the improved tracking capabilities and data quality monitoring.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trackQualifiedLead, CustomerInfo, QualificationData } from '@/lib/fbPixel';

interface DatasetQuality {
  match_rate_email: number;
  match_rate_phone: number;
  match_rate_address: number;
  total_events: number;
  matched_events: number;
  overall_score: number;
  recommendations: string[];
}

export function FacebookConversionsDemo() {
  const [isTestingActive, setIsTestingActive] = useState(false);
  interface TestResult {
    timestamp: string;
    customerInfo?: CustomerInfo;
    qualificationData?: QualificationData;
    success: boolean;
    error?: string;
  }

  const [lastTestResult, setLastTestResult] = useState<TestResult | null>(null);
  const [datasetQuality, setDatasetQuality] = useState<DatasetQuality | null>(null);
  const [isLoadingQuality, setIsLoadingQuality] = useState(false);

  /**
   * Test enhanced lead tracking with customer data
   */
  const testEnhancedTracking = async () => {
    setIsTestingActive(true);
    
    try {
      const mockCustomerInfo: CustomerInfo = {
        email: 'test@example.com',
        phone: '+14075551234',
        firstName: 'John',
        lastName: 'Doe',
        city: 'Chicago',
        state: 'Illinois',
        zipCode: '60601'
      };

      const qualificationData = {
        creditScore: 720,
        shading: 'light',
        homeowner: true,
        utilityCompany: 'Ameren Illinois'
      };

      // Send enhanced tracking event
      await trackQualifiedLead('Demo Test', mockCustomerInfo, qualificationData);
      
      setLastTestResult({
        timestamp: new Date().toISOString(),
        customerInfo: mockCustomerInfo,
        qualificationData,
        success: true
      });
      
    } catch (error) {
      console.error('Enhanced tracking test failed:', error);
      setLastTestResult({
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      });
    } finally {
      setIsTestingActive(false);
    }
  };

  /**
   * Fetch Dataset Quality API metrics
   */
  const fetchDatasetQuality = async () => {
    setIsLoadingQuality(true);
    
    try {
      const response = await fetch('/api/facebook-dataset-quality?type=dataset_health');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dataset quality metrics');
      }
      
      const result = await response.json();
      
      if (result.data?.health && result.data?.match_quality) {
        setDatasetQuality({
          match_rate_email: result.data.match_quality.match_rate_email * 100,
          match_rate_phone: result.data.match_quality.match_rate_phone * 100,
          match_rate_address: result.data.match_quality.match_rate_address * 100,
          total_events: result.data.match_quality.total_events,
          matched_events: result.data.match_quality.matched_events,
          overall_score: result.data.health.overall_score,
          recommendations: result.data.health.recommendations
        });
      }
      
    } catch (error) {
      console.error('Failed to fetch dataset quality:', error);
    } finally {
      setIsLoadingQuality(false);
    }
  };

  /**
   * Get quality score badge color
   */
  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default'; // green
    if (score >= 70) return 'secondary'; // yellow
    return 'destructive'; // red
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Facebook Conversions API Integration</CardTitle>
          <CardDescription>
            Enhanced server-side tracking with Dataset Quality API monitoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Features Implemented:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Hybrid client + server-side tracking</li>
                <li>Enhanced customer matching with SHA-256 hashing</li>
                <li>Event deduplication between client and server</li>
                <li>Real-time Dataset Quality API monitoring</li>
                <li>Automatic event quality optimization</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Benefits:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>~90%+ event delivery (vs 60-70% client-only)</li>
                <li>Bypasses iOS 14.5+ tracking restrictions</li>
                <li>Works despite ad blockers</li>
                <li>Better attribution and match rates</li>
                <li>Real-time performance insights</li>
              </ul>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={testEnhancedTracking}
              disabled={isTestingActive}
            >
              {isTestingActive ? 'Testing...' : 'Test Enhanced Tracking'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={fetchDatasetQuality}
              disabled={isLoadingQuality}
            >
              {isLoadingQuality ? 'Loading...' : 'Check Dataset Quality'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {lastTestResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Last Test Result
              <Badge variant={lastTestResult.success ? 'default' : 'destructive'}>
                {lastTestResult.success ? 'Success' : 'Failed'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p><strong>Timestamp:</strong> {new Date(lastTestResult.timestamp).toLocaleString()}</p>
              {lastTestResult.success ? (
                <div>
                  <p><strong>Customer Info:</strong> {lastTestResult.customerInfo?.email}, {lastTestResult.customerInfo?.phone}</p>
                  <p><strong>Credit Score:</strong> {lastTestResult.qualificationData?.creditScore}</p>
                  <p><strong>Event sent to both client and server-side APIs</strong></p>
                </div>
              ) : (
                <p className="text-red-600"><strong>Error:</strong> {lastTestResult.error}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {datasetQuality && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Dataset Quality Metrics
              <Badge variant={getScoreBadgeVariant(datasetQuality.overall_score)}>
                Score: {datasetQuality.overall_score}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium">Email Match Rate</p>
                <p className="text-2xl font-bold">{datasetQuality.match_rate_email.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone Match Rate</p>
                <p className="text-2xl font-bold">{datasetQuality.match_rate_phone.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Events</p>
                <p className="text-2xl font-bold">{datasetQuality.total_events.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Matched Events</p>
                <p className="text-2xl font-bold">{datasetQuality.matched_events.toLocaleString()}</p>
              </div>
            </div>
            
            {datasetQuality.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Recommendations:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {datasetQuality.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}