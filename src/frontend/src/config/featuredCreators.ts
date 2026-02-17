// Featured creators allowlist (temporary until backend curation is exposed)
// In production, this would be managed by admins through the backend
export const FEATURED_CREATOR_PRINCIPALS: string[] = [
  // Add principal IDs here as creators are featured
  // Example: '2vxsx-fae'
];

// Helper to check if a principal is featured
export function isFeaturedCreator(principal: string): boolean {
  return FEATURED_CREATOR_PRINCIPALS.includes(principal);
}
