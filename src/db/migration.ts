/**
 * Migration utility: localStorage/IndexedDB → SQLite
 * 
 * This module migrates existing data from the old storage systems
 * (localStorage and IndexedDB) to the new SQLite database.
 * Migration is one-time and transparent to the user.
 */

import { getDB } from './index';
import { messages, memories, settings, personas, migrations, type NewMessage, type NewMemory } from './schema';

const MIGRATION_KEY = 'pixelpal_sqlite_migrated';
const MIGRATION_NAME = 'v113_initial';

/**
 * Check if migration has already been applied
 */
export async function isMigrationNeeded(): Promise<boolean> {
  try {
    const db = getDB();
    const result = await db.select().from(migrations).where(
      (row) => row.name === MIGRATION_NAME
    );
    return result.length === 0;
  } catch {
    // Table might not exist yet
    return true;
  }
}

/**
 * Run all migrations from old storage to SQLite
 */
export async function runMigrations(): Promise<void> {
  const db = getDB();

  // Check if already migrated
  if (!(await isMigrationNeeded())) {
    console.log('[Migration] Already migrated, skipping');
    return;
  }

  console.log('[Migration] Starting data migration...');

  // Run each migration in order
  await migrateMessages();
  await migrateMemories();
  await migrateSettings();
  await migratePersonas();

  // Mark migration as complete
  await db.insert(migrations).values({
    name: MIGRATION_NAME,
    appliedAt: new Date(),
  });

  // Mark localStorage migration flag
  localStorage.setItem(MIGRATION_KEY, 'true');

  console.log('[Migration] Complete!');
}

/**
 * Migrate chat messages from localStorage
 */
async function migrateMessages(): Promise<void> {
  const db = getDB();
  
  try {
    // Try to get messages from localStorage (V65-V112 format)
    const storedMessages = localStorage.getItem('chat_messages');
    if (!storedMessages) {
      console.log('[Migration] No legacy messages found');
      return;
    }

    const parsed = JSON.parse(storedMessages);
    const messagesArray: Array<{
      id: string;
      role: string;
      content: string;
      channel?: string;
      timestamp?: number;
      metadata?: string;
    }> = Array.isArray(parsed) ? parsed : [];

    if (messagesArray.length === 0) return;

    const newMessages: NewMessage[] = messagesArray.map((m) => ({
      id: m.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      role: (m.role as 'user' | 'assistant' | 'system') || 'user',
      content: m.content || '',
      channel: m.channel || 'web',
      timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
      metadata: m.metadata || null,
      personaId: null,
    }));

    for (const msg of newMessages) {
      try {
        await db.insert(messages).values(msg).onConflictDoNothing();
      } catch (e) {
        // Ignore duplicates
      }
    }

    console.log(`[Migration] Migrated ${newMessages.length} messages`);
  } catch (e) {
    console.warn('[Migration] Failed to migrate messages:', e);
  }
}

/**
 * Migrate memories from IndexedDB (pixel-pal-memory DB)
 */
async function migrateMemories(): Promise<void> {
  const db = getDB();

  try {
    // Open IndexedDB if it exists
    const idbRequest = indexedDB.open('pixel-pal-memory', 1);
    
    await new Promise<void>((resolve, reject) => {
      idbRequest.onsuccess = async () => {
        const idb = idbRequest.result;
        if (idb.objectStoreNames.contains('memories')) {
          const tx = idb.transaction('memories', 'readonly');
          const store = tx.objectStore('memories');
          const getAll = store.getAll();

          getAll.onsuccess = async () => {
            const records = getAll.result as Array<{
              id?: string;
              content: string;
              tags?: string;
              createdAt?: number;
            }>;

            for (const r of records) {
              try {
                const newMemory: NewMemory = {
                  id: r.id || `mem_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                  content: r.content || '',
                  embedding: null,
                  tags: r.tags || null,
                  createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
                  updatedAt: null,
                  isArchived: false,
                };
                await db.insert(memories).values(newMemory).onConflictDoNothing();
              } catch {
                // Ignore duplicates
              }
            }
            console.log(`[Migration] Migrated ${records.length} memories`);
            resolve();
          };

          getAll.onerror = () => {
            console.warn('[Migration] Failed to read from IndexedDB');
            resolve();
          };
        } else {
          resolve();
        }
      };

      idbRequest.onerror = () => {
        console.warn('[Migration] IndexedDB not available');
        resolve();
      };
    });
  } catch (e) {
    console.warn('[Migration] Memory migration skipped:', e);
  }
}

/**
 * Migrate settings from localStorage
 */
async function migrateSettings(): Promise<void> {
  const db = getDB();

  try {
    // Settings were stored as individual localStorage keys
    const settingKeys = [
      'theme_mode',
      'language',
      'active_persona_id',
      'sidebar_collapsed',
    ];

    for (const key of settingKeys) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          await db.insert(settings).values({
            key,
            value: JSON.stringify(value),
            updatedAt: new Date(),
          }).onConflictDoNothing();
        } catch {
          // Ignore duplicates
        }
      }
    }

    console.log('[Migration] Migrated settings');
  } catch (e) {
    console.warn('[Migration] Settings migration skipped:', e);
  }
}

/**
 * Migrate personas from personaStorage service
 */
async function migratePersonas(): Promise<void> {
  // Personas are stored via personaStorage.ts which uses IndexedDB
  // The actual persona data is loaded via the personaStorage service
  // For SQLite, we rely on the service to sync personas to SQLite
  // This is a placeholder for future persona migration
  console.log('[Migration] Persona migration deferred to service layer');
}