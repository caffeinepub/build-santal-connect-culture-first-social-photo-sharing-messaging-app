import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PostView } from '../../backend';
import { PostMediaType } from '../../backend';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useLikePost, useUnlikePost, useGetUserPublicProfile, useIsCallerAdmin } from '../../hooks/useQueries';
import CommentsPanel from './CommentsPanel';
import UnicodeText from './UnicodeText';
import VerifiedAvatarOverlay from '../common/VerifiedAvatarOverlay';
import VerifiedBadge from '../common/VerifiedBadge';
import TeacherBadge from '../common/TeacherBadge';
import DeletePostDialog from './DeletePostDialog';
import { toast } from 'sonner';
import { normalizeBackendError } from '../../utils/backendErrors';

interface PostCardProps {
  post: PostView;
  postId: string;
}

export default function PostCard({ post, postId }: PostCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [showComments, setShowComments] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: authorPublicProfile, isLoading: profileLoading } = useGetUserPublicProfile(post.author);
  const { data: isAdmin } = useIsCallerAdmin();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();

  const currentUserPrincipal = identity?.getPrincipal().toString();
  const isLiked = currentUserPrincipal ? post.likes.some((p) => p.toString() === currentUserPrincipal) : false;
  
  // Show verified badge based on author public profile's verified field
  const isVerified = authorPublicProfile?.verified === true;
  const hasTeacherBadge = authorPublicProfile?.teacherBadge === true;

  // Check if current user can delete this post (author or admin)
  const canDelete = currentUserPrincipal && (
    post.author.toString() === currentUserPrincipal || isAdmin === true
  );

  const handleLikeToggle = async () => {
    if (!identity) {
      toast.error('Please log in to like posts');
      return;
    }

    try {
      if (isLiked) {
        await unlikePost.mutateAsync(postId);
      } else {
        await likePost.mutateAsync(postId);
      }
    } catch (error) {
      console.error('Like toggle error:', error);
      toast.error(normalizeBackendError(error));
    }
  };

  const handleAuthorClick = () => {
    navigate({ to: '/profile/$userId', params: { userId: post.author.toString() } });
  };

  const mediaUrl = post.media?.getDirectURL();
  const avatarUrl = authorPublicProfile?.avatar?.getDirectURL();
  
  // Only show "Unknown User" if profile has loaded and is null, not while loading
  const displayName = profileLoading ? '...' : (authorPublicProfile?.displayName || 'Unknown User');

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Post Header */}
          <div className="p-4 flex items-center gap-3">
            <VerifiedAvatarOverlay
              avatarUrl={avatarUrl}
              displayName={displayName}
              verified={!profileLoading && isVerified}
              teacherBadge={!profileLoading && hasTeacherBadge}
              onClick={handleAuthorClick}
            />
            <div className="flex-1">
              <button onClick={handleAuthorClick} className="font-semibold hover:underline flex items-center gap-1.5">
                <UnicodeText text={displayName} />
                {!profileLoading && isVerified && <VerifiedBadge className="w-4 h-4" />}
                {!profileLoading && hasTeacherBadge && <TeacherBadge className="w-4 h-4" />}
              </button>
              <p className="text-xs text-muted-foreground">
                {new Date(Number(post.timestamp) / 1000000).toLocaleDateString()}
              </p>
            </div>
            {/* Delete Button */}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
                className="text-muted-foreground hover:text-destructive"
                title="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Post Media */}
          {mediaUrl && (
            <div className="w-full bg-muted">
              {post.mediaType === PostMediaType.image ? (
                <img src={mediaUrl} alt="Post content" className="w-full h-auto object-cover max-h-[600px]" />
              ) : (
                <video src={mediaUrl} controls className="w-full h-auto max-h-[600px]" />
              )}
            </div>
          )}

          {/* Post Actions */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeToggle}
                disabled={likePost.isPending || unlikePost.isPending}
                className="gap-2"
              >
                <Heart className={cn('w-5 h-5', isLiked && 'fill-red-500 text-red-500')} />
                <span>{post.likes.length}</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="gap-2">
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments.length}</span>
              </Button>
            </div>

            {/* Caption */}
            {post.caption && (
              <div className="text-sm">
                <span className="font-semibold mr-2">{displayName}</span>
                <UnicodeText text={post.caption} />
              </div>
            )}

            {/* Comments Section */}
            {showComments && <CommentsPanel postId={postId} comments={post.comments} />}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeletePostDialog
        postId={postId}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
