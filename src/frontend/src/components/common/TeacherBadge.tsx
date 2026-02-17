import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

interface TeacherBadgeProps {
  className?: string;
}

export default function TeacherBadge({ className }: TeacherBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-red-500',
        'w-5 h-5',
        className
      )}
      aria-label="Teacher"
      title="Teacher"
    >
      <BookOpen className="w-3 h-3 text-white" strokeWidth={2.5} />
    </div>
  );
}
