import { useGetFeedStoryViews, useGetCallerUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Principal } from '@dfinity/principal';
import type { StoryView } from '../../backend';

interface StoriesRowProps {
  onAddStory: () => void;
  onViewStory: (storyIndex: number) => void;
}

export default function StoriesRow({ onAddStory, onViewStory }: StoriesRowProps) {
  const { identity } = useInternetIdentity();
  const { data: storyViews = [], isLoading } = useGetFeedStoryViews();
  const { data: currentProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentUserPrincipal = identity.getPrincipal().toString();

  // Separate viewer's stories and followed users' stories
  const viewerStories = storyViews.filter(
    (sv) => sv.story.author.toString() === currentUserPrincipal
  );
  const followedStories = storyViews.filter(
    (sv) => sv.story.author.toString() !== currentUserPrincipal
  );

  // Group stories by author
  const storyGroups = new Map<string, StoryView[]>();
  
  if (viewerStories.length > 0) {
    storyGroups.set(currentUserPrincipal, viewerStories);
  }

  followedStories.forEach((sv) => {
    const authorId = sv.story.author.toString();
    if (!storyGroups.has(authorId)) {
      storyGroups.set(authorId, []);
    }
    storyGroups.get(authorId)!.push(sv);
  });

  // Build ordered list: viewer first, then followed users
  const orderedGroups: Array<{ authorId: string; stories: StoryView[] }> = [];
  
  if (storyGroups.has(currentUserPrincipal)) {
    orderedGroups.push({
      authorId: currentUserPrincipal,
      stories: storyGroups.get(currentUserPrincipal)!,
    });
  }

  storyGroups.forEach((stories, authorId) => {
    if (authorId !== currentUserPrincipal) {
      orderedGroups.push({ authorId, stories });
    }
  });

  const handleStoryClick = (groupIndex: number) => {
    // Calculate the index of the first story in this group
    let storyIndex = 0;
    for (let i = 0; i < groupIndex; i++) {
      storyIndex += orderedGroups[i].stories.length;
    }
    onViewStory(storyIndex);
  };

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-4 px-1">
        {/* Add Story Button (viewer's own circle) */}
        <button
          onClick={onAddStory}
          className="flex-shrink-0 flex flex-col items-center gap-1 group"
        >
          <div className="relative">
            <Avatar className="w-16 h-16 ring-2 ring-primary">
              {currentProfile?.publicProfile.avatar ? (
                <AvatarImage
                  src={currentProfile.publicProfile.avatar.getDirectURL()}
                  alt="Your story"
                />
              ) : (
                <AvatarFallback>
                  {currentProfile?.publicProfile.displayName?.charAt(0).toUpperCase() || 'Y'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center ring-2 ring-background">
              <Plus className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>
          <span className="text-xs font-medium max-w-[64px] truncate">Your Story</span>
        </button>

        {/* Story Circles for followed users */}
        {orderedGroups.map((group, groupIndex) => {
          if (group.authorId === currentUserPrincipal) return null;
          
          const firstStory = group.stories[0];
          const profile = firstStory.authorProfile;
          const hasMultiple = group.stories.length > 1;

          return (
            <button
              key={group.authorId}
              onClick={() => handleStoryClick(groupIndex)}
              className="flex-shrink-0 flex flex-col items-center gap-1 group"
            >
              <div className="relative">
                <Avatar
                  className={cn(
                    'w-16 h-16 ring-2',
                    'ring-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500'
                  )}
                >
                  {profile.avatar ? (
                    <AvatarImage
                      src={profile.avatar.getDirectURL()}
                      alt={profile.displayName}
                    />
                  ) : (
                    <AvatarFallback>
                      {profile.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                {hasMultiple && (
                  <div className="absolute top-0 right-0 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-bold text-primary-foreground ring-2 ring-background">
                    {group.stories.length}
                  </div>
                )}
              </div>
              <span className="text-xs font-medium max-w-[64px] truncate">
                {profile.displayName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
