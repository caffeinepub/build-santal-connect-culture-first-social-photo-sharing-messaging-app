import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Set "mo:core/Set";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

module {
  // Previous (old) types from the contract code
  type OldStory = {
    id : Text;
    author : Principal;
    content : Storage.ExternalBlob;
    timestamp : Time.Time;
    mediaType : OldPostMediaType;
  };

  type OldUserProfile = {
    publicProfile : OldPublicProfile;
    phone : Text;
    countryCode : Text;
  };

  type OldUserType = {
    #user;
    #creator;
  };

  type OldPublicProfile = {
    displayName : Text;
    bio : Text;
    location : ?Text;
    avatar : ?Storage.ExternalBlob;
    verified : Bool;
    userType : OldUserType;
    teacherBadge : Bool;
  };

  type OldPost = {
    author : Principal;
    caption : Text;
    media : ?Storage.ExternalBlob;
    mediaType : OldPostMediaType;
    timestamp : Time.Time;
    likes : Set.Set<Principal>;
    comments : List.List<OldComment>;
    isEvent : Bool;
    eventName : ?Text;
  };

  type OldPostMediaType = {
    #image;
    #video;
  };

  type OldComment = {
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type OldMessage = {
    sender : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type OldConversation = {
    participants : [Principal];
    messages : List.List<OldMessage>;
  };

  type OldChannel = {
    name : Text;
    postIds : List.List<Text>;
  };

  type OldLesson = {
    title : Text;
    content : Text;
    media : ?Storage.ExternalBlob;
  };

  type OldEvent = {
    name : Text;
    date : Time.Time;
    description : Text;
    location : ?Text;
  };

  type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    stories : Map.Map<Text, OldStory>;
    events : Map.Map<Text, OldEvent>;
    nextPostId : Nat;
    channels : Map.Map<Text, OldChannel>;
    nextStoryId : Nat;
    bannedUsers : Set.Set<Principal>;
    eventPosts : Map.Map<Text, List.List<Text>>;
    posts : Map.Map<Text, OldPost>;
    lessons : Map.Map<Text, OldLesson>;
    conversations : Map.Map<Text, OldConversation>;
  };

  // Current (new) types from the contract code
  type NewStory = {
    id : Text;
    author : Principal;
    content : Storage.ExternalBlob;
    timestamp : Time.Time;
    mediaType : NewPostMediaType;
  };

  type NewUserProfile = {
    publicProfile : NewPublicProfile;
    phone : Text;
    countryCode : Text;
  };

  type NewUserType = {
    #user;
    #creator;
  };

  type NewPublicProfile = {
    displayName : Text;
    bio : Text;
    location : ?Text;
    avatar : ?Storage.ExternalBlob;
    verified : Bool;
    userType : NewUserType;
    teacherBadge : Bool;
    musicianTag : ?Bool;
    painterTag : ?Bool;
    influencerTag : ?Bool;
    dancerTag : ?Bool;
    singerTag : ?Bool;
  };

  type NewPost = {
    author : Principal;
    caption : Text;
    media : ?Storage.ExternalBlob;
    mediaType : NewPostMediaType;
    timestamp : Time.Time;
    likes : Set.Set<Principal>;
    comments : List.List<NewComment>;
    isEvent : Bool;
    eventName : ?Text;
  };

  type NewPostMediaType = {
    #image;
    #video;
  };

  type NewComment = {
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type NewMessage = {
    sender : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  type NewConversation = {
    participants : [Principal];
    messages : List.List<NewMessage>;
  };

  type NewChannel = {
    name : Text;
    postIds : List.List<Text>;
  };

  type NewLesson = {
    title : Text;
    content : Text;
    media : ?Storage.ExternalBlob;
  };

  type NewEvent = {
    name : Text;
    date : Time.Time;
    description : Text;
    location : ?Text;
  };

  type NewStudy = {
    id : Text;
    name : Text;
    participants : Set.Set<Principal>;
    materials : Map.Map<Text, Storage.ExternalBlob>;
    schedule : ?Text;
    instructor : Principal;
  };

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    stories : Map.Map<Text, NewStory>;
    events : Map.Map<Text, NewEvent>;
    nextPostId : Nat;
    channels : Map.Map<Text, NewChannel>;
    nextStoryId : Nat;
    bannedUsers : Set.Set<Principal>;
    eventPosts : Map.Map<Text, List.List<Text>>;
    posts : Map.Map<Text, NewPost>;
    lessons : Map.Map<Text, NewLesson>;
    conversations : Map.Map<Text, NewConversation>;
    // New persistent state
    studies : Map.Map<Text, NewStudy>;
    nextStudyId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      stories = old.stories;
      events = old.events;
      nextPostId = old.nextPostId;
      channels = old.channels;
      nextStoryId = old.nextStoryId;
      bannedUsers = old.bannedUsers;
      eventPosts = old.eventPosts;
      posts = old.posts;
      lessons = old.lessons;
      conversations = old.conversations;
      studies = Map.empty();
      nextStudyId = 0;
    };
  };
};
