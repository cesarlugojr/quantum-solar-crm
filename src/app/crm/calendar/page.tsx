import { Metadata } from 'next';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Calendar | Quantum Solar CRM',
  description: 'Appointment and scheduling management',
};

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Calendar</h1>
        <p className="text-gray-400 mt-1">
          Manage appointments and schedules
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl mb-6">
          <Calendar className="h-8 w-8 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Calendar Coming Soon</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          Schedule and manage site surveys, installations, inspections, 
          and customer appointments all in one place.
        </p>

        {/* Preview Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">Appointment Scheduling</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <MapPin className="h-6 w-6 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">Route Planning</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-gray-300">Team Availability</p>
          </div>
        </div>
      </div>
    </div>
  );
}
