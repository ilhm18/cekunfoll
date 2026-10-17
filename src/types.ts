export interface InstagramUser {
  username: string;
  href?: string;
  timestamp?: number;
  dateStr?: string;
  isDeactivated?: boolean;
  deactivationReason?: string;
}

export type FilterTab =
  | 'not_following_back'
  | 'fans'
  | 'mutual'
  | 'deactivated'
  | 'whitelisted';

export type StatusFilter = 'all' | 'active_only' | 'deactivated_only';

export type SortOrder =
  | 'alphabetical_asc'
  | 'alphabetical_desc'
  | 'status'
  | 'newest'
  | 'oldest';

export interface AnalysisResult {
  following: InstagramUser[];
  followers: InstagramUser[];
  notFollowingBack: InstagramUser[]; // Accounts you follow who don't follow you back (active)
  fans: InstagramUser[];             // Accounts who follow you that you don't follow back
  mutual: InstagramUser[];           // Accounts that follow each other
  deactivated: InstagramUser[];      // Known deleted/deactivated/missing accounts
  exportDate?: string;
  sourceType: 'zip' | 'html' | 'json' | 'manual' | 'demo';
}

export interface HistoricalComparison {
  unfollowedYou: InstagramUser[];
  newFollowers: InstagramUser[];
  oldFollowersCount: number;
  newFollowersCount: number;
}
