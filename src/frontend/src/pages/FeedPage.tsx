import { useState } from 'react';
import { useGetPosts, useSearchUsersByDisplayName, useGetFeedStoryViews } from '../hooks/useQueries';
import PostCard from '../components/posts/PostCard';
import UserSearchResultsPanel from '../components/feed/UserSearchResultsPanel';
import StoriesRow from '../components/stories/StoriesRow';
import StoryViewerDialog from '../components/stories/StoryViewerDialog';
import AddStoryDialog from '../components/stories/AddStoryDialog';
import { Loader2, Plus, Video, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function FeedPage() {
  const { data: posts, isLoading } = useGetPosts();
  const { data: storyViews = [] } = useGetFeedStoryViews();
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyViewerIndex, setStoryViewerIndex] = useState(0);
  const [addStoryOpen, setAddStoryOpen] = useState(false);

  const isAuthenticated = !!identity;

  // Search query hook
  const {
    data: searchResults = [],
    isLoading: isSearching,
    error: searchError,
  } = useSearchUsersByDisplayName(searchQuery);

  const handleSearch = () => {
    const trimmedInput = searchInput.trim();
    if (trimmedInput) {
      setSearchQuery(trimmedInput);
      setShowSearchResults(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCloseSearch = () => {
    setShowSearchResults(false);
    setSearchQuery('');
    setSearchInput('');
  };

  const handleViewStory = (index: number) => {
    setStoryViewerIndex(index);
    setStoryViewerOpen(true);
  };

  const handleAddStory = () => {
    setAddStoryOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Sort posts by timestamp descending (newest first)
  const sortedPosts = [...(posts || [])].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Stories Row */}
      {isAuthenticated && (
        <div className="bg-card rounded-lg border p-4">
          <StoriesRow onAddStory={handleAddStory} onViewStory={handleViewStory} />
        </div>
      )}

      {/* Header with Search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Community Feed</h2>
          {isAuthenticated && (
            <div className="flex gap-2">
              <Button onClick={() => navigate({ to: '/create' })} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
              <Button onClick={() => navigate({ to: '/create-reels' })} size="sm" variant="secondary">
                <Video className="w-4 h-4 mr-2" />
                Create Reels
              </Button>
            </div>
          )}
        </div>

        {/* Username Search - Only visible on Feed page */}
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Search by username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-9 text-sm"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleSearch}
            title="Search Users"
            className="flex-shrink-0"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Results Panel */}
      {showSearchResults && searchQuery && (
        <UserSearchResultsPanel
          results={searchResults}
          isLoading={isSearching}
          error={searchError}
          searchQuery={searchQuery}
          onClose={handleCloseSearch}
        />
      )}

      {sortedPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} postId={post.id} />
          ))}
        </div>
      )}

      {/* Story Viewer Dialog */}
      <StoryViewerDialog
        open={storyViewerOpen}
        onOpenChange={setStoryViewerOpen}
        stories={storyViews}
        initialIndex={storyViewerIndex}
      />

      {/* Add Story Dialog */}
      <AddStoryDialog open={addStoryOpen} onOpenChange={setAddStoryOpen} />
    </div>
  );
}
