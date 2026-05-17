/**
 * MemoryStore - SQLite-backed memory storage
 * 
 * Replaces IndexedDB-based memory storage with SQLite.
 */

import { getDB } from '../db';
import { memories, type Memory, type NewMemory } from '../db/schema';
import { eq, desc, and, isNull } from 'drizzle-orm';

export interface MemoryEntry {
  id: string;
  content: string;
  tags?: string;
  createdAt: number;
  updatedAt?: number;
  isArchived: boolean;
}

/**
 * Get all non-archived memories, newest first
 */
export async function getMemories(includeArchived: boolean = false): Promise<MemoryEntry[]> {
  const db = getDB();

  let results;
  if (includeArchived) {
    results = await db.select().from(memories).orderBy(desc(memories.createdAt));
  } else {
    results = await db
      .select()
      .from(memories)
      .where(eq(memories.isArchived, false))
      .orderBy(desc(memories.createdAt));
  }

  return results.map(r => ({
    id: r.id,
    content: r.content,
    tags: r.tags || undefined,
    createdAt: r.createdAt.getTime(),
    updatedAt: r.updatedAt?.getTime(),
    isArchived: r.isArchived,
  }));
}

/**
 * Save a new memory
 */
export async function saveMemory(entry: Omit<MemoryEntry, 'id'>): Promise<MemoryEntry> {
  const db = getDB();
  const id = entry.id || `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const newEntry: NewMemory = {
    id,
    content: entry.content,
    embedding: null,
    tags: entry.tags || null,
    createdAt: new Date(entry.createdAt),
    updatedAt: entry.updatedAt ? new Date(entry.updatedAt) : null,
    isArchived: entry.isArchived || false,
  };

  await db.insert(memories).values(newEntry);

  return { ...newEntry, id, createdAt: entry.createdAt };
}

/**
 * Update a memory
 */
export async function updateMemory(id: string, updates: Partial<MemoryEntry>): Promise<void> {
  const db = getDB();

  const updateData: Record<string, unknown> = {};
  if (updates.content !== undefined) updateData.content = updates.content;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.isArchived !== undefined) updateData.isArchived = updates.isArchived;
  if (updates.updatedAt !== undefined) updateData.updatedAt = new Date(updates.updatedAt);

  if (Object.keys(updateData).length > 0) {
    await db.update(memories).set(updateData).where(eq(memories.id, id));
  }
}

/**
 * Archive a memory (soft delete)
 */
export async function archiveMemory(id: string): Promise<void> {
  const db = getDB();
  await db.update(memories).set({ isArchived: true }).where(eq(memories.id, id));
}

/**
 * Delete a memory permanently
 */
export async function deleteMemory(id: string): Promise<void> {
  const db = getDB();
  await db.delete(memories).where(eq(memories.id, id));
}

/**
 * Search memories by content or tags
 */
export async function searchMemories(query: string): Promise<MemoryEntry[]> {
  const db = getDB();
  const results = await db
    .select()
    .from(memories)
    .where(eq(memories.isArchived, false));

  const queryLower = query.toLowerCase();
  return results
    .filter(r =>
      r.content.toLowerCase().includes(queryLower) ||
      (r.tags && r.tags.toLowerCase().includes(queryLower))
    )
    .map(r => ({
      id: r.id,
      content: r.content,
      tags: r.tags || undefined,
      createdAt: r.createdAt.getTime(),
      updatedAt: r.updatedAt?.getTime(),
      isArchived: r.isArchived,
    }));
}