import { useState, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Video, Loader2, X } from 'lucide-react';
import { useCreatePost } from '../hooks/useQueries';
import { ExternalBlob, PostMediaType } from '../backend';
import { toast } from 'sonner';
import { normalizeBackendError } from '../utils/backendErrors';

export default function CreateReelsPage() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video must be less than 100MB');
      return;
    }

    setVideoFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setVideoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error('Please select a video');
      return;
    }

    try {
      setUploadProgress(0);

      const arrayBuffer = await videoFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const mediaBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await createPost.mutateAsync({
        caption: caption.trim(),
        media: mediaBlob,
        mediaType: PostMediaType.video,
      });

      toast.success('Reel created successfully!');
      navigate({ to: '/reels' });
    } catch (error) {
      console.error('Create reel error:', error);
      toast.error(normalizeBackendError(error));
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Reel</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video Upload */}
            <div className="space-y-2">
              <Label>Video</Label>
              {!videoPreview ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Select Video
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <video src={videoPreview} controls className="w-full rounded-lg max-h-[500px]" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveVideo}
                    className="absolute top-2 right-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <Label htmlFor="caption">Caption (optional)</Label>
              <Textarea
                id="caption"
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
              />
            </div>

            {/* Upload Progress */}
            {createPost.isPending && uploadProgress > 0 && (
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
              <Button type="button" variant="outline" onClick={() => navigate({ to: '/reels' })}>
                Cancel
              </Button>
              <Button type="submit" disabled={!videoFile || createPost.isPending}>
                {createPost.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Reel'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
