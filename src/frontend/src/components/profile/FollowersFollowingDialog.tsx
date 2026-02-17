import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Users } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { Principal } from '@dfinity/principal';
import { useGetFollowers, useGetFollowing, useGetUserPublicProfiles } from '../../hooks/useQueries';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FollowersFollowingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetPrincipal: Principal;
  mode: 'followers' | 'following';
}

export default function FollowersFollowingDialog({
  open,
  onOpenChange,
  targetPrincipal,
  mode,
}: FollowersFollowingDialogProps) {
  const navigate = useNavigate();

  const { data: followers, isLoading: followersLoading } = useGetFollowers(
    mode === 'followers' ? targetPrincipal : null
  );
  const { data: following, isLoading: followingLoading } = useGetFollowing(
    mode === 'following' ? targetPrincipal : null
  );

  const principals = mode === 'followers' ? followers || [] : following || [];
  const { data: profiles, isLoading: profilesLoading } = useGetUserPublicProfiles(principals);

  const isLoading = followersLoading || followingLoading || profilesLoading;

  const handleUserClick = (userId: string) => {
    onOpenChange(false);
    navigate({ to: '/profile/$userId', params: { userId } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {mode === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : principals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {mode === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </div>
          ) : (
            <div className="space-y-2">
              {principals.map((principal) => {
                const principalStr = principal.toString();
                const profile = profiles?.[principalStr];

                return (
                  <button
                    key={principalStr}
                    onClick={() => handleUserClick(principalStr)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <Avatar className="w-10 h-10">
                      {profile?.avatar && (
                        <AvatarImage
                          src={profile.avatar.getDirectURL()}
                          alt={profile.displayName}
                        />
                      )}
                      <AvatarFallback>
                        {profile?.displayName?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {profile?.displayName || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {principalStr}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
