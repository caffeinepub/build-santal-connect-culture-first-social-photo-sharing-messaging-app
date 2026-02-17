import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import UnicodeText from '../posts/UnicodeText';

interface DailyItemCardProps {
  title: string;
  content: string;
}

export default function DailyItemCard({ title, content }: DailyItemCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" />
          Daily Word
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <h3 className="text-2xl font-bold">
          <UnicodeText text={title} />
        </h3>
        <p className="text-muted-foreground">
          <UnicodeText text={content} />
        </p>
      </CardContent>
    </Card>
  );
}
