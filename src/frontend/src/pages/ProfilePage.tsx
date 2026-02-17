import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Edit2, Loader2, MapPin, Phone, UserPlus, UserMinus } from 'lucide-react';
import { useGetUserProfile, useGetCallerUserProfile, useGetPosts, useIsCallerAdmin, useIsFollowing, useFollowUser, useUnfollowUser, useGetUserPublicProfile, useGetFollowers, useGetFollowing } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import PostCard from '../components/posts/PostCard';
import VerifiedAvatarOverlay from '../components/common/VerifiedAvatarOverlay';
import VerifiedBadge from '../components/common/VerifiedBadge';
import TeacherBadge from '../components/common/TeacherBadge';
import FollowersFollowingDialog from '../components/profile/FollowersFollowingDialog';
import { toast } from 'sonner';
import { UserType } from '../backend';
import { normalizeBackendError } from '../utils/backendErrors';

export default function ProfilePage() {
  const { userId } = useParams({ from: '/profile/$userId' });
  const search = useSearch({ from: '/profile/$userId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'followers' | 'following'>('followers');

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isOwnProfile = userId === currentUserPrincipal;
  const targetPrincipal = Principal.fromText(userId);

  const { data: viewedProfile, isLoading: viewedLoading } = useGetUserProfile(targetPrincipal);
  const { data: viewedPublicProfile } = useGetUserPublicProfile(targetPrincipal);
  const { data: currentProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: allPosts } = useGetPosts();
  const { data: isFollowing, isLoading: followStatusLoading } = useIsFollowing(isOwnProfile ? null : targetPrincipal);
  const { data: followers } = useGetFollowers(targetPrincipal);
  const { data: following } = useGetFollowing(targetPrincipal);
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const profile = isOwnProfile ? currentProfile : viewedProfile;
  const publicProfile = viewedPublicProfile;

  // Determine if we can view private fields (name, phone, country code)
  const canViewPrivateFields = isOwnProfile || isAdmin;

  // Handle deep-link from ProfileMenu
  useEffect(() => {
    const view = (search as any)?.view;
    if (view === 'followers') {
      setDialogMode('followers');
      setDialogOpen(true);
    } else if (view === 'following') {
      setDialogMode('following');
      setDialogOpen(true);
    }
  }, [search]);

  const handleEditProfile = () => {
    navigate({ to: '/profile/edit' });
  };

  const handleMessageUser = () => {
    navigate({ to: '/chat/$userId', params: { userId } });
  };

  const handleFollowToggle = async () => {
    if (!identity) {
      toast.error('Please log in to follow users');
      return;
    }

    try {
      if (isFollowing) {
        await unfollowUser.mutateAsync(targetPrincipal);
        toast.success('Unfollowed successfully');
      } else {
        await followUser.mutateAsync(targetPrincipal);
        toast.success('Followed successfully');
      }
    } catch (error) {
      console.error('Follow toggle error:', error);
      toast.error(normalizeBackendError(error));
    }
  };

  const handleOpenFollowers = () => {
    setDialogMode('followers');
    setDialogOpen(true);
  };

  const handleOpenFollowing = () => {
    setDialogMode('following');
    setDialogOpen(true);
  };

  if (viewedLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile && !publicProfile) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">User profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userPosts = allPosts?.filter(post => post.author.toString() === userId) || [];
  const displayProfile = profile || { publicProfile };
  const avatarUrl = displayProfile.publicProfile?.avatar?.getDirectURL();
  const displayName = canViewPrivateFields && profile ? profile.publicProfile.displayName : (publicProfile?.displayName || 'User');
  const isVerified = displayProfile.publicProfile?.verified === true;
  const hasTeacherBadge = displayProfile.publicProfile?.teacherBadge === true;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <VerifiedAvatarOverlay
                avatarUrl={avatarUrl}
                displayName={displayName}
                verified={isVerified}
                teacherBadge={hasTeacherBadge}
                className="w-20 h-20"
              />
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{displayName}</CardTitle>
                  {isVerified && <VerifiedBadge />}
                  {hasTeacherBadge && <TeacherBadge />}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {userId}
                </p>
                {/* Followers/Following counts */}
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={handleOpenFollowers}
                    className="text-sm hover:underline"
                  >
                    <span className="font-semibold">{followers?.length || 0}</span>{' '}
                    <span className="text-muted-foreground">Followers</span>
                  </button>
                  <button
                    onClick={handleOpenFollowing}
                    className="text-sm hover:underline"
                  >
                    <span className="font-semibold">{following?.length || 0}</span>{' '}
                    <span className="text-muted-foreground">Following</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button variant="outline" size="sm" onClick={handleEditProfile}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button size="sm" onClick={handleMessageUser}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  {identity && (
                    <Button
                      size="sm"
                      variant={isFollowing ? "outline" : "default"}
                      onClick={handleFollowToggle}
                      disabled={followUser.isPending || unfollowUser.isPending || followStatusLoading}
                    >
                      {followUser.isPending || unfollowUser.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : isFollowing ? (
                        <UserMinus className="w-4 h-4 mr-2" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayProfile.publicProfile?.bio && (
            <div>
              <p className="text-sm text-muted-foreground">{displayProfile.publicProfile.bio}</p>
            </div>
          )}

          {canViewPrivateFields && profile && (
            <>
              {profile.publicProfile.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.publicProfile.location}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{profile.countryCode} {profile.phone}</span>
              </div>
            </>
          )}

          {displayProfile.publicProfile?.userType === UserType.creator && (
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Creator</Badge>
              {displayProfile.publicProfile.musicianTag && <Badge variant="outline">Musician</Badge>}
              {displayProfile.publicProfile.painterTag && <Badge variant="outline">Painter</Badge>}
              {displayProfile.publicProfile.influencerTag && <Badge variant="outline">Influencer</Badge>}
              {displayProfile.publicProfile.dancerTag && <Badge variant="outline">Dancer</Badge>}
              {displayProfile.publicProfile.singerTag && <Badge variant="outline">Singer</Badge>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Posts */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Posts ({userPosts.length})</h2>
        {userPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No posts yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} postId={post.id} />
            ))}
          </div>
        )}
      </div>

      {/* Followers/Following Dialog */}
      <FollowersFollowingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        targetPrincipal={targetPrincipal}
        mode={dialogMode}
      />
    </div>
  );
}
