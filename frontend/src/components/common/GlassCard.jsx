/**
 * Glass Card Component
 * Reusable glassmorphism card with FleetFlow styling
 */
import { cn } from '@/lib/utils';

export default function GlassCard({
  children,
  className,
  hover = true,
  padding = true,
  ...props
}) {
  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl',
        'shadow-[0_10px_30px_rgba(0,0,0,0.4)]',
        hover && 'transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
