import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Calendar, BookOpen, Tag, Users } from 'lucide-react';
import { toast } from 'sonner';
import RequireAdmin from '../components/admin/RequireAdmin';
import AdminUsersPanel from '../components/admin/AdminUsersPanel';
import EventForm from '../components/events/EventForm';
import { useAdminAddEvent, useAdminAddLesson, useAdminAddPostToChannel } from '../hooks/useQueries';

export default function AdminPage() {
  return (
    <RequireAdmin>
      <AdminContent />
    </RequireAdmin>
  );
}

function AdminContent() {
  const addEvent = useAdminAddEvent();
  const addLesson = useAdminAddLesson();
  const addToChannel = useAdminAddPostToChannel();

  // Lesson form state
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);

  // Channel assignment state
  const [channelName, setChannelName] = useState('');
  const [postId, setPostId] = useState('');
  const [isSubmittingChannel, setIsSubmittingChannel] = useState(false);

  const handleAddEvent = async (data: {
    name: string;
    date: Date;
    description: string;
    location: string;
  }) => {
    try {
      const dateInNanoseconds = BigInt(data.date.getTime()) * BigInt(1000000);
      await addEvent.mutateAsync({
        name: data.name,
        date: dateInNanoseconds,
        description: data.description,
        location: data.location || null,
      });
      toast.success('Event created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event');
      throw error;
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!lessonTitle.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    if (!lessonContent.trim()) {
      toast.error('Lesson content is required');
      return;
    }

    setIsSubmittingLesson(true);
    try {
      await addLesson.mutateAsync({
        title: lessonTitle.trim(),
        content: lessonContent.trim(),
        media: null,
      });
      toast.success('Lesson created successfully!');
      setLessonTitle('');
      setLessonContent('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create lesson');
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  const handleAddToChannel = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!channelName.trim()) {
      toast.error('Channel name is required');
      return;
    }

    if (!postId.trim()) {
      toast.error('Post ID is required');
      return;
    }

    setIsSubmittingChannel(true);
    try {
      await addToChannel.mutateAsync({
        channelName: channelName.trim(),
        postId: postId.trim(),
      });
      toast.success('Post added to channel successfully!');
      setChannelName('');
      setPostId('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add post to channel');
    } finally {
      setIsSubmittingChannel(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage events, lessons, content, and users</p>
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">
            <Calendar className="w-4 h-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="lessons">
            <BookOpen className="w-4 h-4 mr-2" />
            Lessons
          </TabsTrigger>
          <TabsTrigger value="channels">
            <Tag className="w-4 h-4 mr-2" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Event</CardTitle>
              <CardDescription>Create a new community event</CardDescription>
            </CardHeader>
            <CardContent>
              <EventForm onSubmit={handleAddEvent} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Lesson</CardTitle>
              <CardDescription>Create a new Ol Chiki lesson</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddLesson} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lessonTitle">Lesson Title</Label>
                  <Input
                    id="lessonTitle"
                    placeholder="e.g., Basic Greetings"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lessonContent">Lesson Content</Label>
                  <Textarea
                    id="lessonContent"
                    placeholder="Enter the lesson content..."
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    rows={6}
                    required
                  />
                </div>

                <Button type="submit" disabled={isSubmittingLesson} className="w-full">
                  {isSubmittingLesson ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Lesson'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Post to Channel</CardTitle>
              <CardDescription>Assign a post to a Highlights channel</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddToChannel} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="channelName">Channel Name</Label>
                  <Input
                    id="channelName"
                    placeholder="e.g., Art & Craft"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postId">Post ID</Label>
                  <Input
                    id="postId"
                    placeholder="Enter post ID"
                    value={postId}
                    onChange={(e) => setPostId(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" disabled={isSubmittingChannel} className="w-full">
                  {isSubmittingChannel ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add to Channel'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <AdminUsersPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
