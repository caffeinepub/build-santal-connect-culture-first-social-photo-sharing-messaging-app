import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Principal } from '@dfinity/principal';

interface AdminUserConversationsPanelProps {
  userPrincipal: Principal;
}

export default function AdminUserConversationsPanel({ userPrincipal }: AdminUserConversationsPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Conversations</CardTitle>
        <CardDescription>Read-only view of user's message history</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Conversation viewing functionality is not available.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Admin cannot access user conversations at this time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
