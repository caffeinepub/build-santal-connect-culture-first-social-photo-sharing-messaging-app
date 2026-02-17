import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Loader2, ArrowRight } from 'lucide-react';
import { useGetAllLessons, useIsCallerAdmin, useGetCallerUserProfile } from '../hooks/useQueries';
import DailyItemCard from '../components/learn/DailyItemCard';
import LearnCreateContentDialog from '../components/learn/LearnCreateContentDialog';
import UnicodeText from '../components/posts/UnicodeText';

export default function LearnPage() {
  const navigate = useNavigate();
  const { data: lessons, isLoading } = useGetAllLessons();
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: userProfile } = useGetCallerUserProfile();

  const hasTeacherBadge = userProfile?.publicProfile.teacherBadge === true;
  const canCreateContent = isAdmin || hasTeacherBadge;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Use first lesson as daily item (or create a specific daily item in backend)
  const dailyItem = lessons && lessons.length > 0 ? lessons[0] : null;
  const regularLessons = lessons && lessons.length > 1 ? lessons.slice(1) : [];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Learning Corner: Ol Chiki</h1>
          <p className="text-muted-foreground">Learn Santali language and preserve our cultural heritage</p>
        </div>
        {canCreateContent && <LearnCreateContentDialog />}
      </div>

      {/* Daily Item */}
      {dailyItem && <DailyItemCard title={dailyItem.title} content={dailyItem.content} />}

      {/* Lessons List */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Mini Lessons
        </h2>

        {lessons && lessons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No lessons available yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {lessons?.map((lesson, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <UnicodeText text={lesson.title} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    <UnicodeText text={lesson.content} />
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: '/lesson/$lessonTitle', params: { lessonTitle: lesson.title } })}
                  >
                    Read More <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
