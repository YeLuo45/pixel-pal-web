/**
 * V113 Offline-First Architecture
 * 
 * This PR introduces drizzle-orm + wa-sqlite as the unified data layer,
 * replacing fragmented localStorage/IndexedDB calls.
 * 
 * Key changes:
 * - src/db/schema.ts: Drizzle schema for messages/memories/settings/personas/skills
 * - src/db/db.ts: wa-sqlite + Drizzle initialization
 * - src/db/migration.ts: One-time migration from localStorage/IndexedDB
 * - src/services/storage/: SQLite-backed stores (chatMessageStore, memoryStore, settingStore)
 * 
 * Backward compatible: legacy localStorage/IndexedDB paths still work during transition.
 * Migration runs once at startup to backfill existing data.
 */

export { initDB, getDB, isDBInitialized, closeDB } from './db';
export { runMigrations, isMigrationNeeded } from './migration';
export * from './schema';