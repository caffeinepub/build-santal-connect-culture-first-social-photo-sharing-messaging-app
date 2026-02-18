import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";


import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Add migration clause - crucial for stability


actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Define the fixed admin principal (replace with actual admin principal in deployment)
  let fixedAdminPrincipals = Set.singleton(Principal.fromText("aaaaa-aa"));

  let storyExpiryDuration : Int = 24 * 60 * 60 * 1000000000; // 24 hours in nanoseconds

  // Story type
  public type Story = {
    id : Text;
    author : Principal;
    content : Storage.ExternalBlob;
    timestamp : Time.Time;
    mediaType : PostMediaType;
  };

  public type PublicProfile = {
    displayName : Text;
    bio : Text;
    location : ?Text;
    avatar : ?Storage.ExternalBlob;
    verified : Bool;
    userType : UserType;
    teacherBadge : Bool;
    musicianTag : ?Bool;
    painterTag : ?Bool;
    influencerTag : ?Bool;
    dancerTag : ?Bool;
    singerTag : ?Bool;
  };

  public type UserProfile = {
    publicProfile : PublicProfile;
    phone : Text;
    countryCode : Text;
  };

  public type UserType = {
    #user;
    #creator;
  };

  module UserProfile {
    public func compare(user1 : UserProfile, user2 : UserProfile) : Order.Order {
      Text.compare(user1.publicProfile.displayName, user2.publicProfile.displayName);
    };
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let bannedUsers = Set.empty<Principal>();

  // Follow system
  let followingMap = Map.empty<Principal, Set.Set<Principal>>();

  // --- Studies Module ---
  public type Study = {
    id : Text;
    name : Text;
    participants : Set.Set<Principal>;
    materials : Map.Map<Text, Storage.ExternalBlob>;
    schedule : ?Text;
    instructor : Principal; // Added field for instructor
  };

  public type StudyView = {
    id : Text;
    name : Text;
    participants : [Principal];
    materials : [(Text, Storage.ExternalBlob)];
    schedule : ?Text;
    instructor : Principal; // Added field for instructor
  };

  let studies = Map.empty<Text, Study>();
  var nextStudyId = 0;

  // Convert Study to immutable view
  func toStudyView(study : Study) : StudyView {
    {
      study with
      participants = study.participants.values().toArray();
      materials = study.materials.toArray();
    };
  };

  public shared ({ caller }) func createStudy(name : Text, materials : [(Text, Storage.ExternalBlob)], schedule : Text, instructor : Principal) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create studies");
    };

    let studyId = nextStudyId.toText();
    let newStudy : Study = {
      id = studyId;
      name;
      participants = Set.empty<Principal>();
      materials = Map.fromIter<Text, Storage.ExternalBlob>(materials.values());
      schedule = ?schedule;
      instructor;
    };
    studies.add(studyId, newStudy);
    nextStudyId += 1;
    studyId;
  };

  // Query function returns stable immutable view
  public query ({ caller }) func getStudy(studyId : Text) : async ?StudyView {
    switch (studies.get(studyId)) {
      case (null) { null };
      case (?study) { ?toStudyView(study) };
    };
  };

  public query ({ caller }) func getStudyIds() : async [Text] {
    studies.keys().toArray();
  };

  public shared ({ caller }) func joinStudy(studyId : Text) : async () {
    switch (studies.get(studyId)) {
      case (null) { Runtime.trap("Study not found") };
      case (?study) {
        study.participants.add(caller);
      };
    };
  };

  public shared ({ caller }) func addMaterial(studyId : Text, materialId : Text, material : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add materials");
    };

    switch (studies.get(studyId)) {
      case (null) { Runtime.trap("Study not found") };
      case (?study) {
        study.materials.add(materialId, material);
      };
    };
  };

  public query ({ caller }) func isFollowing(target : Principal) : async Bool {
    switch (followingMap.get(caller)) {
      case (null) { false };
      case (?followingSet) { followingSet.contains(target) };
    };
  };

  public shared ({ caller }) func followUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };
    if (caller == target) {
      Runtime.trap("Cannot follow yourself");
    };

    switch (userProfiles.get(target)) {
      case (null) { Runtime.trap("Target user does not exist") };
      case (?_) {
        switch (followingMap.get(caller)) {
          case (null) {
            // Initialize new following set for caller
            let newSet = Set.singleton(target);
            followingMap.add(caller, newSet);
          };
          case (?followingSet) {
            if (followingSet.contains(target)) {
              Runtime.trap("Already following this user");
            };
            followingSet.add(target);
          };
        };
      };
    };
  };

  public shared ({ caller }) func unfollowUser(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };

    switch (userProfiles.get(target)) {
      case (null) { Runtime.trap("Target user does not exist") };
      case (?_) {
        switch (followingMap.get(caller)) {
          case (null) { Runtime.trap("Not following this user") };
          case (?followingSet) {
            if (not followingSet.contains(target)) {
              Runtime.trap("Not following this user");
            };
            followingSet.remove(target);
            // Only update map if followingSet is not empty
            if (followingSet.size() > 0) {
              followingMap.add(caller, followingSet);
            };
          };
        };
      };
    };
  };

  public type UserSearchResult = {
    userId : Text;
    displayName : Text;
  };

  public query ({ caller }) func searchUsersByDisplayName(search : Text) : async [UserSearchResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search for other users");
    };

    let searchLower = search.toLower();
    userProfiles.toArray().map(func((userId, profile)) { (userId, profile) }).filter(func((userId, profile)) {
      let displayNameLower = profile.publicProfile.displayName.toLower();
      displayNameLower.contains(#text searchLower);
    }).map(func((userId, profile)) {
      {
        userId = userId.toText();
        displayName = profile.publicProfile.displayName;
      };
    });
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (bannedUsers.contains(caller)) {
      Runtime.trap("User is banned");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(target : Principal) : async ?UserProfile {
    if (target != caller and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Users can only access their own profile");
    };
    switch (userProfiles.get(target)) {
      case (null) { null };
      case (?profile) { ?profile };
    };
  };

  public query ({ caller }) func getUserPublicProfile(target : Principal) : async ?PublicProfile {
    // Public profiles are accessible to everyone (including guests)
    switch (userProfiles.get(target)) {
      case (null) { null };
      case (?profile) { ?profile.publicProfile };
    };
  };

  // --- Follower and Following Retrieval Logic ---
  // These functions allow any authenticated user to view followers/following lists
  // for rendering on profile screens
  public query ({ caller }) func getFollowers(target : Principal) : async [Principal] {
    // Allow any authenticated user (not just the target) to view followers
    // This is needed for profile screens to display follower lists
    let followersList = List.empty<Principal>();
    for ((user, following) in followingMap.entries()) {
      if (following.contains(target)) {
        followersList.add(user);
      };
    };
    followersList.toArray();
  };

  public query ({ caller }) func getFollowing(target : Principal) : async [Principal] {
    // Allow any authenticated user (not just the target) to view following lists
    // This is needed for profile screens to display following lists
    switch (followingMap.get(target)) {
      case (null) { [] };
      case (?followingSet) { followingSet.values().toArray() };
    };
  };

  // Core Story Methods
  let stories = Map.empty<Text, Story>();

  var nextStoryId = 0;

  // Fetch current valid stories for caller feed
  public query ({ caller }) func getFeedStories() : async [Story] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stories feed");
    };

    let now = Time.now();
    let validStories = List.empty<Story>();

    let callerFollowing = switch (followingMap.get(caller)) {
      case (null) { Set.empty<Principal>() };
      case (?followingSet) { followingSet };
    };

    for ((_, story) in stories.entries()) {
      if (now < (story.timestamp + storyExpiryDuration)) {
        if (story.author == caller or callerFollowing.contains(story.author)) {
          validStories.add(story);
        };
      };
    };
    validStories.toArray();
  };

  // Core Create Story method (shared)
  public shared ({ caller }) func createStory(content : Storage.ExternalBlob, mediaType : PostMediaType) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be authenticated to create a story");
    };

    // Check if user has a profile
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User must have profile to create story") };
      case (?_) {};
    };

    let storyId = nextStoryId.toText();
    let newStory : Story = {
      id = storyId;
      author = caller;
      content;
      timestamp = Time.now();
      mediaType;
    };
    stories.add(storyId, newStory);
    nextStoryId += 1;
    storyId;
  };

  public type StoryView = {
    story : Story;
    authorProfile : PublicProfile;
  };

  public query ({ caller }) func getFeedStoryViews() : async [StoryView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stories feed");
    };

    let now = Time.now();
    let validStoryViews = List.empty<StoryView>();

    let callerFollowing = switch (followingMap.get(caller)) {
      case (null) { Set.empty<Principal>() };
      case (?followingSet) { followingSet };
    };

    for ((_, story) in stories.entries()) {
      if (now < (story.timestamp + storyExpiryDuration)) {
        if (story.author == caller or callerFollowing.contains(story.author)) {
          switch (userProfiles.get(story.author)) {
            case (null) {};
            case (?profile) {
              let storyView : StoryView = {
                story;
                authorProfile = profile.publicProfile;
              };
              validStoryViews.add(storyView);
            };
          };
        };
      };
    };
    validStoryViews.toArray();
  };

  public shared ({ caller }) func expireStories() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can expire stories");
    };

    let now = Time.now();
    let expiredStoryIds = List.empty<Text>();

    for ((storyId, story) in stories.entries()) {
      if (now >= (story.timestamp + storyExpiryDuration)) {
        expiredStoryIds.add(storyId);
      };
    };

    for (storyId in expiredStoryIds.values()) {
      stories.remove(storyId);
    };
  };

  public shared ({ caller }) func updateAvatar(newAvatar : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update avatars");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) {
        // Directly update avatar (handles both adding/replacing and removal)
        let updatedProfile = {
          profile with
          publicProfile = {
            profile.publicProfile with
            avatar = newAvatar;
          };
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // --- End Follow System Changes ---

  // Admin only: Apply verified status (blue tick)
  public shared ({ caller }) func adminSetVerified(user : Principal, verified : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can verify users");
    };

    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("Could not find user") };
      case (?profile) {
        let newProfile : UserProfile = {
          profile with publicProfile = {
            profile.publicProfile with verified;
          };
        };
        userProfiles.add(user, newProfile);
      };
    };
  };

  public shared ({ caller }) func adminGrantTeacherBadge(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can grant teacher badge");
    };

    switch (userProfiles.get(user)) {
      case (null) {
        Runtime.trap("Could not find user");
      };
      case (?profile) {
        if (profile.publicProfile.teacherBadge) {
          Runtime.trap("User already has teacher badge");
        };
        let newProfile : UserProfile = {
          profile with
          publicProfile = {
            profile.publicProfile with teacherBadge = true;
          };
        };
        userProfiles.add(user, newProfile);
      };
    };
  };

  public shared ({ caller }) func adminRevokeTeacherBadge(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can revoke teacher badge");
    };

    switch (userProfiles.get(user)) {
      case (null) {
        Runtime.trap("Could not find user");
      };
      case (?profile) {
        if (not profile.publicProfile.teacherBadge) {
          Runtime.trap("User does not have teacher badge");
        };
        let newProfile : UserProfile = {
          profile with
          publicProfile = {
            profile.publicProfile with teacherBadge = false;
          };
        };
        userProfiles.add(user, newProfile);
      };
    };
  };

  // Save profile with admin bootstrap and validation
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (bannedUsers.contains(caller)) {
      Runtime.trap("User is banned");
    };

    // Validate required fields
    if (profile.publicProfile.displayName == "" or profile.phone == "" or profile.countryCode == "") {
      Runtime.trap("Name, country code and phone must not be empty");
    };

    // Validate location is provided (required by UI)
    switch (profile.publicProfile.location) {
      case (null) { Runtime.trap("Location must be provided") };
      case (?loc) {
        if (loc == "") {
          Runtime.trap("Location must not be empty");
        };
      };
    };

    // Save the profile
    userProfiles.add(caller, profile);

    // Admin bootstrap: Grant admin role to fixed admin principals on first profile save
    let currentRole = AccessControl.getUserRole(accessControlState, caller);
    if (currentRole == #guest) {
      if (fixedAdminPrincipals.contains(caller)) {
        // Bootstrap fixed admin
        AccessControl.assignRole(accessControlState, caller, caller, #admin);
      } else {
        // Regular user
        AccessControl.assignRole(accessControlState, caller, caller, #user);
      };
    };
    // If already has a role (including admin), keep it - this allows admins to edit profiles
  };

  public shared ({ caller }) func adminBanUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can ban users");
    };

    if (AccessControl.isAdmin(accessControlState, user)) {
      Runtime.trap("Cannot ban an admin");
    };

    bannedUsers.add(user);
  };

  public shared ({ caller }) func adminUnbanUser(user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can unban users");
    };

    bannedUsers.remove(user);
  };

  public query ({ caller }) func adminIsUserBanned(user : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can check ban status");
    };

    bannedUsers.contains(user);
  };

  public shared ({ caller }) func adminAddEvent(name : Text, date : Time.Time, description : Text, location : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add events");
    };

    let newEvent : Event = {
      name;
      date;
      description;
      location;
    };
    events.add(name, newEvent);
  };

  public query ({ caller }) func checkRole(target : Principal) : async ?AccessControl.UserRole {
    ?AccessControl.getUserRole(accessControlState, target);
  };

  public type PostMediaType = {
    #image;
    #video;
  };

  public type PostView = {
    id : Text;
    author : Principal;
    caption : Text;
    media : ?Storage.ExternalBlob;
    mediaType : PostMediaType;
    timestamp : Time.Time;
    likes : [Principal];
    comments : [Comment];
    isEvent : Bool;
    eventName : ?Text;
  };

  public type Post = {
    author : Principal;
    caption : Text;
    media : ?Storage.ExternalBlob;
    mediaType : PostMediaType;
    timestamp : Time.Time;
    likes : Set.Set<Principal>;
    comments : List.List<Comment>;
    isEvent : Bool;
    eventName : ?Text;
  };

  public type Comment = {
    author : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  let posts = Map.empty<Text, Post>();
  var nextPostId = 0;

  func toPostView(id : Text, post : Post) : PostView {
    {
      id;
      author = post.author;
      caption = post.caption;
      media = post.media;
      mediaType = post.mediaType;
      timestamp = post.timestamp;
      likes = post.likes.values().toArray();
      comments = post.comments.toArray();
      isEvent = post.isEvent;
      eventName = post.eventName;
    };
  };

  public shared ({ caller }) func createPost(caption : Text, media : ?Storage.ExternalBlob, mediaType : PostMediaType) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    if (bannedUsers.contains(caller)) {
      Runtime.trap("User is banned");
    };

    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User must have profile to create post") };
      case (?_) {
        let postId = nextPostId.toText();
        let newPost : Post = {
          author = caller;
          caption;
          media;
          mediaType;
          timestamp = Time.now();
          likes = Set.empty<Principal>();
          comments = List.empty<Comment>();
          isEvent = false;
          eventName = null;
        };
        posts.add(postId, newPost);
        nextPostId += 1;
        postId;
      };
    };
  };

  public shared ({ caller }) func likePost(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    if (bannedUsers.contains(caller)) {
      Runtime.trap("User is banned");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        if (post.likes.contains(caller)) {
          Runtime.trap("Post already liked");
        };
        post.likes.add(caller);
        posts.add(postId, post);
      };
    };
  };

  public shared ({ caller }) func unlikePost(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };

    if (bannedUsers.contains(caller)) {
      Runtime.trap("User is banned");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        if (not post.likes.contains(caller)) {
          Runtime.trap("Post not liked yet");
        };
        post.likes.remove(caller);
        posts.add(postId, post);
      };
    };
  };

  public shared ({ caller }) func addComment(postId : Text, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    if (bannedUsers.contains(caller)) {
      Runtime.trap("User is banned");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let newComment : Comment = {
          author = caller;
          content;
          timestamp = Time.now();
        };
        post.comments.add(newComment);
        posts.add(postId, post);
      };
    };
  };

  // Public post listing - accessible to all users including guests
  public query ({ caller }) func getPosts() : async [PostView] {
    posts.toArray().map(func((id, p)) { toPostView(id, p) });
  };

  // Messaging
  public type Message = {
    sender : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type Conversation = {
    participants : [Principal];
    messages : List.List<Message>;
  };

  public type ConversationView = {
    participants : [Principal];
    messages : [Message];
  };

  let conversations = Map.empty<Text, Conversation>();

  func toConversationView(conversation : Conversation) : ConversationView {
    {
      participants = conversation.participants;
      messages = conversation.messages.toArray();
    };
  };

  public type ConversationSummary = {
    participant : Principal;
    lastMessageTime : Time.Time;
    lastMessageSnippet : Text;
  };

  public shared ({ caller }) func sendMessage(receiver : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    if (bannedUsers.contains(caller)) {
      Runtime.trap("User is banned");
    };

    if (userProfiles.get(caller) == null) {
      Runtime.trap("Must have profile to send messages");
    };

    let conversationId = getConversationId(caller, receiver);

    let newMessage : Message = {
      sender = caller;
      content = content;
      timestamp = Time.now();
    };

    switch (conversations.get(conversationId)) {
      case (null) {
        let newConversation : Conversation = {
          participants = [caller, receiver];
          messages = List.fromArray([newMessage]);
        };
        conversations.add(conversationId, newConversation);
      };
      case (?conversation) {
        conversation.messages.add(newMessage);
        conversations.add(conversationId, conversation);
      };
    };
  };

  public query ({ caller }) func getConversation(otherUser : Principal) : async ?ConversationView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };

    if (bannedUsers.contains(caller)) {
      Runtime.trap("User is banned");
    };

    if (userProfiles.get(caller) == null) {
      Runtime.trap("Must have profile to view conversations");
    };

    let conversationId = getConversationId(caller, otherUser);
    switch (conversations.get(conversationId)) {
      case (null) { null };
      case (?conversation) {
        // Verify caller is a participant
        let isParticipant = conversation.participants.find(
          func(p : Principal) : Bool { p == caller }
        );
        switch (isParticipant) {
          case (null) { Runtime.trap("Unauthorized: Not a participant in this conversation") };
          case (?_) { ?toConversationView(conversation) };
        };
      };
    };
  };

  // Admin-only: Get entire conversation (no check for "Is participant")
  public query ({ caller }) func adminGetConversation(_adminTargetUser : Principal, otherUser : Principal) : async ?ConversationView {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access any conversation");
    };

    switch (conversations.get(getConversationId(_adminTargetUser, otherUser))) {
      case (null) { null };
      case (?conversation) { ?toConversationView(conversation) };
    };
  };

  // Util functions to allow admin to get full conversation list for a user
  public query ({ caller }) func adminGetConversationList(targetUser : Principal) : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access any conversation");
    };

    let result = List.empty<Principal>();
    for ((convId, conv) in conversations.entries()) {
      // Only include conversations where targetUser is a participant
      let isParticipant = conv.participants.find(
        func(p) { p == targetUser }
      );
      switch (isParticipant) {
        case (?p) {
          if (p == targetUser) {
            let recipient = conv.participants.find(
              func(p) { p != targetUser }
            );
            switch (recipient) {
              case (null) {};
              case (?r) { result.add(r) };
            };
          };
        };
        case (null) {};
      };
    };
    result.toArray();
  };

  // Util get conversation id
  func getConversationId(user1 : Principal, user2 : Principal) : Text {
    let id1 = user1.toText();
    let id2 = user2.toText();
    if (id1 < id2) { id1 # "_" # id2 } else { id2 # "_" # id1 };
  };

  public type Channel = {
    name : Text;
    postIds : List.List<Text>;
  };

  let channels = Map.empty<Text, Channel>();

  public shared ({ caller }) func addToChannel(channelName : Text, postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add posts to channels");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let newPostIds = List.empty<Text>();
        switch (channels.get(channelName)) {
          case (null) {};
          case (?channel) {
            newPostIds.addAll(channel.postIds.values());
          };
        };
        newPostIds.add(postId);
        let newChannel : Channel = {
          name = channelName;
          postIds = newPostIds;
        };
        channels.add(channelName, newChannel);
      };
    };
  };

  public query ({ caller }) func getChannelPosts(channelName : Text) : async [PostView] {
    // Public content - accessible to all including guests
    switch (channels.get(channelName)) {
      case (null) { Array.empty<PostView>() };
      case (?channel) {
        let postViews = List.empty<PostView>();
        for (postId in channel.postIds.values()) {
          switch (posts.get(postId)) {
            case (null) {};
            case (?post) {
              postViews.add(toPostView(postId, post));
            };
          };
        };
        postViews.toArray();
      };
    };
  };

  public shared ({ caller }) func addLesson(title : Text, content : Text, media : ?Storage.ExternalBlob) : async () {
    ensureCanCreateContent(caller);
    let newLesson : Lesson = {
      title;
      content;
      media;
    };
    lessons.add(title, newLesson);
  };

  // Learning Corner (lessons)
  public type Lesson = {
    title : Text;
    content : Text;
    media : ?Storage.ExternalBlob;
  };

  let lessons = Map.empty<Text, Lesson>();

  public query ({ caller }) func getLesson(title : Text) : async ?Lesson {
    // Public educational content - accessible to all including guests
    lessons.get(title);
  };

  public query ({ caller }) func getAllLessons() : async [Lesson] {
    // Public educational content - accessible to all including guests
    lessons.values().toArray();
  };

  func ensureCanCreateContent(caller : Principal) : () {
    if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
      return;
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User must have profile to create content");
      };
      case (?profile) {
        if (not profile.publicProfile.teacherBadge) {
          Runtime.trap("Content creation is restricted to admins and users with the teacher badge");
        };
      };
    };
  };

  // Events
  public type Event = {
    name : Text;
    date : Time.Time;
    description : Text;
    location : ?Text;
  };

  let events = Map.empty<Text, Event>();

  public shared ({ caller }) func addEvent(name : Text, date : Time.Time, description : Text, location : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add events");
    };

    let newEvent : Event = {
      name;
      date;
      description;
      location;
    };
    events.add(name, newEvent);
  };

  public query ({ caller }) func getEvent(name : Text) : async ?Event {
    // Public event information - accessible to all including guests
    events.get(name);
  };

  public query ({ caller }) func getAllEvents() : async [Event] {
    // Public event information - accessible to all including guests
    events.values().toArray();
  };

  // Event posts (extended post type support) - now store post IDs
  let eventPosts = Map.empty<Text, List.List<Text>>();

  public shared ({ caller }) func createEventPost(eventName : Text, caption : Text, media : ?Storage.ExternalBlob, mediaType : PostMediaType) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create event posts");
    };

    if (bannedUsers.contains(caller)) {
      Runtime.trap("User is banned");
    };

    // Check if event exists
    switch (events.get(eventName)) {
      case (null) { Runtime.trap("Event does not exist") };
      case (?_) {};
    };

    // Check user has profile
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User must have profile to create event post") };
      case (?_) {};
    };

    // Create the new post
    let postId = nextPostId.toText();
    let newPost : Post = {
      author = caller;
      caption;
      media;
      mediaType;
      timestamp = Time.now();
      likes = Set.empty<Principal>();
      comments = List.empty<Comment>();
      isEvent = true;
      eventName = ?eventName;
    };

    let postIdsForEvent = switch (eventPosts.get(eventName)) {
      case (null) {
        let newList = List.empty<Text>();
        newList.add(postId);
        newList;
      };
      case (?existingPostIds) {
        existingPostIds.add(postId);
        existingPostIds;
      };
    };

    eventPosts.add(eventName, postIdsForEvent);
    posts.add(postId, newPost);
    nextPostId += 1;
    postId;
  };
};
