import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, PostView, ConversationView, Lesson, Event, UserRole, UserSearchResult, PublicProfile, StoryView } from '../backend';
import { Principal } from '@dfinity/principal';
import { ExternalBlob, PostMediaType } from '../backend';
import { normalizeBackendError } from '../utils/backendErrors';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (error) {
        // If profile query fails, return null instead of throwing
        console.error('Failed to fetch caller profile:', error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      try {
        return await actor.getUserProfile(principal);
      } catch (error) {
        console.error(`Failed to fetch profile for ${principal.toString()}:`, error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!principal,
    retry: false,
  });
}

export function useGetUserPublicProfile(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PublicProfile | null>({
    queryKey: ['publicProfile', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      try {
        return await actor.getUserPublicProfile(principal);
      } catch (error) {
        console.error(`Failed to fetch public profile for ${principal.toString()}:`, error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!principal,
    retry: false,
  });
}

export function useGetUserProfiles(principals: Principal[]) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Record<string, UserProfile | null>>({
    queryKey: ['userProfiles', principals.map(p => p.toString()).sort().join(',')],
    queryFn: async () => {
      if (!actor) return {};
      
      const profiles: Record<string, UserProfile | null> = {};
      
      // Fetch all profiles in parallel
      await Promise.all(
        principals.map(async (principal) => {
          const principalStr = principal.toString();
          try {
            const profile = await actor.getUserProfile(principal);
            profiles[principalStr] = profile;
          } catch (error) {
            console.error(`Failed to fetch profile for ${principalStr}:`, error);
            profiles[principalStr] = null;
          }
        })
      );
      
      return profiles;
    },
    enabled: !!actor && !actorFetching && principals.length > 0,
    retry: false,
  });
}

export function useGetUserPublicProfiles(principals: Principal[]) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Record<string, PublicProfile | null>>({
    queryKey: ['publicProfiles', principals.map(p => p.toString()).sort().join(',')],
    queryFn: async () => {
      if (!actor) return {};
      
      const profiles: Record<string, PublicProfile | null> = {};
      
      // Fetch all public profiles in parallel
      await Promise.all(
        principals.map(async (principal) => {
          const principalStr = principal.toString();
          try {
            const profile = await actor.getUserPublicProfile(principal);
            profiles[principalStr] = profile;
          } catch (error) {
            console.error(`Failed to fetch public profile for ${principalStr}:`, error);
            profiles[principalStr] = null;
          }
        })
      );
      
      return profiles;
    },
    enabled: !!actor && !actorFetching && principals.length > 0,
    retry: false,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      // Invalidate current profile
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      // Invalidate admin role check to ensure admin access persists
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      // Invalidate admin user profiles list
      queryClient.invalidateQueries({ queryKey: ['adminAllUserProfiles'] });
    },
  });
}

export function useUpdateAvatar() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newAvatar: ExternalBlob | null) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAvatar(newAvatar);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile'] });
      queryClient.invalidateQueries({ queryKey: ['adminAllUserProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['feedStoryViews'] });
    },
  });
}

// User Search Query
export function useSearchUsersByDisplayName(searchQuery: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserSearchResult[]>({
    queryKey: ['userSearch', searchQuery],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.searchUsersByDisplayName(searchQuery);
      } catch (error) {
        console.error('Failed to search users:', error);
        throw new Error(normalizeBackendError(error));
      }
    },
    enabled: !!actor && !actorFetching && searchQuery.trim().length > 0,
    retry: false,
  });
}

// Role/Verification Queries
export function useCheckRole(principal: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserRole | null>({
    queryKey: ['userRole', principal?.toString()],
    queryFn: async () => {
      if (!actor || !principal) return null;
      try {
        return await actor.checkRole(principal);
      } catch (error) {
        console.error(`Failed to check role for ${principal.toString()}:`, error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!principal,
    retry: false,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Failed to check admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

// Admin Mutations
export function useAdminApplyVerified() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminApplyVerified(user);
    },
    onSuccess: (_, user) => {
      // Invalidate the specific user's profile
      queryClient.invalidateQueries({ queryKey: ['userProfile', user.toString()] });
      // Invalidate public profile for the user
      queryClient.invalidateQueries({ queryKey: ['publicProfile', user.toString()] });
      // Invalidate all public profiles cache (for batch queries)
      queryClient.invalidateQueries({ queryKey: ['publicProfiles'] });
      // Invalidate posts to refresh verified badges on post cards
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // Invalidate stories to refresh verified badges on story views
      queryClient.invalidateQueries({ queryKey: ['feedStoryViews'] });
      // Invalidate admin user list
      queryClient.invalidateQueries({ queryKey: ['adminAllUserProfiles'] });
    },
  });
}

export function useAdminGrantTeacherBadge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminGrantTeacherBadge(user);
    },
    onSuccess: (_, user) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user.toString()] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile', user.toString()] });
      queryClient.invalidateQueries({ queryKey: ['publicProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['feedStoryViews'] });
      queryClient.invalidateQueries({ queryKey: ['adminAllUserProfiles'] });
    },
  });
}

export function useAdminRevokeTeacherBadge() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminRevokeTeacherBadge(user);
    },
    onSuccess: (_, user) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user.toString()] });
      queryClient.invalidateQueries({ queryKey: ['publicProfile', user.toString()] });
      queryClient.invalidateQueries({ queryKey: ['publicProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['feedStoryViews'] });
      queryClient.invalidateQueries({ queryKey: ['adminAllUserProfiles'] });
    },
  });
}

export function useAdminBanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminBanUser(user);
    },
    onSuccess: (_, user) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user.toString()] });
      queryClient.invalidateQueries({ queryKey: ['adminIsUserBanned', user.toString()] });
      queryClient.invalidateQueries({ queryKey: ['adminAllUserProfiles'] });
    },
  });
}

export function useAdminUnbanUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminUnbanUser(user);
    },
    onSuccess: (_, user) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', user.toString()] });
      queryClient.invalidateQueries({ queryKey: ['adminIsUserBanned', user.toString()] });
      queryClient.invalidateQueries({ queryKey: ['adminAllUserProfiles'] });
    },
  });
}

export function useAdminIsUserBanned(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['adminIsUserBanned', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return false;
      try {
        return await actor.adminIsUserBanned(user);
      } catch (error) {
        console.error(`Failed to check ban status for ${user.toString()}:`, error);
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!user,
    retry: false,
  });
}

// Admin Conversation Queries (read-only)
export function useAdminGetUserConversations(user: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<{ otherUser: Principal; lastMessage?: string; lastMessageTime?: bigint }>>({
    queryKey: ['adminUserConversations', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) return [];
      try {
        // Backend method not yet implemented - using type assertion for future compatibility
        const actorAny = actor as any;
        if (typeof actorAny.adminGetUserConversations === 'function') {
          return await actorAny.adminGetUserConversations(user);
        }
        return [];
      } catch (error) {
        console.error(`Failed to fetch conversations for ${user.toString()}:`, error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!user,
    retry: false,
  });
}

export function useAdminGetConversationMessages(user: Principal | null, otherUser: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ConversationView | null>({
    queryKey: ['adminConversationMessages', user?.toString(), otherUser?.toString()],
    queryFn: async () => {
      if (!actor || !user || !otherUser) return null;
      try {
        // Backend method not yet implemented - using type assertion for future compatibility
        const actorAny = actor as any;
        if (typeof actorAny.adminGetConversation === 'function') {
          return await actorAny.adminGetConversation(user, otherUser);
        }
        return null;
      } catch (error) {
        console.error(`Failed to fetch conversation messages:`, error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!user && !!otherUser,
    retry: false,
  });
}

// Posts Queries
export function useGetPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostView[]>({
    queryKey: ['posts'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getPosts();
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetEventPosts(eventName: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostView[]>({
    queryKey: ['eventPosts', eventName],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const allPosts = await actor.getPosts();
        // Filter posts that are event posts for this specific event
        return allPosts.filter(post => post.isEvent && post.eventName === eventName);
      } catch (error) {
        console.error(`Failed to fetch event posts for ${eventName}:`, error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!eventName,
    retry: false,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caption, media, mediaType }: { caption: string; media: ExternalBlob | null; mediaType: PostMediaType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPost(caption, media, mediaType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useCreateEventPost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventName, caption, media, mediaType }: { eventName: string; caption: string; media: ExternalBlob | null; mediaType: PostMediaType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createEventPost(eventName, caption, media, mediaType);
    },
    onSuccess: (_, { eventName }) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['eventPosts', eventName] });
      queryClient.invalidateQueries({ queryKey: ['channelPosts'] });
    },
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['eventPosts'] });
      queryClient.invalidateQueries({ queryKey: ['channelPosts'] });
    },
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unlikePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['eventPosts'] });
      queryClient.invalidateQueries({ queryKey: ['channelPosts'] });
    },
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(postId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['eventPosts'] });
      queryClient.invalidateQueries({ queryKey: ['channelPosts'] });
    },
  });
}

// Channels
export function useGetChannelPosts(channelName: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PostView[]>({
    queryKey: ['channelPosts', channelName],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getChannelPosts(channelName);
      } catch (error) {
        console.error(`Failed to fetch posts for channel ${channelName}:`, error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!channelName,
    retry: false,
  });
}

export function useAdminAddPostToChannel() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ channelName, postId }: { channelName: string; postId: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToChannel(channelName, postId);
    },
    onSuccess: (_, { channelName }) => {
      queryClient.invalidateQueries({ queryKey: ['channelPosts', channelName] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Messages
export function useGetConversation(otherUser: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<ConversationView | null>({
    queryKey: ['conversation', otherUser?.toString()],
    queryFn: async () => {
      if (!actor || !otherUser) return null;
      try {
        return await actor.getConversation(otherUser);
      } catch (error) {
        console.error(`Failed to fetch conversation with ${otherUser.toString()}:`, error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!otherUser,
    retry: false,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiver, content }: { receiver: Principal; content: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendMessage(receiver, content);
    },
    onSuccess: (_, { receiver }) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', receiver.toString()] });
    },
  });
}

// Learning Corner
export function useGetAllLessons() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Lesson[]>({
    queryKey: ['lessons'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllLessons();
      } catch (error) {
        console.error('Failed to fetch lessons:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetLesson(title: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Lesson | null>({
    queryKey: ['lesson', title],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getLesson(title);
      } catch (error) {
        console.error(`Failed to fetch lesson ${title}:`, error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!title,
    retry: false,
  });
}

export function useAddLesson() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content, media }: { title: string; content: string; media: ExternalBlob | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addLesson(title, content, media);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
}

export function useAdminAddLesson() {
  return useAddLesson();
}

// Events
export function useGetAllEvents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllEvents();
      } catch (error) {
        console.error('Failed to fetch events:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useGetEvent(name: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Event | null>({
    queryKey: ['event', name],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getEvent(name);
      } catch (error) {
        console.error(`Failed to fetch event ${name}:`, error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!name,
    retry: false,
  });
}

export function useAdminAddEvent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, date, description, location }: { name: string; date: bigint; description: string; location: string | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.adminAddEvent(name, date, description, location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

// Follow System
export function useIsFollowing(target: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isFollowing', target?.toString()],
    queryFn: async () => {
      if (!actor || !target) return false;
      try {
        return await actor.isFollowing(target);
      } catch (error) {
        console.error(`Failed to check following status for ${target.toString()}:`, error);
        return false;
      }
    },
    enabled: !!actor && !actorFetching && !!target,
    retry: false,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.followUser(target);
    },
    onSuccess: (_, target) => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', target.toString()] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['feedStoryViews'] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unfollowUser(target);
    },
    onSuccess: (_, target) => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', target.toString()] });
      queryClient.invalidateQueries({ queryKey: ['followers'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
      queryClient.invalidateQueries({ queryKey: ['feedStoryViews'] });
    },
  });
}

export function useGetFollowers(target: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['followers', target?.toString()],
    queryFn: async () => {
      if (!actor || !target) return [];
      try {
        return await actor.getFollowers(target);
      } catch (error) {
        console.error(`Failed to fetch followers for ${target.toString()}:`, error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!target,
    retry: false,
  });
}

export function useGetFollowing(target: Principal | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['following', target?.toString()],
    queryFn: async () => {
      if (!actor || !target) return [];
      try {
        return await actor.getFollowing(target);
      } catch (error) {
        console.error(`Failed to fetch following for ${target.toString()}:`, error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!target,
    retry: false,
  });
}

// Stories
export function useGetFeedStoryViews() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<StoryView[]>({
    queryKey: ['feedStoryViews'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getFeedStoryViews();
      } catch (error) {
        console.error('Failed to fetch story views:', error);
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
}

export function useCreateStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, mediaType }: { content: ExternalBlob; mediaType: PostMediaType }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createStory(content, mediaType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedStoryViews'] });
    },
  });
}
