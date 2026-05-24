/**
 * EmotionMemoryStore - IndexedDB persistence for cross-session emotion memory
 * 
 * Stores emotion events with session tracking for:
 * - Cross-session continuity (survives browser restarts)
 * - Session-based filtering (per conversation session)
 * - Efficient querying by emotion type and time range
 */

import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { EmotionState } from '../voice/emotionDetector';
import type { TextEmotion } from './emotionService';

// ============================================
// V145: Emotion Memory Types
// ============================================

export interface EmotionMemory {
  id: string;
  emotionType: string;
  intensity: number;
  trigger: string;
  timestamp: number;
  sessionId: string;
}

// idb doesn't export DBSchema types cleanly, so we define inline
interface EmotionDB {
  emotionMemories: {
    key: string;
    value: EmotionMemory;
    indexes: {
      'by-type': string;
      'by-timestamp': number;
      'by-session': string;
    };
  };
}

// ============================================
// V145: EmotionMemoryStore
// ============================================

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB('pixelpal-emotion-memory', 1, {
      upgrade(db) {
        const store = db.createObjectStore('emotionMemories', { keyPath: 'id' });
        store.createIndex('by-type', 'emotionType');
        store.createIndex('by-timestamp', 'timestamp');
        store.createIndex('by-session', 'sessionId');
      },
    });
  }
  return dbPromise;
}

// ============================================
// V145: Session ID Management
// ============================================

const SESSION_KEY = 'pixelpal_emotion_session_id';

function getOrCreateSessionId(): string {
  // Handle Node.js test environment where sessionStorage is not available
  if (typeof sessionStorage === 'undefined') {
    return crypto.randomUUID();
  }
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

// ============================================
// V145: EmotionMemoryStore Class
// ============================================

export class EmotionMemoryStore {
  private sessionId: string;
  private initialized = false;

  constructor() {
    this.sessionId = getOrCreateSessionId();
  }

  /**
   * Initialize the store (called automatically on first use)
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    // Ensure DB is ready
    await getDB();
    this.initialized = true;
  }

  /**
   * Save an emotion event to IndexedDB
   */
  async saveEmotion(emotion: EmotionState, trigger: string): Promise<void> {
    await this.init();
    const db = await getDB();
    
    const memory: EmotionMemory = {
      id: crypto.randomUUID(),
      emotionType: emotion,
      intensity: 50, // Default, actual intensity should come from caller
      trigger,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };
    
    await db.put('emotionMemories', memory);
  }

  /**
   * Save an emotion with full data
   */
  async saveEmotionFull(
    emotionType: string,
    intensity: number,
    trigger: string
  ): Promise<void> {
    await this.init();
    const db = await getDB();
    
    const memory: EmotionMemory = {
      id: crypto.randomUUID(),
      emotionType,
      intensity,
      trigger,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };
    
    await db.put('emotionMemories', memory);
  }

  /**
   * Load recent emotions from storage
   */
  async loadRecentEmotions(limit = 50): Promise<EmotionMemory[]> {
    await this.init();
    const db = await getDB();
    
    // Get all, sort by timestamp desc, then slice
    const all = await db.getAllFromIndex('emotionMemories', 'by-timestamp');
    // Reverse to get newest first
    return all.reverse().slice(0, limit);
  }

  /**
   * Get emotions filtered by type
   */
  async getEmotionsByType(type: string, limit = 50): Promise<EmotionMemory[]> {
    await this.init();
    const db = await getDB();
    
    const byType = await db.getAllFromIndex('emotionMemories', 'by-type', type);
    // Return most recent first (sorted by timestamp desc)
    return byType.reverse().slice(0, limit);
  }

  /**
   * Get emotions for a specific session
   */
  async getEmotionsBySession(sessionId: string, limit = 50): Promise<EmotionMemory[]> {
    await this.init();
    const db = await getDB();
    
    const bySession = await db.getAllFromIndex('emotionMemories', 'by-session', sessionId);
    return bySession.reverse().slice(0, limit);
  }

  /**
   * Get emotions within a time range
   */
  async getEmotionsByTimeRange(startMs: number, endMs: number): Promise<EmotionMemory[]> {
    await this.init();
    const db = await getDB();
    
    const all = await db.getAllFromIndex('emotionMemories', 'by-timestamp');
    return all.filter(m => m.timestamp >= startMs && m.timestamp <= endMs);
  }

  /**
   * Delete all emotion memories (for testing/reset)
   */
  async clearAll(): Promise<void> {
    await this.init();
    const db = await getDB();
    await db.clear('emotionMemories');
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

// ============================================
// V145: Singleton instance
// ============================================

export const emotionMemoryStore = new EmotionMemoryStore();

// ============================================
// V145: Utility functions (for EmotionCurve compatibility)
// ============================================

/**
 * Map EmotionState (from voice detection) to TextEmotion
 * Used for compatibility with existing EmotionCurve/EmotionService
 */
export function mapEmotionStateToTextEmotion(state: EmotionState): TextEmotion {
  const map: Record<EmotionState, TextEmotion> = {
    excited: 'excited',
    calm: 'calm',
    tense: 'anxious',
    low_energy: 'exhausted',
    unknown: 'unknown',
  };
  return map[state] ?? 'unknown';
}