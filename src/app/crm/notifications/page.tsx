import { Metadata } from 'next';
import { Bell, CheckCircle, AlertCircle, Info, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Notifications | Quantum Solar CRM',
  description: 'View and manage all notifications',
};

// Mock notifications - in production these would come from the database
const notifications = [
  {
    id: '1',
    type: 'success',
    title: 'New Lead Assigned',
    message: 'John Smith has been assigned to you from the website contact form.',
    time: '5 minutes ago',
    read: false,
  },
  {
    id: '2',
    type: 'calendar',
    title: 'Appointment Tomorrow',
    message: 'Site survey scheduled with Maria Garcia at 123 Oak Street, 10:00 AM.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    type: 'info',
    title: 'Project Update',
    message: 'Project #1042 has moved to the Installation stage.',
    time: '3 hours ago',
    read: false,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Follow-up Required',
    message: '3 leads in your pipeline need follow-up contact today.',
    time: '5 hours ago',
    read: true,
  },
  {
    id: '5',
    type: 'success',
    title: 'Payment Received',
    message: '$15,000 milestone payment processed for Pine Street project.',
    time: '1 day ago',
    read: true,
  },
  {
    id: '6',
    type: 'info',
    title: 'Permit Approved',
    message: 'Building permit approved for Maple Avenue installation.',
    time: '2 days ago',
    read: true,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    case 'warning':
      return <AlertCircle className="h-5 w-5 text-yellow-400" />;
    case 'calendar':
      return <Calendar className="h-5 w-5 text-blue-400" />;
    default:
      return <Info className="h-5 w-5 text-gray-400" />;
  }
};

export default function NotificationsPage() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-gray-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="text-gray-400 border-gray-700 hover:bg-gray-800">
            Mark all as read
          </Button>
          <Link href="/crm/settings">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No notifications</h3>
            <p className="text-gray-400">You're all caught up! Check back later.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-800/50 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-gray-800/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-[#ff0000]" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
