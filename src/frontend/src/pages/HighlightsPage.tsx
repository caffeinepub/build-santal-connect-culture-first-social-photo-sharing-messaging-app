import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HIGHLIGHT_CHANNELS } from '../config/highlights';
import { ArrowRight } from 'lucide-react';

export default function HighlightsPage() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header with subtle pattern */}
      <div
        className="relative rounded-2xl overflow-hidden p-8 text-center"
        style={{
          backgroundImage: 'url(/assets/generated/santal-pattern.dim_1600x900.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="relative z-10 bg-background/90 backdrop-blur-sm rounded-xl p-6">
          <h1 className="text-3xl font-bold mb-2">Community Highlights</h1>
          <p className="text-muted-foreground">Explore curated content celebrating Santal culture</p>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {HIGHLIGHT_CHANNELS.map((channel) => (
          <Card key={channel.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-3xl">{channel.icon}</span>
                <span>{channel.name}</span>
              </CardTitle>
              <CardDescription>{channel.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate({ to: '/channel/$channelId', params: { channelId: channel.id } })}
              >
                Explore <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Showcase Link */}
      <Card className="bg-gradient-to-br from-accent/20 to-primary/10">
        <CardHeader>
          <CardTitle>Local Talent Showcase</CardTitle>
          <CardDescription>Discover featured creators from the Santal community</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate({ to: '/showcase' })}>
            View Showcase <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
