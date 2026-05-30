/**
 * V168: SessionContextManager Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SessionContextManager } from '../SessionContextManager';
import { DreamMemory } from '../../DreamMemory';
import type { MemoryEntry } from '../../MemoryTypes';

describe('SessionContextManager', () => {
  let scm: SessionContextManager;
  let dm: DreamMemory;

  const createMemory = (overrides: Partial<MemoryEntry> = {}): MemoryEntry => ({
    id: `mem_${Math.random().toString(36).slice(2)}`,
    layer: 'L4',
    content: 'Test memory',
    importance: 50,
    accessCount: 0,
    lastAccessed: Date.now(),
    createdAt: Date.now(),
    tags: ['test'],
    ...overrides,
  });

  beforeEach(() => {
    dm = new DreamMemory();
    scm = new SessionContextManager(dm);
  });

  afterEach(() => {
    dm.destroy();
  });

  describe('trackTurn', () => {
    it('should track a single turn', () => {
      scm.trackTurn('Hello', 'Hi there!');
      expect(scm.getTurnCount()).toBe(1);
    });

    it('should track multiple turns', () => {
      scm.trackTurn('Hello', 'Hi there!');
      scm.trackTurn('How are you?', 'I am fine!');
      scm.trackTurn('What can you do?', 'Many things!');
      expect(scm.getTurnCount()).toBe(3);
    });

    it('should store turn data correctly', () => {
      scm.trackTurn('User message', 'Agent response');
      const turns = scm.getTurns();
      expect(turns[0].user).toBe('User message');
      expect(turns[0].agent).toBe('Agent response');
      expect(turns[0].timestamp).toBeDefined();
    });
  });

  describe('getSessionContext', () => {
    it('should return empty when no memories', () => {
      const context = scm.getSessionContext('test query');
      expect(context).toEqual([]);
    });

    it('should return relevant session memories', () => {
      const mem1 = dm.store({ layer: 'L4', content: 'user likes coffee', importance: 70, tags: ['preference'] });
      const mem2 = dm.store({ layer: 'L4', content: 'user prefers dark mode', importance: 65, tags: ['preference'] });
      
      const context = scm.getSessionContext('coffee');
      expect(context.length).toBeGreaterThan(0);
      expect(context.some(m => m.id === mem1.id)).toBe(true);
    });

    it('should respect maxEntries parameter', () => {
      for (let i = 0; i < 10; i++) {
        dm.store({ layer: 'L4', content: `memory ${i}`, importance: 50 + i, tags: ['test'] });
      }
      
      const context = scm.getSessionContext('memory', 3);
      expect(context.length).toBeLessThanOrEqual(3);
    });

    it('should prioritize higher importance', () => {
      dm.store({ layer: 'L4', content: 'low priority item', importance: 30, tags: ['test'] });
      dm.store({ layer: 'L4', content: 'high priority item', importance: 90, tags: ['test'] });
      
      const context = scm.getSessionContext('item');
      expect(context[0].importance).toBeGreaterThanOrEqual(context[1].importance);
    });
  });

  describe('getSessionSummary', () => {
    it('should return session info', () => {
      const summary = scm.getSessionSummary();
      expect(summary.sessionId).toBeDefined();
      expect(summary.turnCount).toBe(0);
      expect(summary.keyMemories).toEqual([]);
      expect(summary.topicHints).toEqual([]);
      expect(summary.startTime).toBeDefined();
    });

    it('should count turns correctly', () => {
      scm.trackTurn('Hello', 'Hi');
      scm.trackTurn('Hello', 'Hi');
      scm.trackTurn('Hello', 'Hi');
      
      const summary = scm.getSessionSummary();
      expect(summary.turnCount).toBe(3);
    });

    it('should extract topic hints from tags', () => {
      dm.store({ layer: 'L4', content: 'coffee preference', importance: 70, tags: ['coffee', 'drink'] });
      dm.store({ layer: 'L4', content: 'tea preference', importance: 60, tags: ['tea', 'drink'] });
      dm.store({ layer: 'L4', content: 'work task', importance: 50, tags: ['work'] });
      
      const summary = scm.getSessionSummary();
      expect(summary.topicHints).toContain('drink');
    });

    it('should include key memories with high importance', () => {
      dm.store({ layer: 'L4', content: 'important fact', importance: 80, tags: ['key'] });
      dm.store({ layer: 'L4', content: 'less important', importance: 40, tags: ['normal'] });
      
      const summary = scm.getSessionSummary();
      expect(summary.keyMemories.length).toBeGreaterThan(0);
      expect(summary.keyMemories[0].importance).toBeGreaterThanOrEqual(60);
    });
  });

  describe('injectContext', () => {
    it('should return original prompt when no memories', () => {
      const prompt = 'Hello, how are you?';
      const injected = scm.injectContext(prompt);
      expect(injected).toContain(prompt);
    });

    it('should include context header', () => {
      dm.store({ layer: 'L4', content: 'test memory', importance: 70, tags: ['test'] });
      
      const injected = scm.injectContext('Hello');
      expect(injected).toContain('--- Session Context');
      expect(injected).toContain('--- End Context ---');
    });

    it('should include memory content in injected context', () => {
      dm.store({ layer: 'L4', content: 'user likes python', importance: 80, tags: ['preference'] });
      
      const injected = scm.injectContext('what does user like');
      expect(injected).toContain('python');
    });

    it('should include layer and importance in format', () => {
      dm.store({ layer: 'L4', content: 'test content', importance: 75, tags: ['test'] });
      
      const injected = scm.injectContext('test');
      expect(injected).toMatch(/\[L4:75\]/);
    });

    it('should respect maxEntries parameter', () => {
      for (let i = 0; i < 5; i++) {
        dm.store({ layer: 'L4', content: `memory ${i}`, importance: 70 + i, tags: ['test'] });
      }
      
      const injected = scm.injectContext('memory', 2);
      const contextSection = injected.split('--- End Context ---')[0];
      const memoryCount = (contextSection.match(/\[L4:/g) || []).length;
      expect(memoryCount).toBeLessThanOrEqual(2);
    });
  });

  describe('reset', () => {
    it('should clear turns', () => {
      scm.trackTurn('Hello', 'Hi');
      scm.reset();
      expect(scm.getTurnCount()).toBe(0);
    });

    it('should generate new session ID', () => {
      const oldId = scm.getSessionId();
      scm.reset();
      expect(scm.getSessionId()).not.toBe(oldId);
    });

    it('should clear L4 working memory', () => {
      dm.store({ layer: 'L4', content: 'test', importance: 50, tags: ['test'] });
      scm.reset();
      expect(scm.getSessionContext('test').length).toBe(0);
    });
  });

  describe('getSessionId', () => {
    it('should return a valid UUID', () => {
      const id = scm.getSessionId();
      expect(id).toMatch(/^[0-9a-f-]{36}$/i);
    });
  });

  describe('getTurnCount', () => {
    it('should return 0 for new session', () => {
      expect(scm.getTurnCount()).toBe(0);
    });
  });

  describe('getTurns', () => {
    it('should return copy of turns array', () => {
      scm.trackTurn('Hello', 'Hi');
      const turns = scm.getTurns();
      turns.push({ user: 'a', agent: 'b', timestamp: 123 });
      expect(scm.getTurnCount()).toBe(1);
    });
  });
});
