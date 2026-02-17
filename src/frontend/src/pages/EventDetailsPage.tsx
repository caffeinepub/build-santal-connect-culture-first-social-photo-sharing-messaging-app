import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, MapPin, Loader2, Plus } from 'lucide-react';
import { useGetEvent, useGetEventPosts } from '../hooks/useQueries';
import PostCard from '../components/posts/PostCard';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function EventDetailsPage() {
  const { eventName } = useParams({ from: '/event/$eventName' });
  const navigate = useNavigate();
  const decodedEventName = decodeURIComponent(eventName);
  const { data: event, isLoading: eventLoading } = useGetEvent(decodedEventName);
  const { data: eventPosts, isLoading: postsLoading } = useGetEventPosts(decodedEventName);
  const { identity } = useInternetIdentity();

  const isAuthenticated = !!identity;

  if (eventLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <p className="text-center text-muted-foreground">Event not found</p>
      </div>
    );
  }

  const eventDate = new Date(Number(event.date) / 1000000);
  const isUpcoming = eventDate > new Date();

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/events' })}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Events
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-2xl">{event.name}</CardTitle>
            {isUpcoming && (
              <span className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full">Upcoming</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="w-5 h-5" />
              <div>
                <p className="font-semibold text-foreground">{eventDate.toLocaleDateString('en-US', { dateStyle: 'full' })}</p>
                <p className="text-sm">{eventDate.toLocaleTimeString('en-US', { timeStyle: 'short' })}</p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <p className="font-semibold text-foreground">{event.location}</p>
              </div>
            )}
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed">{event.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Event Posts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Event Posts</h2>
          {isAuthenticated && (
            <Button
              onClick={() => navigate({ to: '/create', search: { eventName: decodedEventName } })}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          )}
        </div>

        {postsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : eventPosts && eventPosts.length > 0 ? (
          <div className="space-y-6">
            {eventPosts.map((post, index) => (
              <PostCard key={index} post={post} postId={index.toString()} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No posts for this event yet. Be the first to share!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
