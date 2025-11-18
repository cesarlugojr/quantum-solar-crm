'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Mail,
  UserCheck,
  BarChart3,
  Settings,
  Bell,
  LogOut
} from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/crm', icon: LayoutDashboard },
  { name: 'Leads', href: '/crm/leads', icon: Users },
  { name: 'Projects', href: '/crm/projects', icon: Briefcase },
  { name: 'Campaigns', href: '/crm/campaigns', icon: Mail },
  { name: 'Candidates', href: '/crm/candidates', icon: UserCheck },
  { name: 'Analytics', href: '/crm/analytics', icon: BarChart3 },
];

const secondaryNav: NavItem[] = [
  { name: 'Settings', href: '/crm/settings', icon: Settings },
];

export function CRMSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/crm') {
      return pathname === '/crm';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 border-r border-gray-800">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800 px-6">
        <Link href="/crm" className="flex items-center">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white tracking-tight">
              QUANTUM SOLAR
            </span>
            <span className="text-xs text-gray-400 tracking-wide">
              CRM Platform
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-gray-800 text-white border-l-4 border-[#ff0000] pl-2'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5 flex-shrink-0',
                  active ? 'text-[#ff0000]' : 'text-gray-400 group-hover:text-white'
                )} />
                <span>{item.name}</span>
                {item.badge && (
                  <span className="ml-auto inline-flex items-center justify-center rounded-full bg-[#ff0000] px-2 py-1 text-xs font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="mt-8 pt-8 border-t border-gray-800 space-y-1">
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-gray-800 text-white border-l-4 border-[#ff0000] pl-2'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5 flex-shrink-0',
                  active ? 'text-[#ff0000]' : 'text-gray-400 group-hover:text-white'
                )} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-10 w-10',
                userButtonPopoverCard: 'bg-gray-900 border border-gray-800',
                userButtonPopoverActionButton: 'text-gray-300 hover:text-white hover:bg-gray-800',
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              Team Member
            </p>
            <p className="text-xs text-gray-400 truncate">
              CRM Access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
