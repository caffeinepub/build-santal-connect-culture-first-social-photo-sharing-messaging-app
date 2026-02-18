import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, ArrowLeft, Loader2 } from 'lucide-react';
import { Principal } from '@dfinity/principal';
import { useAdminGetConversationList, useAdminGetConversation, useGetUserPublicProfile } from '../../hooks/useQueries';
import { format } from 'date-fns';

interface AdminUserConversationsPanelProps {
  userPrincipal: Principal;
}

export default function AdminUserConversationsPanel({ userPrincipal }: AdminUserConversationsPanelProps) {
  const [selectedOtherUser, setSelectedOtherUser] = useState<Principal | null>(null);
  
  const { data: conversationPartners = [], isLoading: conversationsLoading } = useAdminGetConversationList(userPrincipal);
  const { data: conversationMessages, isLoading: messagesLoading } = useAdminGetConversation(
    userPrincipal,
    selectedOtherUser
  );

  if (conversationsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Conversations</CardTitle>
          <CardDescription>Read-only view of user's message history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show conversation list
  if (!selectedOtherUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Conversations</CardTitle>
          <CardDescription>Read-only view of user's message history</CardDescription>
        </CardHeader>
        <CardContent>
          {conversationPartners.length > 0 ? (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {conversationPartners.map((partner) => (
                  <ConversationListItem
                    key={partner.toString()}
                    otherUser={partner}
                    onClick={() => setSelectedOtherUser(partner)}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No conversations found</p>
              <p className="text-sm text-muted-foreground mt-2">
                This user has not started any conversations yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show conversation messages
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedOtherUser(null)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <CardTitle>Conversation History</CardTitle>
            <CardDescription>Read-only message view</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {messagesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : conversationMessages && conversationMessages.messages.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {conversationMessages.messages.map((message, index) => (
                <MessageItem
                  key={index}
                  message={message}
                  isFromUser={message.sender.toString() === userPrincipal.toString()}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No messages in this conversation</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ConversationListItemProps {
  otherUser: Principal;
  onClick: () => void;
}

function ConversationListItem({ otherUser, onClick }: ConversationListItemProps) {
  const { data: profile } = useGetUserPublicProfile(otherUser);

  const avatarUrl = profile?.avatar?.getDirectURL();
  const displayName = profile?.displayName || 'Unknown User';
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
    >
      <Avatar className="w-10 h-10">
        {avatarUrl ? (
          <AvatarImage src={avatarUrl} alt={displayName} />
        ) : (
          <AvatarFallback>{initials}</AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{displayName}</p>
        <p className="text-sm text-muted-foreground">View conversation</p>
      </div>
    </button>
  );
}

interface MessageItemProps {
  message: {
    sender: Principal;
    content: string;
    timestamp: bigint;
  };
  isFromUser: boolean;
}

function MessageItem({ message, isFromUser }: MessageItemProps) {
  const { data: profile } = useGetUserPublicProfile(message.sender);
  const displayName = profile?.displayName || 'Unknown User';

  return (
    <div className={`flex gap-3 ${isFromUser ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className={`flex-1 ${isFromUser ? 'text-left' : 'text-right'}`}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium">{displayName}</span>
          <span className="text-xs text-muted-foreground">
            {format(Number(message.timestamp) / 1000000, 'MMM d, h:mm a')}
          </span>
        </div>
        <div
          className={`inline-block px-4 py-2 rounded-lg ${
            isFromUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
