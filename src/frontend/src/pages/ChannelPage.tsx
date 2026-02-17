import { useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { useGetChannelPosts } from '../hooks/useQueries';
import { HIGHLIGHT_CHANNELS } from '../config/highlights';
import PostCard from '../components/posts/PostCard';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function ChannelPage() {
  const { channelId } = useParams({ from: '/channel/$channelId' });
  const navigate = useNavigate();
  const { data: posts, isLoading } = useGetChannelPosts(channelId);
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;
  const channel = HIGHLIGHT_CHANNELS.find((c) => c.id === channelId);

  if (!channel) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <p className="text-center text-muted-foreground">Channel not found</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/highlights' })}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">{channel.icon}</span>
            {channel.name}
          </h1>
          <p className="text-muted-foreground">{channel.description}</p>
        </div>
        {isAuthenticated && (
          <Button
            onClick={() => navigate({ to: '/create', search: { channel: channel.name } })}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        )}
      </div>

      {/* Posts */}
      {posts && posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts in this channel yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts?.map((post, index) => (
            <PostCard key={index} post={post} postId={index.toString()} />
          ))}
        </div>
      )}
    </div>
  );
}
