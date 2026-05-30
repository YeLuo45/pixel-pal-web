/**
 * V167: Dream Memory Engine - Type Definitions
 * 
 * Defines the core types for the L0-L4 memory hierarchy:
 * - L0 (META): Memory metadata, access patterns, importance scores
 * - L1 (INDEX): Quick lookup index, recent accesses, tags
 * - L2 (GLOBAL): Cross-session facts, user preferences, long-term context
 * - L3 (SKILL): Crystallized skills, learned patterns, procedures
 * - L4 (SESSION): Current session context, working memory
 */

/**
 * Memory layer types
 */
export type Layer = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';

/**
 * Core memory entry structure stored across all layers
 */
export interface MemoryEntry {
  id: string;
  layer: Layer;
  content: string;
  importance: number;        // 0-100
  accessCount: number;
  lastAccessed: number;      // timestamp
  createdAt: number;         // timestamp
  tags: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Input type for creating a new memory entry (without auto-generated fields)
 */
export type MemoryEntryInput = Omit<MemoryEntry, 'id' | 'accessCount' | 'lastAccessed' | 'createdAt'>;

/**
 * Result of a memory consolidation operation
 */
export interface ConsolidationResult {
  consolidated: number;       // Number of memories consolidated
  promoted: number;          // Number promoted to higher layers
  demoted: number;           // Number demoted to lower layers
  discarded: number;         // Number discarded
  errors: string[];          // Any errors encountered
}

/**
 * Session context for a new session
 */
export interface SessionContext {
  sessionId: string;
  startTime: number;
  recentMemories: MemoryEntry[];
  activeSkills: MemoryEntry[];
  workingMemory: MemoryEntry[];
  preferences: MemoryEntry[];
}

/**
 * Filter predicate for querying memories
 */
export type MemoryFilter = (entry: MemoryEntry) => boolean;

/**
 * Tag index entry for quick lookup
 */
export interface TagIndex {
  tag: string;
  memoryIds: string[];
}