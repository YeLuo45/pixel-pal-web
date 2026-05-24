/**
 * V146 EmotionMemoryTab Tests
 * 
 * Tests for the EmotionMemoryTab component logic:
 * - getRelativeTime helper function
 * - EMOTION_EMOJI mapping
 * - Filter logic
 * - Empty state logic
 * - Intensity calculation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ============================================
// Pure Functions to test (copied from EmotionMemoryTab)
// ============================================

const EMOTION_EMOJI: Record<string, string> = {
  joy: '😊', sadness: '😢', anger: '😠', fear: '😨',
  surprise: '😲', anticipation: '🤔', trust: '🤝', disgust: '😒',
};

function getRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

interface EmotionMemory {
  id: string;
  emotionType: string;
  intensity: number;
  trigger: string;
  timestamp: number;
  sessionId: string;
}

function filterMemories(memories: EmotionMemory[], filterType: string): EmotionMemory[] {
  const emotionTypes = ['all', 'joy', 'sadness', 'anger', 'fear', 'surprise', 'anticipation', 'trust', 'disgust'];
  if (!emotionTypes.includes(filterType)) return memories;
  return filterType === 'all' ? memories : memories.filter(m => m.emotionType === filterType);
}

function calculateIntensity(intensity: number): number {
  return Math.round(intensity * 100);
}

function getEmptyStateMessage(memories: EmotionMemory[], filterType: string, filterTypes: string[]): string {
  const filtered = filterMemories(memories, filterType);
  if (filtered.length > 0) return '';
  if (memories.length === 0) return 'No emotion memories yet';
  return 'No emotions match this filter';
}

// ============================================
// Mock EmotionMemoryStore to avoid IndexedDB in Node.js
// ============================================

const mockMemories: EmotionMemory[] = [
  { id: '1', emotionType: 'joy', intensity: 0.8, trigger: 'Happy moment', timestamp: Date.now() - 60000, sessionId: 'session-1' },
  { id: '2', emotionType: 'sadness', intensity: 0.5, trigger: 'Bad news', timestamp: Date.now() - 3600000, sessionId: 'session-1' },
  { id: '3', emotionType: 'anger', intensity: 0.9, trigger: 'Frustrating event', timestamp: Date.now() - 7200000, sessionId: 'session-2' },
  { id: '4', emotionType: 'joy', intensity: 0.7, trigger: 'Great achievement', timestamp: Date.now() - 86400000, sessionId: 'session-1' },
];

vi.mock('../../src/services/emotion/EmotionMemoryStore', () => ({
  EmotionMemoryStore: vi.fn().mockImplementation(() => ({
    init: vi.fn(async () => {}),
    loadRecentEmotions: vi.fn(async () => mockMemories),
    getEmotionsByType: vi.fn(async (type: string) => mockMemories.filter(m => m.emotionType === type)),
    getSessionId: () => 'test-session',
  })),
  emotionMemoryStore: {
    loadRecentEmotions: vi.fn(async () => mockMemories),
    getEmotionsByType: vi.fn(async (type: string) => mockMemories.filter(m => m.emotionType === type)),
    getSessionId: () => 'test-session',
  },
}));

// ============================================
// Tests
// ============================================

describe('EmotionMemoryTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('EMOTION_EMOJI', () => {
    it('maps joy to 😊', () => {
      expect(EMOTION_EMOJI['joy']).toBe('😊');
    });

    it('maps sadness to 😢', () => {
      expect(EMOTION_EMOJI['sadness']).toBe('😢');
    });

    it('maps anger to 😠', () => {
      expect(EMOTION_EMOJI['anger']).toBe('😠');
    });

    it('maps fear to 😨', () => {
      expect(EMOTION_EMOJI['fear']).toBe('😨');
    });

    it('maps surprise to 😲', () => {
      expect(EMOTION_EMOJI['surprise']).toBe('😲');
    });

    it('maps anticipation to 🤔', () => {
      expect(EMOTION_EMOJI['anticipation']).toBe('🤔');
    });

    it('maps trust to 🤝', () => {
      expect(EMOTION_EMOJI['trust']).toBe('🤝');
    });

    it('maps disgust to 😒', () => {
      expect(EMOTION_EMOJI['disgust']).toBe('😒');
    });
  });

  describe('getRelativeTime', () => {
    it('returns "just now" for timestamps less than 1 minute ago', () => {
      const now = Date.now();
      expect(getRelativeTime(now)).toBe('just now');
      expect(getRelativeTime(now - 30000)).toBe('just now');
      expect(getRelativeTime(now - 59000)).toBe('just now');
    });

    it('returns minutes for timestamps less than 1 hour ago', () => {
      const now = Date.now();
      expect(getRelativeTime(now - 60000)).toBe('1m ago');
      expect(getRelativeTime(now - 120000)).toBe('2m ago');
      expect(getRelativeTime(now - 1800000)).toBe('30m ago');
      expect(getRelativeTime(now - 3540000)).toBe('59m ago');
    });

    it('returns hours for timestamps less than 24 hours ago', () => {
      const now = Date.now();
      expect(getRelativeTime(now - 3600000)).toBe('1h ago');
      expect(getRelativeTime(now - 7200000)).toBe('2h ago');
      expect(getRelativeTime(now - 82800000)).toBe('23h ago');
    });

    it('returns days for timestamps 24 hours or more ago', () => {
      const now = Date.now();
      expect(getRelativeTime(now - 86400000)).toBe('1d ago');
      expect(getRelativeTime(now - 172800000)).toBe('2d ago');
    });
  });

  describe('filterMemories', () => {
    it('returns all memories when filter is "all"', () => {
      const result = filterMemories(mockMemories, 'all');
      expect(result.length).toBe(4);
    });

    it('filters by emotion type correctly', () => {
      const result = filterMemories(mockMemories, 'joy');
      expect(result.length).toBe(2);
      expect(result.every(m => m.emotionType === 'joy')).toBe(true);
    });

    it('returns empty array when no memories match filter', () => {
      const result = filterMemories(mockMemories, 'fear');
      expect(result.length).toBe(0);
    });

    it('handles unknown filter types gracefully', () => {
      const result = filterMemories(mockMemories, 'unknown_type');
      expect(result.length).toBe(4); // Returns all
    });
  });

  describe('calculateIntensity', () => {
    it('converts 0.8 to 80', () => {
      expect(calculateIntensity(0.8)).toBe(80);
    });

    it('converts 0.5 to 50', () => {
      expect(calculateIntensity(0.5)).toBe(50);
    });

    it('converts 0.0 to 0', () => {
      expect(calculateIntensity(0)).toBe(0);
    });

    it('converts 1.0 to 100', () => {
      expect(calculateIntensity(1.0)).toBe(100);
    });
  });

  describe('getEmptyStateMessage', () => {
    const emotionTypes = ['all', 'joy', 'sadness', 'anger', 'fear', 'surprise', 'anticipation', 'trust', 'disgust'];

    it('returns "No emotion memories yet" when memories is empty', () => {
      const result = getEmptyStateMessage([], 'all', emotionTypes);
      expect(result).toBe('No emotion memories yet');
    });

    it('returns "No emotions match this filter" when filter returns empty', () => {
      const result = getEmptyStateMessage(mockMemories, 'fear', emotionTypes);
      expect(result).toBe('No emotions match this filter');
    });

    it('returns empty string when there are matching memories', () => {
      const result = getEmptyStateMessage(mockMemories, 'all', emotionTypes);
      expect(result).toBe('');
    });
  });

  describe('EmotionMemory interface', () => {
    it('has required fields: id, emotionType, intensity, trigger, timestamp, sessionId', () => {
      const memory: EmotionMemory = {
        id: 'test-id',
        emotionType: 'joy',
        intensity: 0.8,
        trigger: 'Test trigger',
        timestamp: Date.now(),
        sessionId: 'test-session',
      };

      expect(memory.id).toBe('test-id');
      expect(memory.emotionType).toBe('joy');
      expect(memory.intensity).toBe(0.8);
      expect(memory.trigger).toBe('Test trigger');
      expect(memory.timestamp).toBeDefined();
      expect(memory.sessionId).toBe('test-session');
    });
  });
});