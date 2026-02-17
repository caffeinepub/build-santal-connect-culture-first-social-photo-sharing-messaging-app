import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Home, Film, MessageCircle, Compass, BookOpen, Calendar, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsCallerAdmin } from '../../hooks/useQueries';

export default function BottomNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { data: isAdmin } = useIsCallerAdmin();

  const baseNavItems = [
    { icon: Home, label: 'Feed', path: '/' },
    { icon: Film, label: 'Reels', path: '/reels' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Compass, label: 'Explore', path: '/highlights' },
    { icon: BookOpen, label: 'Learn', path: '/learn' },
    { icon: Calendar, label: 'Events', path: '/events' },
  ];

  const navItems = isAdmin
    ? [...baseNavItems, { icon: Shield, label: 'Admin', path: '/admin' }]
    : baseNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
      <div className="container px-2">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate({ to: item.path })}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]',
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
