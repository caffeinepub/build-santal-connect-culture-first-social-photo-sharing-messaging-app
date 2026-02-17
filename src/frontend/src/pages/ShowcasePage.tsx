import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Music, Palette, Mic, Users } from 'lucide-react';
import { useGetPosts } from '../hooks/useQueries';
import { isFeaturedCreator } from '../config/featuredCreators';

export default function ShowcasePage() {
  const navigate = useNavigate();
  const { data: posts, isLoading } = useGetPosts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get unique featured creators from posts
  const featuredCreators = Array.from(
    new Set(
      (posts || [])
        .map((post) => post.author.toString())
        .filter((authorId) => isFeaturedCreator(authorId))
    )
  );

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Local Talent Showcase</h1>
        <p className="text-muted-foreground">Celebrating artists, musicians, dancers, and artisans from the Santal community</p>
      </div>

      {featuredCreators.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No featured creators yet</p>
            <p className="text-sm text-muted-foreground mt-2">Check back soon for talented community members!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {featuredCreators.map((creatorId) => (
            <Card
              key={creatorId}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate({ to: '/profile/$userId', params: { userId: creatorId } })}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <Avatar className="w-16 h-16">
                  <AvatarFallback>
                    <Music className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{creatorId.slice(0, 12)}...</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <Music className="w-3 h-3 mr-1" />
                      Creator
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
