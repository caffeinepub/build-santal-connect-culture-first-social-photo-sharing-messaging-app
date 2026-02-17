import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function MessagesPage() {
  const { identity } = useInternetIdentity();

  if (!identity) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Please log in to view your messages</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No conversations yet</p>
            <p className="text-sm mt-2">Start a conversation by visiting a user's profile and clicking the Message button</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
