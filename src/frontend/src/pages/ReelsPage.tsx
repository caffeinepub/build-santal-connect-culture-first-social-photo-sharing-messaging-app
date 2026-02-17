import { useEffect, useRef } from 'react';
import { useGetPosts } from '../hooks/useQueries';
import { PostMediaType, type PostView } from '../backend';
import { Loader2, Heart, MessageCircle, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from '@tanstack/react-router';
import { useReelsAutoplay } from '../hooks/useReelsAutoplay';
import { useState } from 'react';
import { useGetUserPublicProfile } from '../hooks/useQueries';

function ReelCard({ reel, isActive }: { reel: PostView; isActive: boolean }) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const { data: authorProfile } = useGetUserPublicProfile(reel.author);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      videoRef.current.play().catch(console.error);
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const handleAuthorClick = () => {
    navigate({ to: '/profile/$userId', params: { userId: reel.author.toString() } });
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const displayName = authorProfile?.displayName || 'Unknown User';
  const avatarUrl = authorProfile?.avatar?.getDirectURL();
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative w-full h-screen snap-start snap-always bg-black flex items-center justify-center">
      {reel.media && (
        <video
          ref={videoRef}
          src={reel.media.getDirectURL()}
          className="w-full h-full object-contain"
          loop
          muted={isMuted}
          playsInline
        />
      )}

      {/* Overlay Controls */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Author Info - Top Left */}
        <div className="absolute top-4 left-4 flex items-center gap-3 pointer-events-auto">
          <Avatar className="w-10 h-10 cursor-pointer" onClick={handleAuthorClick}>
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={displayName} />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <button onClick={handleAuthorClick} className="font-semibold text-white hover:underline">
            {displayName}
          </button>
        </div>

        {/* Mute Toggle - Top Right */}
        <div className="absolute top-4 right-4 pointer-events-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>

        {/* Stats - Bottom Left */}
        <div className="absolute bottom-20 left-4 text-white space-y-2">
          {reel.caption && (
            <p className="text-sm max-w-xs line-clamp-3 bg-black/50 p-2 rounded">{reel.caption}</p>
          )}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Heart className="w-5 h-5" />
              <span>{reel.likes.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-5 h-5" />
              <span>{reel.comments.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReelsPage() {
  const { data: posts, isLoading } = useGetPosts();
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter only video posts
  const reels = posts?.filter((post) => post.mediaType === PostMediaType.video) || [];
  
  const { activeIndex } = useReelsAutoplay(reels.length, containerRef);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No reels available yet</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-screen overflow-y-scroll snap-y snap-mandatory">
      {reels.map((reel, index) => (
        <div key={reel.id} data-index={index}>
          <ReelCard reel={reel} isActive={index === activeIndex} />
        </div>
      ))}
    </div>
  );
}
