import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Sparkles, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { useCreateStory } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { ExternalBlob, PostMediaType } from '../../backend';
import { toast } from 'sonner';
import { normalizeBackendError } from '../../utils/backendErrors';

interface AddStoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddStoryDialog({ open, onOpenChange }: AddStoryDialogProps) {
  const { identity } = useInternetIdentity();
  const createStory = useCreateStory();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isAuthenticated = !!identity;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type (images only for stories)
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to create a story');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await createStory.mutateAsync({
        content: blob,
        mediaType: PostMediaType.image,
      });

      toast.success('Story created successfully!');
      onOpenChange(false);
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Story creation error:', error);
      toast.error(normalizeBackendError(error));
    }
  };

  const handleClose = () => {
    if (!createStory.isPending) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      onOpenChange(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              Please log in to create a story
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Add Story
          </DialogTitle>
          <DialogDescription>
            Share a moment with your community (expires in 24 hours)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="story-image">Story Image</Label>
            <div className="flex items-center gap-2">
              <Input
                id="story-image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={createStory.isPending}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => document.getElementById('story-image')?.click()}
                disabled={createStory.isPending}
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="relative w-full aspect-[9/16] max-h-[400px] bg-muted rounded-lg overflow-hidden">
              <img
                src={previewUrl}
                alt="Story preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Upload Progress */}
          {createStory.isPending && uploadProgress > 0 && (
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
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={createStory.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || createStory.isPending}
            >
              {createStory.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Create Story
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
