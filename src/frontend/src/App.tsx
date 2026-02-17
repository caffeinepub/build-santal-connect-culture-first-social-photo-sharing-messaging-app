import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, useRouter } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/layout/AppLayout';
import FeedPage from './pages/FeedPage';
import CreatePostPage from './pages/CreatePostPage';
import CreateReelsPage from './pages/CreateReelsPage';
import ReelsPage from './pages/ReelsPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import HighlightsPage from './pages/HighlightsPage';
import ChannelPage from './pages/ChannelPage';
import ShowcasePage from './pages/ShowcasePage';
import LearnPage from './pages/LearnPage';
import LessonPage from './pages/LessonPage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import ProfilePage from './pages/ProfilePage';
import ProfileEditPage from './pages/ProfileEditPage';
import AdminPage from './pages/AdminPage';
import LoginPanel from './components/auth/LoginPanel';
import ProfileSetupModal from './components/profile/ProfileSetupModal';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';

function RootLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const router = useRouter();
  
  // Check if current route is /admin or starts with /admin
  const isAdminRoute = router.state.location.pathname === '/admin' || router.state.location.pathname.startsWith('/admin/');
  
  // Suppress profile setup modal on admin route
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null && !isAdminRoute;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPanel />;
  }

  return (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      {showProfileSetup && <ProfileSetupModal open={showProfileSetup} />}
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: FeedPage,
});

const createPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: CreatePostPage,
});

const createReelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-reels',
  component: CreateReelsPage,
});

const reelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reels',
  component: ReelsPage,
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages',
  component: MessagesPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat/$userId',
  component: ChatPage,
});

const highlightsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/highlights',
  component: HighlightsPage,
});

const channelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/channel/$channelId',
  component: ChannelPage,
});

const showcaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/showcase',
  component: ShowcasePage,
});

const learnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/learn',
  component: LearnPage,
});

const lessonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lesson/$lessonTitle',
  component: LessonPage,
});

const eventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events',
  component: EventsPage,
});

const eventDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/event/$eventName',
  component: EventDetailsPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$userId',
  component: ProfilePage,
});

const profileEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/edit',
  component: ProfileEditPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  createPostRoute,
  createReelsRoute,
  reelsRoute,
  messagesRoute,
  chatRoute,
  highlightsRoute,
  channelRoute,
  showcaseRoute,
  learnRoute,
  lessonRoute,
  eventsRoute,
  eventDetailsRoute,
  profileRoute,
  profileEditRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
