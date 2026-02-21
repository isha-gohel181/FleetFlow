/**
 * Sidebar Component
 * Main navigation sidebar with FleetFlow branding
 */
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

// Navigation items with role-based access
const navItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    roles: ['FleetManager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst']
  },
  {
    name: 'Vehicles',
    path: '/vehicles',
    icon: Truck,
    roles: ['FleetManager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst']
  },
  {
    name: 'Drivers',
    path: '/drivers',
    icon: Users,
    roles: ['FleetManager', 'Dispatcher', 'SafetyOfficer']
  },
  {
    name: 'Trips',
    path: '/trips',
    icon: Route,
    roles: ['FleetManager', 'Dispatcher', 'SafetyOfficer', 'FinancialAnalyst']
  },
  {
    name: 'Maintenance',
    path: '/maintenance',
    icon: Wrench,
    roles: ['FleetManager', 'SafetyOfficer', 'FinancialAnalyst']
  },
  {
    name: 'Fuel Logs',
    path: '/fuel',
    icon: Fuel,
    roles: ['FleetManager', 'Dispatcher', 'FinancialAnalyst']
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
    roles: ['FleetManager', 'FinancialAnalyst']
  }
];

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => hasRole(item.roles));

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-[#111827] border-r border-white/10',
        'flex flex-col transition-all duration-300 z-40',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FleetFlow</span>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                'hover:bg-white/5',
                isActive
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-400 hover:text-white'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', collapsed && 'mx-auto')} />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <span className="text-purple-400 font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-3 rounded-xl',
            'text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={cn(
          'absolute -right-3 top-20 w-6 h-6 rounded-full',
          'bg-[#7C3AED] text-white flex items-center justify-center',
          'hover:bg-[#6D28D9] transition-colors shadow-lg'
        )}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
}
