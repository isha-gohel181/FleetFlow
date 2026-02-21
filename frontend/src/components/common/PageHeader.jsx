/**
 * Page Header Component
 * Consistent header for all pages
 */
import { cn } from '@/lib/utils';

export default function PageHeader({
  title,
  description,
  action,
  className
}) {
  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8',
      className
    )}>
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && (
          <p className="text-gray-400 mt-1">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
