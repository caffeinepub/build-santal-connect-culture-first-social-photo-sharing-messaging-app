import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface StudyView {
    id: string;
    participants: Array<Principal>;
    instructor: Principal;
    name: string;
    materials: Array<[string, ExternalBlob]>;
    schedule?: string;
}
export type Time = bigint;
export interface Comment {
    content: string;
    author: Principal;
    timestamp: Time;
}
export interface Story {
    id: string;
    content: ExternalBlob;
    author: Principal;
    timestamp: Time;
    mediaType: PostMediaType;
}
export interface PostView {
    id: string;
    media?: ExternalBlob;
    isEvent: boolean;
    author: Principal;
    likes: Array<Principal>;
    timestamp: Time;
    caption: string;
    mediaType: PostMediaType;
    comments: Array<Comment>;
    eventName?: string;
}
export interface Event {
    date: Time;
    name: string;
    description: string;
    location?: string;
}
export interface UserSearchResult {
    displayName: string;
    userId: string;
}
export interface ConversationView {
    participants: Array<Principal>;
    messages: Array<Message>;
}
export interface PublicProfile {
    bio: string;
    userType: UserType;
    verified: boolean;
    musicianTag?: boolean;
    displayName: string;
    influencerTag?: boolean;
    painterTag?: boolean;
    teacherBadge: boolean;
    singerTag?: boolean;
    location?: string;
    dancerTag?: boolean;
    avatar?: ExternalBlob;
}
export interface Lesson {
    media?: ExternalBlob;
    title: string;
    content: string;
}
export interface StoryView {
    story: Story;
    authorProfile: PublicProfile;
}
export interface Message {
    content: string;
    sender: Principal;
    timestamp: Time;
}
export interface UserProfile {
    publicProfile: PublicProfile;
    countryCode: string;
    phone: string;
}
export enum PostMediaType {
    video = "video",
    image = "image"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum UserType {
    creator = "creator",
    user = "user"
}
export interface backendInterface {
    addComment(postId: string, content: string): Promise<void>;
    addEvent(name: string, date: Time, description: string, location: string | null): Promise<void>;
    addLesson(title: string, content: string, media: ExternalBlob | null): Promise<void>;
    addMaterial(studyId: string, materialId: string, material: ExternalBlob): Promise<void>;
    addToChannel(channelName: string, postId: string): Promise<void>;
    adminAddEvent(name: string, date: Time, description: string, location: string | null): Promise<void>;
    adminBanUser(user: Principal): Promise<void>;
    adminGetConversation(_adminTargetUser: Principal, otherUser: Principal): Promise<ConversationView | null>;
    adminGetConversationList(targetUser: Principal): Promise<Array<Principal>>;
    adminGrantTeacherBadge(user: Principal): Promise<void>;
    adminIsUserBanned(user: Principal): Promise<boolean>;
    adminRevokeTeacherBadge(user: Principal): Promise<void>;
    adminSetVerified(user: Principal, verified: boolean): Promise<void>;
    adminUnbanUser(user: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkRole(target: Principal): Promise<UserRole | null>;
    createEventPost(eventName: string, caption: string, media: ExternalBlob | null, mediaType: PostMediaType): Promise<string>;
    createPost(caption: string, media: ExternalBlob | null, mediaType: PostMediaType): Promise<string>;
    createStory(content: ExternalBlob, mediaType: PostMediaType): Promise<string>;
    createStudy(name: string, materials: Array<[string, ExternalBlob]>, schedule: string, instructor: Principal): Promise<string>;
    expireStories(): Promise<void>;
    followUser(target: Principal): Promise<void>;
    getAllEvents(): Promise<Array<Event>>;
    getAllLessons(): Promise<Array<Lesson>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChannelPosts(channelName: string): Promise<Array<PostView>>;
    getConversation(otherUser: Principal): Promise<ConversationView | null>;
    getEvent(name: string): Promise<Event | null>;
    getFeedStories(): Promise<Array<Story>>;
    getFeedStoryViews(): Promise<Array<StoryView>>;
    getFollowers(target: Principal): Promise<Array<Principal>>;
    getFollowing(target: Principal): Promise<Array<Principal>>;
    getLesson(title: string): Promise<Lesson | null>;
    getPosts(): Promise<Array<PostView>>;
    getStudy(studyId: string): Promise<StudyView | null>;
    getStudyIds(): Promise<Array<string>>;
    getUserProfile(target: Principal): Promise<UserProfile | null>;
    getUserPublicProfile(target: Principal): Promise<PublicProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isFollowing(target: Principal): Promise<boolean>;
    joinStudy(studyId: string): Promise<void>;
    likePost(postId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUsersByDisplayName(search: string): Promise<Array<UserSearchResult>>;
    sendMessage(receiver: Principal, content: string): Promise<void>;
    unfollowUser(target: Principal): Promise<void>;
    unlikePost(postId: string): Promise<void>;
    updateAvatar(newAvatar: ExternalBlob | null): Promise<void>;
}
