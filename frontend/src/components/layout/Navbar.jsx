/**
 * Navbar Component
 * Top navigation bar with user profile
 */
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Menu } from 'lucide-react';

export default function Navbar({ onMenuClick, sidebarCollapsed }) {
  const { user } = useAuth();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-[#0F172A]/80 backdrop-blur-xl',
        'border-b border-white/10 z-30 transition-all duration-300',
        sidebarCollapsed ? 'left-20' : 'left-64'
      )}
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* Left - Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right - User Profile */}
        <div className="flex items-center gap-4 ml-auto">
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
