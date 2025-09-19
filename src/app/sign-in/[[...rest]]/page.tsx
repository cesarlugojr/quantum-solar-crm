import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quantum Solar CRM</h1>
          <p className="text-gray-300">Sign in to access your dashboard</p>
        </div>
        
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <SignIn 
            fallbackRedirectUrl="/crm"
            appearance={{
              elements: {
                card: "bg-transparent shadow-none",
                headerTitle: "text-white",
                headerSubtitle: "text-gray-300",
                formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white",
                formFieldInput: "bg-gray-800 border-gray-600 text-white",
                formFieldLabel: "text-gray-300",
                footerActionText: "text-gray-400",
                footerActionLink: "text-red-400"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
