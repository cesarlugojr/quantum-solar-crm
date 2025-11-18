'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, X, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export const NotificationsDropdown = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'info',
      title: 'New Lead Assigned',
      message: 'John Smith has been assigned to you',
      time: '5 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'success',
      title: 'Project Milestone',
      message: 'Solar panels installed at Oak Street',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'Permit Expiring',
      message: 'Permit for Maple Ave project expires in 7 days',
      time: '2 hours ago',
      read: false
    },
    {
      id: '4',
      type: 'info',
      title: 'New Message',
      message: 'Customer inquiry about financing options',
      time: '3 hours ago',
      read: true
    },
    {
      id: '5',
      type: 'success',
      title: 'Payment Received',
      message: '$15,000 payment processed for Pine Street',
      time: '5 hours ago',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getTypeColor = (type: string) => {
    const colors = {
      info: 'text-blue-600 bg-blue-100',
      success: 'text-green-600 bg-green-100',
      warning: 'text-orange-600 bg-orange-100',
      error: 'text-red-600 bg-red-100'
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      info: '💬',
      success: '✓',
      warning: '⚠️',
      error: '✕'
    };
    return icons[type as keyof typeof icons] || icons.info;
  };

  // Show only the 3 most recent notifications in dropdown
  const recentNotifications = notifications.slice(0, 3);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="text-gray-400 hover:text-white relative focus:outline-none">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-4 py-2 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-500">{unreadCount} unread</p>
          )}
        </div>

        {recentNotifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No notifications
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`px-4 py-3 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => router.push('/crm/notifications')}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`}>
                    <span className="text-sm">{getTypeIcon(notification.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full ml-2"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-0.5">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-400">{notification.time}</p>
                      <div className="flex items-center space-x-1">
                        {!notification.read && (
                          <button
                            onClick={(e) => markAsRead(notification.id, e)}
                            className="p-1 hover:bg-gray-200 rounded"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3 text-gray-500" />
                          </button>
                        )}
                        <button
                          onClick={(e) => dismissNotification(notification.id, e)}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Dismiss"
                        >
                          <X className="h-3 w-3 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />
        <div className="px-2 py-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-sm"
            onClick={() => router.push('/crm/notifications')}
          >
            <Eye className="h-4 w-4 mr-2" />
            See all notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
