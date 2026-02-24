import { cn } from '@/lib/utils/cn';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {children}
    </div>
  );
}
