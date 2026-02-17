import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Loader2, Smile } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGetConversation, useSendMessage, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { normalizeBackendError } from '../utils/backendErrors';
import StickerDisplay from '../components/messages/StickerDisplay';
import { STICKERS, STICKER_SHEET_PATH } from '../config/stickers';

export default function ChatPage() {
  const { userId } = useParams({ from: '/chat/$userId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const [message, setMessage] = useState('');
  const [stickerPickerOpen, setStickerPickerOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const otherUserPrincipal = Principal.fromText(userId);
  const { data: conversation, isLoading } = useGetConversation(otherUserPrincipal);
  const { data: otherUserProfile } = useGetUserProfile(otherUserPrincipal);
  const sendMessage = useSendMessage();

  const currentUserPrincipal = identity?.getPrincipal();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !currentUserPrincipal) return;

    try {
      await sendMessage.mutateAsync({
        receiver: otherUserPrincipal,
        content: content.trim(),
      });
      setMessage('');
    } catch (error) {
      console.error('Send message error:', error);
      toast.error(normalizeBackendError(error));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(message);
  };

  const handleStickerSelect = (stickerId: string) => {
    handleSendMessage(`[sticker:${stickerId}]`);
    setStickerPickerOpen(false);
  };

  const otherUserName = otherUserProfile?.publicProfile.displayName || 'User';
  const avatarUrl = otherUserProfile?.publicProfile.avatar?.getDirectURL();
  const initials = otherUserName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6">
      <Card className="h-[calc(100vh-8rem)]">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/messages' })}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar className="w-10 h-10">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt={otherUserName} /> : <AvatarFallback>{initials}</AvatarFallback>}
            </Avatar>
            <CardTitle className="text-lg">{otherUserName}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
          {/* Messages Area */}
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              {conversation?.messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-12">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                conversation?.messages.map((msg, index) => {
                  const isSender = msg.sender.toString() === currentUserPrincipal?.toString();
                  const isSticker = msg.content.startsWith('[sticker:') && msg.content.endsWith(']');
                  const stickerId = isSticker ? msg.content.slice(9, -1) : null;

                  return (
                    <div key={index} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isSender ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                        {isSticker && stickerId ? (
                          <StickerDisplay stickerId={stickerId} />
                        ) : (
                          <p className="text-sm">{msg.content}</p>
                        )}
                        <p className={`text-xs mt-1 ${isSender ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {new Date(Number(msg.timestamp) / 1000000).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Popover open={stickerPickerOpen} onOpenChange={setStickerPickerOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="icon">
                    <Smile className="w-5 h-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-2">
                  <div className="grid grid-cols-3 gap-2">
                    {STICKERS.map((sticker) => (
                      <button
                        key={sticker.id}
                        onClick={() => handleStickerSelect(sticker.id)}
                        className="relative aspect-square rounded-lg overflow-hidden hover:bg-accent transition-colors border border-border"
                        title={sticker.name}
                        type="button"
                      >
                        <div
                          className="w-full h-full"
                          style={{
                            backgroundImage: `url(${STICKER_SHEET_PATH})`,
                            backgroundPosition: `-${sticker.position.x}px -${sticker.position.y}px`,
                            backgroundSize: '1024px 1024px',
                            backgroundRepeat: 'no-repeat',
                            transform: 'scale(0.8)',
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={sendMessage.isPending || !message.trim()}>
                {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
