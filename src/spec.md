# Specification

## Summary
**Goal:** Add an admin-managed Teacher Badge system and use it to control who can create Learning courses/lessons, with clear badge indicators across the app.

**Planned changes:**
- Backend: Store a Teacher Badge boolean on user profiles, expose it via public profile APIs, and add admin-only endpoints to grant/revoke it with persisted updates and authorization checks.
- Backend: Restrict Learning course/lesson creation so only Admin users or Teacher Badge holders can create; keep viewing/listing unchanged.
- Frontend: Add a TeacherBadge UI (small red tick with a mini book icon) and render it anywhere VerifiedAvatarOverlay is used when a user has Teacher Badge=true.
- Frontend: Extend the Admin user moderation UI with controls to grant/revoke Teacher Badge, show current status, display English labels, and show success/error toasts with proper cache invalidation.
- Frontend: In the Learning section, show an “Add Lesson” / “Add Course” entry point only for Admins and Teacher Badge holders; hide/disable for others, with all new user-facing text in English.

**User-visible outcome:** Admins can grant or revoke a Teacher Badge for users; Teacher-badged users and admins can create Learning courses/lessons, and teacher-badged accounts are visually marked with a red tick + mini book badge wherever avatar verification overlays appear.
