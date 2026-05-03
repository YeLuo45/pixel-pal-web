/**
 * Memory Storage - IndexedDB persistence layer for PixelPal Companion
 * 
 * Uses the `idb` library for a clean Promise-based IndexedDB API.
 * Database: pixelpal-memory, Object stores:
 *   - memories: MemoryEntry[] keyed by id
 *   - meta: { key: string, value: unknown } for schema version, etc.
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { MemoryEntry, MemoryQuery, MemoryStats, MemorySummary } from './memoryTypes';
import { MAX_MEMORY_ENTRIES, COMPRESS_KEEP_PER_TYPE } from './memoryTypes';

const DB_NAME = 'pixelpal-memory';
const DB_VERSION = 1;

interface PixelPalMemoryDB extends DBSchema {
  memories: {
    key: string;
    value: MemoryEntry;
    indexes: {
      'by-type': string;
      'by-created': number;
      'by-importance': number;
      'by-accessed': number;
    };
  };
  meta: {
    key: string;
    value: { key: string; value: unknown };
  };
}

let dbInstance: IDBPDatabase<PixelPalMemoryDB> | null = null;

// Schema version tracking
const SCHEMA_VERSION_KEY = 'schema_version';
const CURRENT_SCHEMA_VERSION = 1;

/**
 * Initialize (or get) the IndexedDB database instance
 */
export async function getMemoryDB(): Promise<IDBPDatabase<PixelPalMemoryDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<PixelPalMemoryDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Memories object store
      if (!db.objectStoreNames.contains('memories')) {
        const store = db.createObjectStore('memories', { keyPath: 'id' });
        store.createIndex('by-type', 'type', { unique: false });
        store.createIndex('by-created', 'createdAt', { unique: false });
        store.createIndex('by-importance', 'importance', { unique: false });
        store.createIndex('by-accessed', 'lastAccessedAt', { unique: false });
      }

      // Meta object store for schema version, etc.
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

/**
 * Ensure database schema is up to date
 */
async function ensureSchema(db: IDBPDatabase<PixelPalMemoryDB>): Promise<void> {
  const meta = await db.get('meta', SCHEMA_VERSION_KEY);
  const version = (meta?.value as number) ?? 0;

  if (version < CURRENT_SCHEMA_VERSION) {
    // Future migrations go here
    await db.put('meta', { key: SCHEMA_VERSION_KEY, value: CURRENT_SCHEMA_VERSION });
  }
}

/**
 * Add a new memory entry
 */
export async function addMemory(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt' | 'lastAccessedAt' | 'accessCount'>): Promise<MemoryEntry> {
  const db = await getMemoryDB();
  await ensureSchema(db);

  const now = Date.now();
  const fullEntry: MemoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    lastAccessedAt: now,
    accessCount: 0,
  };

  await db.put('memories', fullEntry);
  return fullEntry;
}

/**
 * Update an existing memory entry
 */
export async function updateMemory(id: string, updates: Partial<MemoryEntry>): Promise<MemoryEntry | null> {
  const db = await getMemoryDB();
  const existing = await db.get('memories', id);
  if (!existing) return null;

  const updated: MemoryEntry = {
    ...existing,
    ...updates,
    id, // prevent id change
    updatedAt: Date.now(),
  };

  await db.put('memories', updated);
  return updated;
}

/**
 * Delete a memory entry
 */
export async function deleteMemory(id: string): Promise<boolean> {
  const db = await getMemoryDB();
  const existing = await db.get('memories', id);
  if (!existing) return false;
  await db.delete('memories', id);
  return true;
}

/**
 * Get a single memory entry by id (increments accessCount)
 */
export async function getMemory(id: string): Promise<MemoryEntry | null> {
  const db = await getMemoryDB();
  const entry = await db.get('memories', id);
  if (!entry) return null;

  // Increment access count and update last accessed
  const updated = {
    ...entry,
    accessCount: entry.accessCount + 1,
    lastAccessedAt: Date.now(),
  };
  await db.put('memories', updated);
  return updated;
}

/**
 * Query memories with filters
 */
export async function queryMemories(query: MemoryQuery = {}): Promise<MemoryEntry[]> {
  const db = await getMemoryDB();
  const {
    type,
    tags,
    minImportance,
    since,
    limit = 100,
    offset = 0,
  } = query;

  let results = await db.getAllFromIndex('memories', 'by-created');

  // Filter by type
  if (type) {
    results = results.filter((e) => e.type === type);
  }

  // Filter by tags (all tags must match)
  if (tags && tags.length > 0) {
    results = results.filter((e) => tags.every((t) => e.tags.includes(t)));
  }

  // Filter by minimum importance
  if (minImportance !== undefined) {
    results = results.filter((e) => e.importance >= minImportance);
  }

  // Filter by creation time
  if (since !== undefined) {
    results = results.filter((e) => e.createdAt >= since);
  }

  // Sort by lastAccessedAt descending (most recently accessed first)
  results.sort((a, b) => b.lastAccessedAt - a.lastAccessedAt);

  // Apply pagination
  return results.slice(offset, offset + limit);
}

/**
 * Get all memories (full list)
 */
export async function getAllMemories(): Promise<MemoryEntry[]> {
  const db = await getMemoryDB();
  return db.getAll('memories');
}

/**
 * Get memory statistics
 */
export async function getMemoryStats(): Promise<MemoryStats> {
  const db = await getMemoryDB();
  const all = await db.getAll('memories');

  if (all.length === 0) {
    return {
      totalEntries: 0,
      byType: {} as Record<MemoryEntry['type'], number>,
      oldestEntry: null,
      newestEntry: null,
      averageImportance: 0,
    };
  }

  const byType: Record<string, number> = {};
  let totalImportance = 0;
  let oldest: number | null = null;
  let newest: number | null = null;

  for (const entry of all) {
    byType[entry.type] = (byType[entry.type] ?? 0) + 1;
    totalImportance += entry.importance;
    if (oldest === null || entry.createdAt < oldest) oldest = entry.createdAt;
    if (newest === null || entry.createdAt > newest) newest = entry.createdAt;
  }

  return {
    totalEntries: all.length,
    byType: byType as Record<MemoryEntry['type'], number>,
    oldestEntry: oldest,
    newestEntry: newest,
    averageImportance: totalImportance / all.length,
  };
}

/**
 * Get a memory summary for context injection
 */
export async function getMemorySummary(): Promise<MemorySummary> {
  const db = await getMemoryDB();
  const all = await db.getAll('memories');

  // Sort by createdAt descending for recent topics
  const byCreated = [...all].sort((a, b) => b.createdAt - a.createdAt);

  const recentTopics = byCreated
    .filter((e) => e.type === 'conversation_summary')
    .slice(0, 5)
    .map((e) => e.content);

  const userPreferences = byCreated
    .filter((e) => e.type === 'user_preference' || e.type === 'preference')
    .slice(0, 10)
    .map((e) => e.content);

  const petMilestones = byCreated
    .filter((e) => e.type === 'pet_milestone')
    .map((e) => e.content);

  const keyFacts = byCreated
    .filter((e) => e.type === 'fact' && e.importance >= 5)
    .slice(0, 10)
    .map((e) => e.content);

  return {
    recentTopics,
    userPreferences,
    petMilestones,
    keyFacts,
    lastUpdated: Date.now(),
  };
}

/**
 * Build a compact memory context string for system prompt injection
 */
export async function buildMemoryContext(maxLength = 2000): Promise<string> {
  const summary = await getMemorySummary();
  const parts: string[] = [];

  if (summary.keyFacts.length > 0) {
    parts.push(`[USER FACTS]\n${summary.keyFacts.join('\n')}`);
  }

  if (summary.userPreferences.length > 0) {
    parts.push(`[PREFERENCES]\n${summary.userPreferences.join('\n')}`);
  }

  if (summary.recentTopics.length > 0) {
    parts.push(`[RECENT TOPICS]\n${summary.recentTopics.join('\n')}`);
  }

  if (summary.petMilestones.length > 0) {
    parts.push(`[PET MILESTONES]\n${summary.petMilestones.join('\n')}`);
  }

  const context = parts.join('\n\n');
  if (context.length <= maxLength) return context;

  // Truncate if too long
  return context.slice(0, maxLength - 3) + '...';
}

/**
 * Compact memory storage when it exceeds MAX_MEMORY_ENTRIES
 * Keeps high-importance and frequently accessed entries
 */
export async function compactMemory(): Promise<{ removed: number; kept: number }> {
  const db = await getMemoryDB();
  const all = await db.getAll('memories');

  if (all.length <= MAX_MEMORY_ENTRIES) {
    return { removed: 0, kept: all.length };
  }

  // Score each entry: importance * log(accessCount + 1)
  const scored = all.map((e) => ({
    entry: e,
    score: e.importance * Math.log(e.accessCount + 1),
  }));

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Keep top entries per type (COMPRESS_KEEP_PER_TYPE)
  const typeCount: Record<string, number> = {};
  const toKeep: Set<string> = new Set();

  for (const { entry } of scored) {
    const count = typeCount[entry.type] ?? 0;
    if (count < COMPRESS_KEEP_PER_TYPE) {
      toKeep.add(entry.id);
      typeCount[entry.type] = count + 1;
    }
  }

  // Also always keep entries with importance >= 7
  for (const { entry } of scored) {
    if (entry.importance >= 7) {
      toKeep.add(entry.id);
    }
  }

  // Delete entries not in toKeep
  let removed = 0;
  for (const { entry } of scored) {
    if (!toKeep.has(entry.id)) {
      await db.delete('memories', entry.id);
      removed++;
    }
  }

  return { removed, kept: toKeep.size };
}

/**
 * Clear all memories (use with caution)
 */
export async function clearAllMemories(): Promise<void> {
  const db = await getMemoryDB();
  await db.clear('memories');
}

/**
 * Get memories by type
 */
export async function getMemoriesByType(type: MemoryEntry['type']): Promise<MemoryEntry[]> {
  return queryMemories({ type, limit: 200 });
}
