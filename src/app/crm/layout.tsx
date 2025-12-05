'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import {
  Home,
  Users,
  Building2,
  Briefcase,
  Mail,
  Menu,
  X,
  Settings,
  Target,
  BarChart3,
  FileText,
} from 'lucide-react';
import { NotificationsDropdown } from '@/components/crm/NotificationsDropdown';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/crm', icon: Home },
  { name: 'Leads', href: '/crm/leads', icon: Users },
  { name: 'Opportunities', href: '/crm/opportunities', icon: Target },
  { name: 'Projects', href: '/crm/projects', icon: Building2 },
  { name: 'Invoices', href: '/crm/invoices', icon: FileText },
  { name: 'Reports', href: '/crm/reports', icon: BarChart3 },
  { name: 'Campaigns', href: '/crm/campaigns', icon: Mail },
  { name: 'Candidates', href: '/crm/candidates', icon: Briefcase },
];

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  // Show loading state while Clerk loads
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#ff0000] border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading CRM...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (handled by middleware, but extra safety)
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Not authenticated. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 bg-gray-900 border-r border-gray-700 transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="flex h-16 items-center justify-between border-b border-gray-700 px-6">
            <Link href="/crm" className="flex items-center space-x-3">
              <Image
                src="/Quantum Solar-LOGO-B1 cropped.png"
                alt="Quantum Solar"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <div>
                <p className="text-white font-semibold text-sm">Quantum Solar</p>
                <p className="text-gray-400 text-xs">CRM</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#ff0000] text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer - Status Badge */}
          <div className="border-t border-gray-700 p-4">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-gray-400">All systems operational</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-700 bg-gray-900 px-6">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Breadcrumb / Page Title - Hidden on mobile */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/crm" className="text-gray-400 hover:text-white transition-colors">
                CRM
              </Link>
              {pathname !== '/crm' && (
                <>
                  <span className="text-gray-600">/</span>
                  <span className="text-white font-medium">
                    {pathname.split('/').filter(Boolean).slice(1).join(' / ')}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationsDropdown />

            {/* Settings */}
            <Link href="/crm/settings">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>

            {/* User Button from Clerk */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-400">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
              <UserButton
                afterSignOutUrl="/sign-in"
                appearance={{
                  elements: {
                    avatarBox: 'h-10 w-10',
                  },
                }}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-700 bg-gray-900 px-6 py-4">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <p>&copy; 2025 Quantum Solar Enterprises LLC. All rights reserved.</p>
            <div className="flex items-center space-x-2 mt-2 md:mt-0">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span>All systems operational</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
