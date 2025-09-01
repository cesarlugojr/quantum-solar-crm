/**
 * CRM Layout Content
 * 
 * The actual CRM layout component with Clerk authentication.
 * Separated from the main layout to prevent SSR issues.
 */

"use client";

import { useUser, SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Settings,
  User,
  LogOut,
  Home,
  Users,
  Building2,
  Briefcase,
  BarChart3,
  MessageSquare,
  Calendar,
  FileText,
  Menu,
  X
} from 'lucide-react';

interface CRMLayoutContentProps {
  children: React.ReactNode;
}

export default function CRMLayoutContent({ children }: CRMLayoutContentProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  console.log('🏢 CRM LAYOUT: Rendering', { isLoaded, hasUser: !!user });

  // Redirect to sign-in if not authenticated
  if (isLoaded && !user) {
    console.log('❌ CRM LAYOUT: No user found, redirecting to sign-in');
    router.push('/sign-in');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecting to sign-in...</p>
        </div>
      </div>
    );
  }

  // Show loading while auth is being checked
  if (!isLoaded) {
    console.log('🔄 CRM LAYOUT: Loading auth state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading CRM...</p>
        </div>
      </div>
    );
  }

  console.log('✅ CRM LAYOUT: User authenticated, rendering CRM');

  // Role-based access control
  const getUserRole = () => {
    if (!user) return 'guest';
    const email = user.emailAddresses[0]?.emailAddress || '';
    if (email.includes('admin') || email === 'cesar@quantumsolar.us') return 'admin';
    if (email.includes('manager')) return 'manager';
    if (email.includes('sales')) return 'sales';
    if (email.includes('installer')) return 'installer';
    return 'user';
  };

  const userRole = getUserRole();

  const navigation = [
    { name: 'Dashboard', href: '/crm', icon: Home },
    { name: 'Leads', href: '/crm/leads', icon: Users },
    { name: 'Projects', href: '/crm/projects', icon: Building2 },
    { name: 'Candidates', href: '/crm/candidates', icon: Briefcase },
    { name: 'Analytics', href: '/crm/analytics', icon: BarChart3 },
    { name: 'Messages', href: '/crm/messages', icon: MessageSquare },
    { name: 'Calendar', href: '/crm/calendar', icon: Calendar },
    { name: 'Reports', href: '/crm/reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-gray-400 hover:text-white"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
              
              {/* Logo */}
              <div className="flex ml-2 md:mr-24">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">QS</span>
                  </div>
                  <span className="self-center text-xl font-semibold text-white">
                    Quantum Solar CRM
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Role Badge */}
              <Badge variant="outline" className="border-gray-600 text-gray-300 hidden md:flex">
                {userRole.toUpperCase()}
              </Badge>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  className="relative h-8 w-8 rounded-full"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#ff0000] to-[#cc0000] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                </Button>
              </div>

              {/* Settings Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white"
                onClick={() => router.push('/crm/settings')}
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* Profile Button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-400 hover:text-white"
                onClick={() => router.push('/crm/profile')}
              >
                <User className="h-5 w-5" />
              </Button>

              {/* Sign Out Button */}
              <SignOutButton>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-400 hover:text-red-300"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-gray-900 border-r border-gray-800 lg:translate-x-0`}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {navigation.map((item) => {
              const isActive = false; // You can implement active state logic here
              return (
                <li key={item.name}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-left h-10 px-3 ${
                      isActive
                        ? 'bg-[#ff0000] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                    onClick={() => {
                      router.push(item.href);
                      setSidebarOpen(false);
                    }}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="p-4 lg:ml-64 pt-20">
        <div className="rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
}