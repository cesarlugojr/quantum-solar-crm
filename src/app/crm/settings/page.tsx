import { Metadata } from 'next';
import { Settings as SettingsIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Settings | Quantum Solar CRM',
  description: 'Manage your CRM settings and preferences',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-8 w-8 text-[#ff0000]" />
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">
            Manage your CRM preferences and configuration
          </p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">General Settings</h2>
          <p className="text-gray-400">General settings will be implemented here</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
          <p className="text-gray-400">Notification preferences will be implemented here</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Team Management</h2>
          <p className="text-gray-400">Team settings will be implemented here</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Integration Settings</h2>
          <p className="text-gray-400">Third-party integrations will be implemented here</p>
        </div>
      </div>
    </div>
  );
}
