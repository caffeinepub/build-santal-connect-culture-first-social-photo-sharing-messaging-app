import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2 } from 'lucide-react';
import { useAddComment, useGetUserPublicProfile } from '../../hooks/useQueries';
import type { Comment } from '../../backend';
import UnicodeText from './UnicodeText';
import { toast } from 'sonner';
import { normalizeBackendError } from '../../utils/backendErrors';

interface CommentsPanelProps {
  postId: string;
  comments: Comment[];
}

export default function CommentsPanel({ postId, comments }: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const addComment = useAddComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      await addComment.mutateAsync({ postId, content: newComment.trim() });
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Add comment error:', error);
      toast.error(normalizeBackendError(error));
    }
  };

  return (
    <div className="space-y-4 pt-3 border-t border-border">
      {/* Comments List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.map((comment, index) => (
          <CommentItem key={index} comment={comment} />
        ))}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="resize-none"
        />
        <Button type="submit" size="icon" disabled={addComment.isPending || !newComment.trim()}>
          {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}

function CommentItem({ comment }: { comment: Comment }) {
  const navigate = useNavigate();
  const { data: authorPublicProfile } = useGetUserPublicProfile(comment.author);

  const avatarUrl = authorPublicProfile?.avatar?.getDirectURL();
  const authorName = authorPublicProfile?.displayName || 'Anonymous';
  const initials = authorName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleAuthorClick = () => {
    navigate({ to: '/profile/$userId', params: { userId: comment.author.toString() } });
  };

  return (
    <div className="flex gap-2">
      <button onClick={handleAuthorClick} className="flex-shrink-0">
        <Avatar className="w-8 h-8">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={authorName} /> : <AvatarFallback>{initials}</AvatarFallback>}
        </Avatar>
      </button>
      <div className="flex-1 min-w-0">
        <div className="bg-muted rounded-lg px-3 py-2">
          <button onClick={handleAuthorClick} className="font-semibold text-sm hover:underline">
            {authorName}
          </button>
          <div className="text-sm mt-1">
            <UnicodeText text={comment.content} />
          </div>
        </div>
      </div>
    </div>
  );
}
