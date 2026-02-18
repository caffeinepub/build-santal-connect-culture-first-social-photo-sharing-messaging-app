# Specification

## Summary
**Goal:** Enable users to permanently delete their uploaded photos and videos from the Santal Connect platform.

**Planned changes:**
- Add backend method to delete user-uploaded media files from blob storage and remove associated post metadata
- Add delete button to media post cards in feed and profile views, visible only to post owners and admins
- Implement confirmation dialog before deletion to prevent accidental removal
- Create delete mutation hook in useQueries.ts to handle deletion requests with loading and error states
- Remove deleted posts from UI immediately after successful deletion without page refresh

**User-visible outcome:** Users can delete their uploaded photos and videos by clicking a delete button on each media post, confirming the action in a dialog, and seeing the content immediately removed from their feed and profile.
