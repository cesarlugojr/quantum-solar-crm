import { Metadata } from 'next';
import { MessageSquare, Mail, Phone, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Messages | Quantum Solar CRM',
  description: 'Communication center for leads and customers',
};

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Messages</h1>
        <p className="text-gray-400 mt-1">
          Communicate with leads and customers
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl mb-6">
          <MessageSquare className="h-8 w-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Messaging Center Coming Soon</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          A unified inbox for all your customer communications including 
          emails, SMS, and internal notes.
        </p>

        {/* Preview Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Mail className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">Email Integration</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Phone className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">SMS Messaging</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Send className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">Quick Templates</p>
          </div>
        </div>
      </div>
    </div>
  );
}
