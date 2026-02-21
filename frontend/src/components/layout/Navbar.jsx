/**
 * Navbar Component
 * Top navigation bar with search and notifications
 */
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Search, Menu } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ onMenuClick, sidebarCollapsed }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-[#0F172A]/80 backdrop-blur-xl',
        'border-b border-white/10 z-30 transition-all duration-300',
        sidebarCollapsed ? 'left-20' : 'left-64'
      )}
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* Left - Search */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                'w-64 pl-10 pr-4 py-2 rounded-xl',
                'bg-white/5 border border-white/10',
                'text-white placeholder-gray-500',
                'focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50',
                'transition-all duration-200'
              )}
            />
          </div>
        </div>

        {/* Right - Notifications & User */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            className={cn(
              'relative p-2 rounded-xl',
              'text-gray-400 hover:text-white hover:bg-white/5',
              'transition-all duration-200'
            )}
          >
            <Bell className="w-5 h-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
