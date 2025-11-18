'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, X, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'New Lead Assigned',
      message: 'John Doe from Chicago has been assigned to you',
      time: '5 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Email Campaign Sent',
      message: 'Ameren Illinois campaign sent to 25 leads',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'Follow-up Required',
      message: 'Lead #1234 hasn\'t been contacted in 3 days',
      time: '2 hours ago',
      read: false
    },
    {
      id: '4',
      type: 'success',
      title: 'Project Milestone Completed',
      message: 'Installation completed for Project #567',
      time: '1 day ago',
      read: true
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-gray-800/50';
    switch (type) {
      case 'success':
        return 'bg-green-900/20 border-green-500/20';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-500/20';
      case 'error':
        return 'bg-red-900/20 border-red-500/20';
      default:
        return 'bg-blue-900/20 border-blue-500/20';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-gray-400 mt-2">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <Check className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center">
            <Bell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-all ${getBgColor(notification.type, notification.read)} ${
                !notification.read ? 'border-l-4' : 'border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${notification.read ? 'text-gray-400' : 'text-white'}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <Badge variant="default" className="bg-red-600 text-xs">New</Badge>
                      )}
                    </div>
                    <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-300'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
