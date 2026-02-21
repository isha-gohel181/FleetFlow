/**
 * Loading Spinner Component
 * Animated loading indicator with FleetFlow branding
 */
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ 
  size = 'default', 
  text = 'Loading...', 
  fullScreen = false,
  className 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn(
        'animate-spin text-purple-500',
        sizeClasses[size]
      )} />
      {text && (
        <span className="text-sm text-gray-400 animate-pulse">
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#0F172A] flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}
