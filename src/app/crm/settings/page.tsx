'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Settings as SettingsIcon,
  Link2,
  Link2Off,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Bell,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QBOStatus {
  connected: boolean;
  realmId: string | null;
  expiresAt: string | null;
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [qboStatus, setQboStatus] = useState<QBOStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Check for URL params from OAuth callback
  const qboConnected = searchParams.get('qbo_connected');
  const qboError = searchParams.get('qbo_error');

  // Fetch QBO status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/quickbooks/status');
        const data = await response.json();
        setQboStatus(data);
      } catch (error) {
        console.error('Error fetching QBO status:', error);
        setQboStatus({ connected: false, realmId: null, expiresAt: null });
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const handleConnect = () => {
    setActionLoading(true);
    // Redirect to OAuth authorization
    window.location.href = '/api/quickbooks/authorize';
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect QuickBooks?')) {
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch('/api/quickbooks/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        setQboStatus({ connected: false, realmId: null, expiresAt: null });
      }
    } catch (error) {
      console.error('Error disconnecting QBO:', error);
    } finally {
      setActionLoading(false);
    }
  };

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

      {/* Success/Error Messages from QBO OAuth */}
      {qboConnected && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <p className="text-green-400">QuickBooks Online connected successfully!</p>
        </div>
      )}

      {qboError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-400" />
          <p className="text-red-400">
            Error connecting to QuickBooks: {decodeURIComponent(qboError)}
          </p>
        </div>
      )}

      {/* QuickBooks Integration Section */}
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              QuickBooks Online
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : qboStatus?.connected ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Connected
                </Badge>
              ) : (
                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                  Not Connected
                </Badge>
              )}
            </h2>
            <p className="text-gray-400">
              Connect your QuickBooks Online account to automatically sync invoices and track payments.
            </p>
          </div>

          <div className="flex-shrink-0">
            {qboStatus?.connected ? (
              <Button
                onClick={handleDisconnect}
                disabled={actionLoading}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Link2Off className="h-4 w-4 mr-2" />
                )}
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={actionLoading || loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4 mr-2" />
                )}
                Connect QuickBooks
              </Button>
            )}
          </div>
        </div>

        {/* Connection Details */}
        {qboStatus?.connected && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Connection Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Company ID (Realm ID)</p>
                <p className="text-white font-mono text-sm">{qboStatus.realmId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Connection Expires</p>
                <p className="text-white text-sm">
                  {qboStatus.expiresAt
                    ? new Date(qboStatus.expiresAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Features</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Automatic invoice sync to QuickBooks
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Payment status synchronization
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Customer record management
            </li>
          </ul>
        </div>

        {/* Help Link */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <a
            href="https://developer.intuit.com/app/developer/qbo/docs/get-started"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:underline flex items-center gap-1"
          >
            Learn more about QuickBooks integration
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Other Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            General Settings
          </h2>
          <p className="text-gray-400">General settings will be implemented here</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </h2>
          <p className="text-gray-400">Notification preferences will be implemented here</p>
        </div>

        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management
          </h2>
          <p className="text-gray-400">Team settings will be implemented here</p>
        </div>
      </div>
    </div>
  );
}
