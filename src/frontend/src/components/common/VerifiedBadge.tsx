import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  className?: string;
}

export default function VerifiedBadge({ className }: VerifiedBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-blue-500',
        'w-5 h-5',
        className
      )}
      aria-label="Verified"
      title="Verified"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-3 h-3"
      >
        <path
          d="M9 12L11 14L15 10"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
