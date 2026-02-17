import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import VerifiedBadge from './VerifiedBadge';
import TeacherBadge from './TeacherBadge';
import { cn } from '@/lib/utils';

interface VerifiedAvatarOverlayProps {
  avatarUrl?: string;
  displayName: string;
  verified: boolean;
  teacherBadge?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function VerifiedAvatarOverlay({
  avatarUrl,
  displayName,
  verified,
  teacherBadge = false,
  className,
  onClick,
}: VerifiedAvatarOverlayProps) {
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('relative inline-block', className)} onClick={onClick}>
      <Avatar className={cn('w-10 h-10', onClick && 'cursor-pointer')}>
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName} />
        ) : (
          <AvatarFallback>{initials}</AvatarFallback>
        )}
      </Avatar>
      {verified && (
        <div className="absolute bottom-0 right-0 translate-x-[15%] translate-y-[15%]">
          <VerifiedBadge className="w-4 h-4 ring-2 ring-background" />
        </div>
      )}
      {teacherBadge && (
        <div className="absolute top-0 right-0 translate-x-[15%] -translate-y-[15%]">
          <TeacherBadge className="w-4 h-4 ring-2 ring-background" />
        </div>
      )}
    </div>
  );
}
