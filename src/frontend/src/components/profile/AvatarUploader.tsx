import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Upload, Loader2 } from 'lucide-react';
import { ExternalBlob } from '../../backend';
import { toast } from 'sonner';

interface AvatarUploaderProps {
  currentAvatar?: ExternalBlob;
  onAvatarChange: (avatar: ExternalBlob | undefined) => void;
  displayName: string;
}

export default function AvatarUploader({ currentAvatar, onAvatarChange, displayName }: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      onAvatarChange(blob);
      toast.success('Avatar selected! Remember to save your changes.');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const avatarUrl = currentAvatar?.getDirectURL();
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="w-24 h-24">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName} />
        ) : (
          <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
        )}
      </Avatar>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading {uploadProgress}%
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            {currentAvatar ? 'Replace Avatar' : 'Upload Avatar'}
          </>
        )}
      </Button>
    </div>
  );
}
