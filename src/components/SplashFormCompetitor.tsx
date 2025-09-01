/**
 * SplashFormCompetitor Component - Multi-Step Lead Capture Form (Competitor Style)
 * 
 * A sophisticated multi-step form with sliding animations for the Ameren Illinois
 * bill pay promotion, using competitor-style soft-intent questions first.
 * 
 * Features:
 * - 14 sequential form steps with slide animations (added average bill slider)
 * - Soft intent questions first (ZIP, utility, bill amount) before personal info
 * - TCPA consent after phone number for abandoned lead compliance
 * - Real-time validation and error handling
 * - Conditional disqualification logic
 * - Incremental data persistence to prevent data loss
 * - Mobile-first responsive design
 * - Accessibility compliant
 * - Average monthly bill slider component
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useRouter } from "next/navigation";
import { trackLeadEvent } from "@/lib/fbPixel";
import { trackFormSubmission, trackLead, trackConversion } from "@/lib/gtm";

// Generate unique session ID with QSLID convention
const generateSessionId = (): string => {
  return 'QSLID-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

// Form data interface - includes new averageMonthlyBill field
interface SplashFormData {
  zipCode: string;
  utilityCompany: string;
  averageMonthlyBill: number;
  homeownerStatus: string;
  creditScore: string;
  shading: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tcpaConsent: boolean;
  smsConsent: boolean;
  streetAddress: string;
  city: string;
  state: string;
}

// Form step configuration
interface FormStep {
  id: string;
  label: string;
  field: keyof SplashFormData;
  type: 'text' | 'email' | 'tel' | 'select' | 'slider';
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation: (value: string | number) => string | null;
  sliderConfig?: {
    min: number;
    max: number;
    step: number;
    formatValue: (value: number) => string;
  };
}

const FORM_STEPS: FormStep[] = [
  // Soft intent questions first - competitor style
  {
    id: 'zipCode',
    label: 'What\'s your ZIP code?',
    field: 'zipCode',
    type: 'text',
    placeholder: '12345',
    validation: (value) => {
      const stringValue = String(value);
      if (!stringValue.trim()) return 'ZIP code is required';
      if (!/^\d{5}(-\d{4})?$/.test(stringValue)) {
        return 'Please enter a valid ZIP code';
      }
      return null;
    }
  },
  {
    id: 'utilityCompany',
    label: 'Who is your utility company?',
    field: 'utilityCompany',
    type: 'text',
    placeholder: 'Utility company name',
    validation: (value) => !String(value).trim() ? 'Utility company is required' : null
  },
  {
    id: 'averageMonthlyBill',
    label: 'What\'s your average monthly electric bill?',
    field: 'averageMonthlyBill',
    type: 'slider',
    validation: (value) => {
      const numValue = Number(value);
      if (numValue < 50 || numValue > 500) return 'Please select a valid bill amount';
      return null;
    },
    sliderConfig: {
      min: 50,
      max: 500,
      step: 10,
      formatValue: (value: number) => value >= 500 ? '$500+' : `$${value}`
    }
  },
  {
    id: 'homeownerStatus',
    label: 'Are you a homeowner?',
    field: 'homeownerStatus',
    type: 'select',
    options: [
      { value: '', label: 'Select an option' },
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' }
    ],
    validation: (value) => !String(value) ? 'Please select your homeowner status' : null
  },
  {
    id: 'creditScore',
    label: 'What\'s your credit score range?',
    field: 'creditScore',
    type: 'select',
    options: [
      { value: '', label: 'Select an option' },
      { value: '650+', label: '650 or above' },
      { value: 'below650', label: 'Below 650' }
    ],
    validation: (value) => !String(value) ? 'Please select your credit score range' : null
  },
  {
    id: 'shading',
    label: 'How much shading does your home have?',
    field: 'shading',
    type: 'select',
    options: [
      { value: '', label: 'Select an option' },
      { value: 'none', label: 'No Heavy Shading' },
      { value: 'heavy', label: 'Heavy Shading' }
    ],
    validation: (value) => !String(value) ? 'Please select your home\'s shading condition' : null
  },
  // Personal information comes later - competitor style
  {
    id: 'firstName',
    label: 'What\'s your first name?',
    field: 'firstName',
    type: 'text',
    placeholder: 'Enter your first name',
    validation: (value) => !String(value).trim() ? 'First name is required' : null
  },
  {
    id: 'lastName',
    label: 'What\'s your last name?',
    field: 'lastName',
    type: 'text',
    placeholder: 'Enter your last name',
    validation: (value) => !String(value).trim() ? 'Last name is required' : null
  },
  {
    id: 'email',
    label: 'What\'s your email address?',
    field: 'email',
    type: 'email',
    placeholder: 'your@email.com',
    validation: (value) => {
      const stringValue = String(value);
      if (!stringValue.trim()) return 'Email is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
        return 'Please enter a valid email address';
      }
      return null;
    }
  },
  {
    id: 'phone',
    label: 'What\'s your phone number?',
    field: 'phone',
    type: 'tel',
    placeholder: '(123) 456-7890',
    validation: (value) => {
      const stringValue = String(value);
      if (!stringValue.trim()) return 'Phone number is required';
      if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(stringValue)) {
        return 'Please enter a valid phone number';
      }
      return null;
    }
  },
  // Step 11 (index 10) will be TCPA consent - handled separately
  {
    id: 'streetAddress',
    label: 'What\'s your street address?',
    field: 'streetAddress',
    type: 'text',
    placeholder: '123 Main Street',
    validation: (value) => !String(value).trim() ? 'Street address is required' : null
  },
  {
    id: 'city',
    label: 'What city do you live in?',
    field: 'city',
    type: 'text',
    placeholder: 'City name',
    validation: (value) => !String(value).trim() ? 'City is required' : null
  },
  {
    id: 'state',
    label: 'What state do you live in?',
    field: 'state',
    type: 'text',
    placeholder: 'IL',
    validation: (value) => !String(value).trim() ? 'State is required' : null
  }
];

export function SplashFormCompetitor() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [formData, setFormData] = useState<SplashFormData>({
    zipCode: '',
    utilityCompany: 'Ameren Illinois',
    averageMonthlyBill: 150, // Default to $150
    homeownerStatus: '',
    creditScore: '',
    shading: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    tcpaConsent: false,
    smsConsent: false,
    streetAddress: '',
    city: '',
    state: 'IL'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Clear localStorage and initialize fresh session on mount
  useEffect(() => {
    localStorage.removeItem('quantumSolarSplashFormCompetitor');
    setSessionId(generateSessionId());
  }, []);

  // Auto-save form data to localStorage (but don't restore on reload to prevent jumping to wrong step)
  const saveToLocalStorage = useCallback(() => {
    if (!sessionId) return;
    try {
      localStorage.setItem('quantumSolarSplashFormCompetitor', JSON.stringify({
        ...formData,
        sessionId,
        lastSaved: new Date().toISOString(),
        currentStep
      }));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [formData, sessionId, currentStep]);

  // Save partial data to database with session tracking
  const savePartialData = useCallback(async (sendEmail = false) => {
    if (!sessionId) return;
    try {
      console.log('Saving partial data:', {
        ...formData,
        sessionId,
        isPartial: true,
        currentStep,
        sendEmailNotification: sendEmail,
        timestamp: new Date().toISOString()
      });

      const response = await fetch('/api/splash-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sessionId,
          isPartial: true,
          currentStep,
          sendEmailNotification: sendEmail,
          timestamp: new Date().toISOString()
        })
      });
      
      const responseText = await response.text();
      console.log('Partial save response:', response.status, responseText);
      
      if (!response.ok) {
        console.error('Partial save failed:', response.status, responseText);
      }
    } catch (error) {
      console.error('Failed to save partial data:', error);
    }
  }, [formData, sessionId, currentStep]);

  // Set up beforeunload event listener for abandoned form tracking
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only send abandonment email if user has consented and provided contact info
      if (formData.tcpaConsent && formData.phone && currentStep > 10) {
        fetch('/api/splash-leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            sessionId,
            isPartial: true,
            sendEmailNotification: true,
            timestamp: new Date().toISOString()
          })
        }).catch(console.error);
        
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData, sessionId, currentStep]);

  // Save to localStorage whenever form data changes
  useEffect(() => {
    if (sessionId) {
      saveToLocalStorage();
    }
  }, [formData, sessionId, currentStep, saveToLocalStorage]);

  // Check if current step disqualifies the user (homeowner status only)
  const checkDisqualification = (step: FormStep, value: string | number) => {
    if (step.field === 'homeownerStatus' && value === 'no') {
      return 'Not a homeowner';
    }
    // Credit score and shading restrictions removed - these leads are now accepted
    return null;
  };

  // Get current step info - handle consent step specially
  const getCurrentStepInfo = () => {
    if (currentStep === 10) {
      // TCPA Consent step (after phone number)
      return { isConsentStep: true, step: null };
    } else if (currentStep < 10) {
      // Steps 1-10 (zipCode through phone)
      return { isConsentStep: false, step: FORM_STEPS[currentStep] };
    } else {
      // Steps after consent (streetAddress onwards) - adjust index
      return { isConsentStep: false, step: FORM_STEPS[currentStep - 1] };
    }
  };

  // Handle input change
  const handleInputChange = (value: string | number) => {
    const { step } = getCurrentStepInfo();
    if (!step) return;
    
    const currentField = step.field;
    setFormData(prev => ({ ...prev, [currentField]: value }));
    
    // Clear any existing error
    if (errors[currentField]) {
      setErrors(prev => ({ ...prev, [currentField]: '' }));
    }
  };

  // Handle checkbox change for TCPA consent
  const handleCheckboxChange = (field: 'tcpaConsent' | 'smsConsent', checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
    
    // Clear any existing error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate current step
  const validateCurrentStep = () => {
    const { isConsentStep, step } = getCurrentStepInfo();
    
    if (isConsentStep) {
      // Validate TCPA consent requirements
      let hasError = false;
      if (!formData.tcpaConsent) {
        setErrors(prev => ({ ...prev, tcpaConsent: 'You must consent to be contacted to continue.' }));
        hasError = true;
      }
      if (!formData.smsConsent) {
        setErrors(prev => ({ ...prev, smsConsent: 'You must consent to receive text messages to continue.' }));
        hasError = true;
      }
      return !hasError;
    }

    if (!step) return false;
    
    const value = formData[step.field];
    // Convert boolean values to strings for validation
    const validationValue = typeof value === 'boolean' ? String(value) : value;
    const error = step.validation(validationValue);
    
    if (error) {
      setErrors(prev => ({ ...prev, [step.field]: error }));
      return false;
    }
    
    return true;
  };

  // Handle next step
  const handleNext = async () => {
    if (!validateCurrentStep() || isAnimating) return;
    
    const { isConsentStep, step } = getCurrentStepInfo();
    
    // Check for disqualification (homeowner status only)
    if (!isConsentStep && step) {
      const currentValue = formData[step.field];
      // Only check disqualification for string/number fields, not boolean fields
      if (typeof currentValue === 'string' || typeof currentValue === 'number') {
        const disqualificationReason = checkDisqualification(step, currentValue);
        
        if (disqualificationReason) {
          // Set loading state to prevent multiple submissions
          setIsAnimating(true);
          
          // Send disqualified lead notification
          try {
            await fetch('/api/disqualified-leads', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...formData,
                sessionId,
                disqualificationReason,
                timestamp: new Date().toISOString()
              })
            });
          } catch (error) {
            console.error('Failed to send disqualified lead notification:', error);
          }
          
          // Ensure redirect happens after API call
          setTimeout(() => {
            router.push('/state-promotions/illinois/ameren-il/disqualified');
          }, 500);
          return;
        }
      }
    }
    
    // Animate to next step
    setIsAnimating(true);
    
    setTimeout(() => {
      if (currentStep < 13) { // Total of 14 steps (0-13)
        setCurrentStep(prev => prev + 1);
      } else {
        // Submit complete form
        handleSubmit();
      }
      setIsAnimating(false);
    }, 300);
    
    // Save partial data after consent is obtained
    if (currentStep > 10 && currentStep % 3 === 0) {
      await savePartialData();
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    
    try {
      console.log('Submitting form data:', {
        ...formData,
        sessionId,
        isPartial: false,
        sendEmailNotification: true,
        completedAt: new Date().toISOString()
      });

      const response = await fetch('/api/splash-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sessionId,
          isPartial: false,
          sendEmailNotification: true,
          completedAt: new Date().toISOString()
        })
      });
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error(`Invalid server response: ${responseText}`);
      }
      
      if (!response.ok) {
        console.error('API Error Response:', responseData);
        throw new Error(`Submission failed (${response.status}): ${responseData.error || responseData.message || 'Unknown error'}`);
      }
      
      console.log('Submission successful:', responseData);
      
      // Track Facebook pixel event for splash form submission
      trackLeadEvent('Ameren Illinois Splash Form Competitor');
      
      // Track GTM events
      trackFormSubmission('ameren_illinois_splash_competitor', {
        homeowner_status: formData.homeownerStatus,
        credit_score: formData.creditScore,
        utility_company: formData.utilityCompany,
        average_monthly_bill: formData.averageMonthlyBill
      });
      trackLead('ameren_illinois_splash_competitor');
      trackConversion('ameren_illinois', 'form_completion_competitor');

      // Track Google Analytics conversion event
      if (typeof window !== 'undefined' && (window as Window & {gtag?: (...args: unknown[]) => void}).gtag) {
        (window as Window & {gtag?: (...args: unknown[]) => void}).gtag!('event', 'conversion_event_submit_lead_form', {
          form_type: 'ameren_illinois_splash_competitor',
          homeowner_status: formData.homeownerStatus,
          credit_score: formData.creditScore,
          utility_company: formData.utilityCompany,
          average_monthly_bill: formData.averageMonthlyBill
        });
      }
      
      // Clear saved data
      localStorage.removeItem('quantumSolarSplashFormCompetitor');
      router.push('/state-promotions/illinois/ameren-il/thank-you');
      
    } catch (error) {
      console.error('Form submission error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors(prev => ({
        ...prev,
        submission: `Failed to submit form: ${errorMessage}. Please try again or contact support.`
      }));
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle start over functionality
  const handleStartOver = () => {
    setFormData({
      zipCode: '',
      utilityCompany: 'Ameren Illinois',
      averageMonthlyBill: 150,
      homeownerStatus: '',
      creditScore: '',
      shading: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      tcpaConsent: false,
      smsConsent: false,
      streetAddress: '',
      city: '',
      state: 'IL'
    });
    
    setCurrentStep(0);
    setErrors({});
    setSessionId(generateSessionId());
    localStorage.removeItem('quantumSolarSplashFormCompetitor');
  };

  const totalSteps = 14; // Total steps including consent step and new bill slider
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const { isConsentStep, step } = getCurrentStepInfo();

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-white/60 mb-2">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-[#ff0000] h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Form Container */}
      <div className="relative h-[600px] overflow-hidden">
        <div 
          className={`absolute inset-0 transition-transform duration-300 ease-in-out ${
            isAnimating ? 'transform translate-x-[-100%]' : 'transform translate-x-0'
          }`}
        >
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            {isConsentStep ? (
              // TCPA Consent Step (Step 11)
              <>
                <h2 className="text-xl font-semibold text-white mb-4 text-center">
                  Communication Consent
                </h2>
                <p className="text-sm text-white/80 mb-6 text-center">
                  To provide you with the best service and send you information about our bill payment promotion, we need your consent:
                </p>
                
                <div className="space-y-4 mb-6">
                  {/* TCPA Consent Checkbox */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="tcpaConsent"
                      checked={formData.tcpaConsent}
                      onChange={(e) => handleCheckboxChange('tcpaConsent', e.target.checked)}
                      className="mt-1 h-4 w-4 text-[#ff0000] bg-white/5 border-white/20 rounded 
                        focus:ring-2 focus:ring-[#ff0000] focus:ring-offset-0"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="tcpaConsent" className="text-xs text-white leading-relaxed">
                      I consent to receive marketing calls and texts from Quantum Solar using automated technology at the number I provided. Consent is not required for purchase. Reply STOP to opt out.
                    </label>
                  </div>
                  
                  {errors.tcpaConsent && (
                    <p className="text-xs text-[#ff0000] ml-7">
                      {errors.tcpaConsent}
                    </p>
                  )}

                  {/* SMS Consent Checkbox */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="smsConsent"
                      checked={formData.smsConsent}
                      onChange={(e) => handleCheckboxChange('smsConsent', e.target.checked)}
                      className="mt-1 h-4 w-4 text-[#ff0000] bg-white/5 border-white/20 rounded 
                        focus:ring-2 focus:ring-[#ff0000] focus:ring-offset-0"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="smsConsent" className="text-xs text-white leading-relaxed">
                      I consent to receive text messages from Quantum Solar. Message and data rates may apply. Reply STOP to opt out.
                    </label>
                  </div>
                  
                  {errors.smsConsent && (
                    <p className="text-xs text-[#ff0000] ml-7">
                      {errors.smsConsent}
                    </p>
                  )}
                </div>

                {/* Consent Benefits */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-6">
                  <h3 className="text-white font-medium mb-2 text-sm">Why we need this:</h3>
                  <ul className="text-xs text-white/80 space-y-1">
                    <li>• Send you details about your solar quote</li>
                    <li>• Notify you about your bill payment promotion</li>
                    <li>• Schedule your appointment</li>
                    <li>• You can opt out anytime</li>
                  </ul>
                </div>
              </>
            ) : (
              // Regular Form Steps
              <>
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                  {step?.label || 'Loading...'}
                </h2>

                <div className="mb-6">
                  {step?.type === 'select' ? (
                    <select
                      value={formData[step.field] as string}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white 
                        focus:outline-none focus:ring-2 focus:ring-[#ff0000] focus:border-transparent 
                        transition-all text-lg"
                      disabled={isSubmitting}
                    >
                      {step.options?.map(option => (
                        <option key={option.value} value={option.value} className="bg-black text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : step?.type === 'slider' ? (
                    // Average Monthly Bill Slider
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-[#ff0000] mb-2">
                          {step.sliderConfig?.formatValue(formData.averageMonthlyBill)}
                        </div>
                        <div className="text-sm text-white/60">per month</div>
                      </div>
                      
                      <Slider
                        value={[formData.averageMonthlyBill]}
                        onValueChange={(value) => handleInputChange(value[0])}
                        min={step.sliderConfig?.min || 50}
                        max={step.sliderConfig?.max || 500}
                        step={step.sliderConfig?.step || 10}
                        className="w-full"
                        disabled={isSubmitting}
                      />
                      
                      <div className="flex justify-between text-xs text-white/60">
                        <span>$50</span>
                        <span>$500+</span>
                      </div>
                    </div>
                  ) : (
                    <input
                      type={step?.type}
                      value={step ? formData[step.field] as string : ''}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder={step?.placeholder}
                      className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-lg text-white 
                        placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#ff0000] 
                        focus:border-transparent transition-all text-lg"
                      disabled={isSubmitting}
                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    />
                  )}
                  
                  {/* Error Message */}
                  {step && errors[step.field] && (
                    <p className="mt-2 text-sm text-[#ff0000]">
                      {errors[step.field]}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Action Button */}
            <Button
              onClick={handleNext}
              disabled={isSubmitting || isAnimating}
              className="w-full bg-[#ff0000] hover:bg-[#ff0000]/90 text-white px-8 h-14 text-lg 
                font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl 
                hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Processing...' : 
               currentStep === 13 ? 'Submit Application' : 
               currentStep === 0 ? 'Get Started Now – Claim Your Paid Bill' : 'Continue'}
            </Button>

            {/* Start Over Button - Only show after first step */}
            {currentStep > 0 && (
              <Button
                onClick={handleStartOver}
                disabled={isSubmitting || isAnimating}
                variant="outline"
                className="w-full mt-3 border-white/20 text-white hover:bg-white/10 px-8 h-12 text-base 
                  font-medium rounded-full transition-all duration-300 disabled:opacity-50 
                  disabled:cursor-not-allowed"
              >
                Start Over
              </Button>
            )}

            {/* Submission Error Display */}
            {errors.submission && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400 text-center">
                  {errors.submission}
                </p>
              </div>
            )}

            {/* Step Counter */}
            <div className="mt-4 text-center text-sm text-white/60">
              Press Enter or click Continue to proceed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
