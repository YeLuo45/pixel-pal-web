/**
 * Memory Types for PixelPal Companion
 * 
 * Long-term memory system using IndexedDB for persistence.
 * Stores conversation summaries, user preferences, pet milestones, etc.
 */

export interface MemoryEntry {
  id: string;
  type: MemoryType;
  content: string;
  importance: number;         // 0-10, auto-summarization threshold
  createdAt: number;          // Unix timestamp ms
  updatedAt: number;
  lastAccessedAt: number;
  accessCount: number;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export type MemoryType = 
  | 'conversation_summary'   // Summarized conversation topics
  | 'user_preference'        // User likes/dislikes, habits
  | 'pet_milestone'          // Pet reached a new state/achievement
  | 'interaction_log'        // Specific interaction record
  | 'fact'                   // Factual information about user
  | 'preference'             // User preference (shorter term)
  | 'routine'                // User daily/weekday routine
  | 'custom';                // Custom memory entry

export interface MemoryQuery {
  type?: MemoryType;
  tags?: string[];
  minImportance?: number;
  since?: number;            // Unix timestamp, filter by createdAt
  limit?: number;
  offset?: number;
}

export interface MemoryStats {
  totalEntries: number;
  byType: Record<MemoryType, number>;
  oldestEntry: number | null;
  newestEntry: number | null;
  averageImportance: number;
}

export interface MemorySummary {
  recentTopics: string[];       // Last 5 conversation topics
  userPreferences: string[];    // Known user preferences
  petMilestones: string[];      // Milestone descriptions
  keyFacts: string[];           // Important facts about user
  lastUpdated: number;
}

// Memory importance thresholds
export const MEMORY_IMPORTANCE = {
  TRIVIAL: 1,
  LOW: 3,
  NORMAL: 5,
  IMPORTANT: 7,
  CRITICAL: 9,
} as const;

// Auto-summarize if access count exceeds this (for low-importance entries)
export const AUTO_SUMMARIZE_THRESHOLD = 10;

// Compress memory if it exceeds this many entries
export const MAX_MEMORY_ENTRIES = 500;

// Compress to keep this many entries per type
export const COMPRESS_KEEP_PER_TYPE = 50;
