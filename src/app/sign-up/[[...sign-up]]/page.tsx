/**
 * Sign Up Page - Shadcn Enhanced
 * 
 * Clerk authentication sign-up page with sophisticated shadcn UI design.
 * Features consistent theming with the CRM system using shadcn components.
 * 
 * Features:
 * - Shadcn Card component integration
 * - Professional gradient backgrounds
 * - Consistent theming with CRM dashboard
 * - Responsive design with mobile optimization
 * - Enhanced visual hierarchy
 * - Quantum Solar branding
 * - Automatic redirects after successful registration
 */

import { SignUp } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Enhanced Header with Shadcn Card */}
        <Card className="bg-gray-900/50 border-gray-700 backdrop-blur-sm shadow-2xl mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white">
              Quantum Solar
            </CardTitle>
            <CardDescription className="text-gray-200 text-base font-medium">
              Create your CRM dashboard account
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Enhanced Clerk Component with Shadcn Card */}
        <Card className="bg-gray-900/70 border-gray-700 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-0">
            <div className="p-6">
              <SignUp 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent border-none shadow-none p-0",
                    headerTitle: "text-white text-2xl font-semibold",
                    headerSubtitle: "text-gray-300",
                    socialButtonsBlockButton: "bg-gray-800 border-gray-600 text-white hover:bg-gray-700 transition-all duration-200",
                    formButtonPrimary: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25",
                    formFieldInput: "bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20 transition-all duration-200",
                    formFieldLabel: "text-gray-300 font-medium",
                    identityPreviewText: "text-white",
                    identityPreviewEditButton: "text-red-400 hover:text-red-300",
                    footerActionText: "text-gray-400",
                    footerActionLink: "text-red-400 hover:text-red-300 font-medium",
                    dividerLine: "bg-gray-600",
                    dividerText: "text-gray-400",
                    formFieldInputShowPasswordButton: "text-gray-400 hover:text-white",
                    formFieldHintText: "text-gray-500",
                    formFieldErrorText: "text-red-400",
                    formFieldSuccessText: "text-green-400",
                    formHeaderTitle: "text-white",
                    formHeaderSubtitle: "text-gray-300",
                    otpCodeFieldInput: "bg-gray-800/70 border-gray-600 text-white",
                    formResendCodeLink: "text-red-400 hover:text-red-300",
                    alertText: "text-yellow-400",
                    formFieldOptionalText: "text-gray-500",
                    formFieldAction: "text-red-400 hover:text-red-300",
                    formFieldRadioInput: "border-gray-600 text-red-500 focus:ring-red-500",
                    formFieldCheckboxInput: "border-gray-600 text-red-500 focus:ring-red-500",
                  },
                  layout: {
                    socialButtonsVariant: "blockButton",
                    socialButtonsPlacement: "top"
                  }
                }}
                fallbackRedirectUrl="/crm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Footer */}
        <Card className="bg-gray-900/30 border-gray-700 backdrop-blur-sm mt-6">
          <CardContent className="pt-6">
            <div className="text-center text-gray-400 text-sm">
              <p className="flex items-center justify-center gap-2 mb-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                By signing up, you agree to access the Quantum Solar CRM system
              </p>
              <p className="text-xs text-gray-500">
                Your account will be subject to administrator approval
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-red-600/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(59,75,140,0.1),transparent_50%)]" />
        
        {/* Animated Elements */}
        <div className="absolute top-1/3 left-1/5 w-56 h-56 border border-white/5 rounded-full animate-pulse" />
        <div className="absolute bottom-1/3 right-1/5 w-40 h-40 border border-blue-500/10 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-2/3 left-2/3 w-28 h-28 border border-red-500/10 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="h-full w-full bg-grid-white/10 bg-[length:32px_32px]" />
        </div>
      </div>
    </div>
  );
}
