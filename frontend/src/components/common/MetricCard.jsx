/**
 * Metric Card Component
 * Displays KPI metrics with optional trend indicator
 * 
 * Variants:
 * - primary: Purple gradient (for hero card)
 * - glass: Glassmorphism style (for secondary cards)
 */
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon: Icon,
  variant = 'glass',
  className
}) {
  const isPositiveTrend = trend === 'up';
  
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]',
        variant === 'primary' 
          ? 'bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white shadow-lg shadow-purple-500/25'
          : 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.4)]',
        className
      )}
    >
      {/* Background decoration for primary variant */}
      {variant === 'primary' && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      )}
      
      <div className="relative z-10">
        {/* Header with icon */}
        <div className="flex items-center justify-between mb-4">
          <span className={cn(
            'text-sm font-medium',
            variant === 'primary' ? 'text-white/80' : 'text-gray-400'
          )}>
            {title}
          </span>
          {Icon && (
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center',
              variant === 'primary' 
                ? 'bg-white/20' 
                : 'bg-purple-500/20'
            )}>
              <Icon className={cn(
                'w-5 h-5',
                variant === 'primary' ? 'text-white' : 'text-purple-400'
              )} />
            </div>
          )}
        </div>
        
        {/* Value */}
        <div className="mb-2">
          <span className={cn(
            'text-3xl font-bold',
            variant === 'primary' ? 'text-white' : 'text-white'
          )}>
            {value}
          </span>
        </div>
        
        {/* Subtitle and Trend */}
        <div className="flex items-center justify-between">
          {subtitle && (
            <span className={cn(
              'text-sm',
              variant === 'primary' ? 'text-white/70' : 'text-gray-500'
            )}>
              {subtitle}
            </span>
          )}
          
          {trendValue && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              isPositiveTrend 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            )}>
              {isPositiveTrend ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trendValue}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
