/**
 * PixelPal SQLite Database - Drizzle ORM + wa-sqlite
 * 
 * Uses wa-sqlite (WASM SQLite) for browser-native SQLite support.
 * Replaces fragmented localStorage/IndexedDB calls with unified data layer.
 * 
 * Reference: thunderbolt-design architecture (SQLite-first, offline-first)
 */

import { drizzle } from 'drizzle-orm/wa-sqlite';
import { open, type SQLiteDB } from 'wa-sqlite';
import * as schema from './schema';

let dbInstance: ReturnType<typeof drizzle> | null = null;
let rawDb: SQLiteDB | null = null;

const DB_NAME = 'pixelpal.db';

/**
 * Initialize the SQLite database connection
 * Must be called once at app startup before any data operations
 */
export async function initDB(): Promise<ReturnType<typeof drizzle>> {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    // Open SQLite database (creates if not exists)
    rawDb = await open({ filename: DB_NAME });
    
    // Create drizzle wrapper with our schema
    dbInstance = drizzle(rawDb, { schema });
    
    // Create tables if they don't exist
    await createTables();
    
    console.log('[DB] SQLite initialized successfully');
    return dbInstance;
  } catch (error) {
    console.error('[DB] Failed to initialize SQLite:', error);
    throw error;
  }
}

/**
 * Create all tables if they don't exist
 */
async function createTables(): Promise<void> {
  if (!rawDb) return;

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      channel TEXT NOT NULL DEFAULT 'web',
      timestamp INTEGER NOT NULL,
      metadata TEXT,
      persona_id TEXT
    );

    CREATE TABLE IF NOT EXISTS memories (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      embedding TEXT,
      tags TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER,
      is_archived INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS personas (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      avatar TEXT NOT NULL,
      bio TEXT NOT NULL DEFAULT '',
      voice TEXT NOT NULL DEFAULT 'warm',
      is_default INTEGER NOT NULL DEFAULT 0,
      theme TEXT,
      system_prompt TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      config TEXT NOT NULL DEFAULT '{}',
      created_at INTEGER NOT NULL,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp);
    CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel);
    CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at);
    CREATE INDEX IF NOT EXISTS idx_memories_archived ON memories(is_archived);
  `;

  const statements = createTableSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const sql of statements) {
    await rawDb.execute(sql);
  }
}

/**
 * Get the database instance - throws if not initialized
 */
export function getDB(): ReturnType<typeof drizzle> {
  if (!dbInstance) {
    throw new Error('[DB] Database not initialized. Call initDB() first.');
  }
  return dbInstance;
}

/**
 * Check if database is initialized
 */
export function isDBInitialized(): boolean {
  return dbInstance !== null;
}

/**
 * Close the database connection
 */
export async function closeDB(): Promise<void> {
  if (rawDb) {
    rawDb.close();
    rawDb = null;
    dbInstance = null;
    console.log('[DB] SQLite connection closed');
  }
}