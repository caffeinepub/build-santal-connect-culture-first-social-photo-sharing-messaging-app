import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoryView } from '../../backend';
import { PostMediaType } from '../../backend';
import VerifiedBadge from '../common/VerifiedBadge';

interface StoryViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stories: StoryView[];
  initialIndex: number;
}

export default function StoryViewerDialog({
  open,
  onOpenChange,
  stories,
  initialIndex,
}: StoryViewerDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  if (stories.length === 0) return null;

  const currentStory = stories[currentIndex];
  const profile = currentStory.authorProfile;
  const mediaUrl = currentStory.story.content.getDirectURL();

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onOpenChange(false);
    }
  };

  const handleLeftTap = () => {
    handlePrevious();
  };

  const handleRightTap = () => {
    handleNext();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[90vh] p-0 bg-black border-none">
        {/* Story Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-white/20">
                {profile.avatar ? (
                  <AvatarImage src={profile.avatar.getDirectURL()} alt={profile.displayName} />
                ) : (
                  <AvatarFallback>{profile.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">{profile.displayName}</span>
                {profile.verified && <VerifiedBadge className="w-4 h-4" />}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Progress Indicators */}
          <div className="flex gap-1 mt-3">
            {stories.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'h-0.5 flex-1 rounded-full transition-colors',
                  idx === currentIndex ? 'bg-white' : 'bg-white/30'
                )}
              />
            ))}
          </div>
        </div>

        {/* Story Content */}
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          {/* Tap Zones */}
          <div className="absolute inset-0 flex">
            <button
              onClick={handleLeftTap}
              className="flex-1 cursor-pointer"
              disabled={currentIndex === 0}
            />
            <button
              onClick={handleRightTap}
              className="flex-1 cursor-pointer"
            />
          </div>

          {/* Media */}
          {currentStory.story.mediaType === PostMediaType.image ? (
            <img
              src={mediaUrl}
              alt="Story"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="max-w-full max-h-full"
            />
          )}

          {/* Navigation Buttons (Desktop) */}
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hidden md:flex"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          {currentIndex < stories.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hidden md:flex"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}
        </div>

        {/* Story Timestamp */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-xs text-white/70">
            {new Date(Number(currentStory.story.timestamp) / 1000000).toLocaleString()}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
