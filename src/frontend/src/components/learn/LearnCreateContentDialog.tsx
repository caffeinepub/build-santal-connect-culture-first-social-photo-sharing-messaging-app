import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus } from 'lucide-react';
import { useAddLesson } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { normalizeBackendError } from '../../utils/backendErrors';

interface LearnCreateContentDialogProps {
  onSuccess?: () => void;
}

export default function LearnCreateContentDialog({ onSuccess }: LearnCreateContentDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const addLesson = useAddLesson();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addLesson.mutateAsync({
        title: title.trim(),
        content: content.trim(),
        media: null,
      });

      toast.success('Lesson created successfully');
      setOpen(false);
      setTitle('');
      setContent('');
      onSuccess?.();
    } catch (error) {
      console.error('Create lesson error:', error);
      toast.error(normalizeBackendError(error));
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!addLesson.isPending) {
      setOpen(newOpen);
      if (!newOpen) {
        setTitle('');
        setContent('');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
            <DialogDescription>
              Create a new lesson or course for the Learning Corner
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter lesson title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={addLesson.isPending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Enter lesson content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={addLesson.isPending}
                rows={6}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={addLesson.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={addLesson.isPending}>
              {addLesson.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Lesson'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
