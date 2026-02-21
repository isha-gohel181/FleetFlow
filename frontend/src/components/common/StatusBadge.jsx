/**
 * Status Badge Component
 * Displays status with appropriate color coding
 * 
 * Status Colors (from FleetFlow design system):
 * - Available: Green (#22C55E)
 * - OnTrip: Blue (#3B82F6)
 * - InShop: Red (#EF4444)
 * - Retired: Gray (#6B7280)
 * - OnDuty: Blue (#3B82F6)
 * - Suspended: Red (#EF4444)
 * - Draft: Gray (#6B7280)
 * - Dispatched: Blue (#3B82F6)
 * - Completed: Green (#22C55E)
 * - Cancelled: Red (#EF4444)
 */
import { cn } from '@/lib/utils';

const statusConfig = {
  // Vehicle statuses
  Available: { bg: 'bg-green-500', text: 'text-white', label: 'Available' },
  OnTrip: { bg: 'bg-blue-500', text: 'text-white', label: 'On Trip' },
  InShop: { bg: 'bg-red-500', text: 'text-white', label: 'In Shop' },
  Retired: { bg: 'bg-gray-500', text: 'text-white', label: 'Retired' },
  
  // Driver statuses
  OnDuty: { bg: 'bg-blue-500', text: 'text-white', label: 'On Duty' },
  Suspended: { bg: 'bg-red-500', text: 'text-white', label: 'Suspended' },
  'Taking a Break': { bg: 'bg-amber-500', text: 'text-white', label: 'Taking a Break' },
  
  // Trip statuses
  Draft: { bg: 'bg-gray-500', text: 'text-white', label: 'Draft' },
  Dispatched: { bg: 'bg-blue-500', text: 'text-white', label: 'Dispatched' },
  Completed: { bg: 'bg-green-500', text: 'text-white', label: 'Completed' },
  Cancelled: { bg: 'bg-red-500', text: 'text-white', label: 'Cancelled' },
  
  // Warning
  Warning: { bg: 'bg-amber-500', text: 'text-white', label: 'Warning' }
};

export default function StatusBadge({ status, className }) {
  const config = statusConfig[status] || statusConfig.Draft;
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.bg,
        config.text,
        className
      )}
    >
      {config.label}
    </span>
  );
}
