'use client';

import { supabase as supabaseClient } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface CRMRealtimeData {
  leads: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  activities: Record<string, unknown>[];
}

export class CRMRealtimeManager {
  private supabase = supabaseClient;
  private channels: RealtimeChannel[] = [];
  private listeners: Map<string, ((payload: Record<string, unknown>) => void)[]> = new Map();

  // Subscribe to real-time lead updates
  subscribeToLeads(callback: (payload: Record<string, unknown>) => void) {
    const channel = this.supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_submissions'
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    this.channels.push(channel);
    this.addListener('leads', callback);
    return channel;
  }

  // Subscribe to project status updates
  subscribeToProjects(callback: (payload: Record<string, unknown>) => void) {
    const channel = this.supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    this.channels.push(channel);
    this.addListener('projects', callback);
    return channel;
  }

  // Subscribe to activity log for audit trail
  subscribeToActivities(userId: string, callback: (payload: Record<string, unknown>) => void) {
    const channel = this.supabase
      .channel('activity-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    this.channels.push(channel);
    this.addListener('activities', callback);
    return channel;
  }

  // Utility to broadcast CRM notifications
  async broadcastNotification(type: string, data: Record<string, unknown>, userId?: string) {
    const channel = this.supabase.channel('crm-notifications');

    await channel.send({
      type: 'broadcast',
      event: 'notification',
      payload: {
        type,
        data,
        userId,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Clean up all subscriptions
  disconnect() {
    this.channels.forEach(channel => {
      this.supabase.removeChannel(channel);
    });
    this.channels = [];
    this.listeners.clear();
  }

  private addListener(type: string, callback: (payload: Record<string, unknown>) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)?.push(callback);
  }

  // Get current subscription count for debugging
  getSubscriptionCount() {
    return {
      channels: this.channels.length,
      listeners: Array.from(this.listeners.entries()).map(([type, callbacks]) => ({
        type,
        count: callbacks.length
      }))
    };
  }
}

// Export singleton instance
export const crmRealtime = new CRMRealtimeManager();