/**
 * Sign In Page - Shadcn Enhanced
 * 
 * Clerk authentication sign-in page with sophisticated shadcn UI design.
 * Features consistent theming with the CRM system using shadcn components.
 * 
 * Features:
 * - Shadcn Card component integration
 * - Professional gradient backgrounds
 * - Consistent theming with CRM dashboard
 * - Responsive design with mobile optimization
 * - Enhanced visual hierarchy
 * - Quantum Solar branding
 * - Automatic redirects after successful authentication
 */

import { SignIn } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignInPage() {
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
              Sign in to access your CRM dashboard
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Enhanced Clerk Component with Shadcn Card */}
        <Card className="bg-gray-900/70 border-gray-700 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-0">
            <div className="p-6">
              <SignIn 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent border-none shadow-none p-0",
                    headerTitle: "text-white text-2xl font-semibold mb-2",
                    headerSubtitle: "text-gray-300 mb-6 leading-relaxed",
                    socialButtonsBlockButton: "bg-gray-800 border-gray-600 text-white hover:bg-gray-700 transition-all duration-200 mb-4",
                    formButtonPrimary: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25 mt-4 mb-4",
                    formFieldInput: "bg-gray-800/70 border-gray-600 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500/20 transition-all duration-200 mb-2",
                    formFieldLabel: "text-gray-300 font-medium mb-2 block",
                    formFieldRow: "mb-4",
                    formField: "mb-4",
                    identityPreviewText: "text-white mb-2",
                    identityPreviewEditButton: "text-red-400 hover:text-red-300 ml-2",
                    footerActionText: "text-gray-400 mb-2 leading-relaxed",
                    footerActionLink: "text-red-400 hover:text-red-300 font-medium",
                    footer: "mt-6 pt-4",
                    dividerLine: "bg-gray-600 my-4",
                    dividerText: "text-gray-400 px-4",
                    dividerRow: "my-6",
                    formFieldInputShowPasswordButton: "text-gray-400 hover:text-white",
                    formFieldHintText: "text-gray-500 text-sm mt-1 leading-relaxed",
                    formFieldErrorText: "text-red-400 text-sm mt-1 leading-relaxed",
                    formFieldSuccessText: "text-green-400 text-sm mt-1 leading-relaxed",
                    formHeaderTitle: "text-white mb-2",
                    formHeaderSubtitle: "text-gray-300 mb-4 leading-relaxed",
                    otpCodeFieldInput: "bg-gray-800/70 border-gray-600 text-white mb-2",
                    formResendCodeLink: "text-red-400 hover:text-red-300 mt-2 inline-block",
                    alertText: "text-yellow-400 leading-relaxed",
                    alert: "mb-4 p-3 rounded",
                    formFieldAction: "text-red-400 hover:text-red-300 text-sm mt-1 inline-block",
                    formFieldOptionalText: "text-gray-500 text-sm",
                    formFieldRadioInput: "border-gray-600 text-red-500 focus:ring-red-500 mr-2",
                    formFieldCheckboxInput: "border-gray-600 text-red-500 focus:ring-red-500 mr-2",
                    socialButtons: "mb-6",
                    main: "space-y-4",
                  },
                  layout: {
                    socialButtonsVariant: "blockButton",
                    socialButtonsPlacement: "top"
                  }
                }}
                redirectUrl="/crm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Footer */}
        <Card className="bg-gray-900/30 border-gray-700 backdrop-blur-sm mt-6">
          <CardContent className="pt-6">
            <div className="text-center text-gray-400 text-sm">
              <p className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Need access? Contact your administrator
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-blue-600/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1),transparent_50%)]" />
        
        {/* Animated Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-white/5 rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 border border-red-500/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-3/4 left-1/2 w-32 h-32 border border-blue-500/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="h-full w-full bg-grid-white/10 bg-[length:32px_32px]" />
        </div>
      </div>
    </div>
  );
}
