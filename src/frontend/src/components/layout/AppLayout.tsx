import { ReactNode, useState } from 'react';
import { BRAND_CONFIG } from '../../config/brand';
import BottomNav from './BottomNav';
import ProfileMenu from '../profile/ProfileMenu';
import AddStoryDialog from '../stories/AddStoryDialog';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogOut, Sparkles } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/1771089289520.png"
              alt={BRAND_CONFIG.appName}
              className="w-10 h-10 rounded-lg object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">{BRAND_CONFIG.appName}</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">{BRAND_CONFIG.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button
                onClick={() => setStoryDialogOpen(true)}
                variant="ghost"
                size="sm"
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Add Story</span>
              </Button>
            )}

            <ProfileMenu />

            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-6">{children}</main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNav />

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30 py-6 hidden md:block">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} {BRAND_CONFIG.appName}. Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== 'undefined' ? window.location.hostname : 'santal-connect'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Add Story Dialog */}
      <AddStoryDialog open={storyDialogOpen} onOpenChange={setStoryDialogOpen} />
    </div>
  );
}
