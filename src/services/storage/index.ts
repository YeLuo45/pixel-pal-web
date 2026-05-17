/**
 * Storage index - SQLite-backed storage layer
 * 
 * Exports all SQLite-based stores for unified data access.
 * These replace localStorage/IndexedDB based storage.
 */

export { initDB, getDB, isDBInitialized, closeDB } from '../../db';
export { runMigrations, isMigrationNeeded } from '../../db/migration';

// Chat messages
export { getMessages, saveMessage, deleteMessage, clearChannel, getMessageCount, searchMessages } from './chatMessageStore';

// Memories
export { getMemories, saveMemory, updateMemory, archiveMemory, deleteMemory, searchMemories } from './memoryStore';

// Settings
export { getSetting, setSetting, deleteSetting, getAllSettings } from './settingStore';