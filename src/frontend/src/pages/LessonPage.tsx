import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useGetLesson } from '../hooks/useQueries';
import UnicodeText from '../components/posts/UnicodeText';

export default function LessonPage() {
  const { lessonTitle } = useParams({ from: '/lesson/$lessonTitle' });
  const navigate = useNavigate();
  const { data: lesson, isLoading } = useGetLesson(decodeURIComponent(lessonTitle));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <p className="text-center text-muted-foreground">Lesson not found</p>
      </div>
    );
  }

  const mediaUrl = lesson.media?.getDirectURL();

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/learn' })}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Lessons
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            <UnicodeText text={lesson.title} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {mediaUrl && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img src={mediaUrl} alt={lesson.title} className="w-full" />
            </div>
          )}

          <div className="prose prose-sm max-w-none">
            <UnicodeText text={lesson.content} className="text-base leading-relaxed" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
