import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, UserCircle, Edit } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';

export default function ProfileMenu() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();

  if (!identity || !userProfile) return null;

  const currentUserId = identity.getPrincipal().toString();

  const handleViewProfile = () => {
    navigate({ to: '/profile/$userId', params: { userId: currentUserId } });
  };

  const handleEditProfile = () => {
    navigate({ to: '/profile/edit' });
  };

  const handleFollowers = () => {
    navigate({
      to: '/profile/$userId',
      params: { userId: currentUserId },
      search: { view: 'followers' },
    });
  };

  const handleFollowing = () => {
    navigate({
      to: '/profile/$userId',
      params: { userId: currentUserId },
      search: { view: 'following' },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Avatar className="w-7 h-7">
            {userProfile.publicProfile.avatar && (
              <AvatarImage
                src={userProfile.publicProfile.avatar.getDirectURL()}
                alt={userProfile.publicProfile.displayName}
              />
            )}
            <AvatarFallback className="text-xs">
              {userProfile.publicProfile.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{userProfile.publicProfile.displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleViewProfile}>
          <UserCircle className="w-4 h-4 mr-2" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEditProfile}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleFollowers}>
          <Users className="w-4 h-4 mr-2" />
          Followers
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleFollowing}>
          <Users className="w-4 h-4 mr-2" />
          Following
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
