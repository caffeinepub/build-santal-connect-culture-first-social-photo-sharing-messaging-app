import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { useDeletePost } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { normalizeBackendError } from '../../utils/backendErrors';

interface DeletePostDialogProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeletePostDialog({ postId, open, onOpenChange }: DeletePostDialogProps) {
  const deletePost = useDeletePost();

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync(postId);
      toast.success('Post deleted successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Delete post error:', error);
      toast.error(normalizeBackendError(error));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Post</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this post? This action cannot be undone and will permanently remove the post and all its media.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deletePost.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deletePost.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deletePost.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
