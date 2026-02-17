import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Video, Loader2, X } from 'lucide-react';
import { useCreatePost, useAdminAddPostToChannel, useCreateEventPost } from '../hooks/useQueries';
import { ExternalBlob, PostMediaType } from '../backend';
import { HIGHLIGHT_CHANNELS } from '../config/highlights';
import { toast } from 'sonner';
import { normalizeBackendError } from '../utils/backendErrors';

const CLEAR_SELECTION = '__CLEAR__';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { channel?: string; eventName?: string };
  
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<PostMediaType>(PostMediaType.image);
  const [selectedChannel, setSelectedChannel] = useState<string | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();
  const createEventPost = useCreateEventPost();
  const addToChannel = useAdminAddPostToChannel();

  const eventName = search.eventName;
  const isEventPost = !!eventName;

  // Preselect channel from URL if provided
  useEffect(() => {
    if (search.channel) {
      // Try to match by channel id first, then by name
      const matchedChannel = HIGHLIGHT_CHANNELS.find(
        (ch) => ch.id === search.channel || ch.name === search.channel
      );
      if (matchedChannel) {
        setSelectedChannel(matchedChannel.name);
      }
    }
  }, [search.channel]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File must be less than 50MB');
      return;
    }

    setMediaFile(file);
    setMediaType(isImage ? PostMediaType.image : PostMediaType.video);

    const reader = new FileReader();
    reader.onload = (e) => {
      setMediaPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChannelChange = (value: string) => {
    if (value === CLEAR_SELECTION) {
      setSelectedChannel(undefined);
    } else {
      setSelectedChannel(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!caption.trim() && !mediaFile) {
      toast.error('Please add a caption or media');
      return;
    }

    try {
      setUploadProgress(0);

      let mediaBlob: ExternalBlob | null = null;

      if (mediaFile) {
        const arrayBuffer = await mediaFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        mediaBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      }

      if (isEventPost && eventName) {
        // Create event-associated post
        await createEventPost.mutateAsync({
          eventName,
          caption: caption.trim(),
          media: mediaBlob,
          mediaType: mediaType,
        });
        toast.success('Event post created successfully!');
        navigate({ to: '/event/$eventName', params: { eventName } });
      } else {
        // Create regular post
        const postId = await createPost.mutateAsync({
          caption: caption.trim(),
          media: mediaBlob,
          mediaType: mediaType,
        });

        // If a channel is selected, add the post to that channel
        if (selectedChannel) {
          try {
            await addToChannel.mutateAsync({
              channelName: selectedChannel,
              postId,
            });
          } catch (error) {
            console.error('Failed to add post to channel:', error);
            // Don't fail the whole operation if channel assignment fails
          }
        }

        toast.success('Post created successfully!');
        navigate({ to: '/' });
      }
    } catch (error) {
      console.error('Create post error:', error);
      toast.error(normalizeBackendError(error));
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEventPost ? `Create Event Post for ${eventName}` : 'Create Post'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Textarea
                id="caption"
                placeholder="What's on your mind?"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
              />
            </div>

            {/* Media Upload */}
            <div className="space-y-2">
              <Label>Media (optional)</Label>
              {!mediaPreview ? (
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Add Video
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  {mediaType === PostMediaType.image ? (
                    <img src={mediaPreview} alt="Preview" className="w-full rounded-lg" />
                  ) : (
                    <video src={mediaPreview} controls className="w-full rounded-lg" />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveMedia}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Channel Selection (only for non-event posts) */}
            {!isEventPost && (
              <div className="space-y-2">
                <Label htmlFor="channel">Channel (optional)</Label>
                <Select value={selectedChannel || CLEAR_SELECTION} onValueChange={handleChannelChange}>
                  <SelectTrigger id="channel">
                    <SelectValue placeholder="Select a channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CLEAR_SELECTION}>None</SelectItem>
                    {HIGHLIGHT_CHANNELS.map((channel) => (
                      <SelectItem key={channel.id} value={channel.name}>
                        {channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Upload Progress */}
            {(createPost.isPending || createEventPost.isPending) && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/' })}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPost.isPending || createEventPost.isPending}>
                {createPost.isPending || createEventPost.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Post'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
