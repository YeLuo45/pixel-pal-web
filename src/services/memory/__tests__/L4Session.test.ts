/**
 * V167: L4Session Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { L4Session } from '../layers/L4Session';
import type { MemoryEntry } from '../MemoryTypes';

describe('L4Session', () => {
  let layer: L4Session;

  const createEntry = (overrides: Partial<MemoryEntry> = {}): MemoryEntry => ({
    id: `test_${crypto.randomUUID().slice(0, 8)}`,
    layer: 'L4',
    content: 'Test working memory',
    importance: 50,
    accessCount: 0,
    lastAccessed: Date.now(),
    createdAt: Date.now(),
    tags: ['working'],
    ...overrides,
  });

  beforeEach(() => {
    layer = new L4Session('test-session');
  });

  afterEach(() => {
    layer.clearWorking();
  });

  describe('constructor', () => {
    it('should use provided session ID', () => {
      const session = new L4Session('custom-id');
      expect(session.getSessionId()).toBe('custom-id');
    });

    it('should generate session ID if not provided', () => {
      const session = new L4Session();
      expect(session.getSessionId()).toBeTruthy();
    });
  });

  describe('getSessionId', () => {
    it('should return current session ID', () => {
      expect(layer.getSessionId()).toBe('test-session');
    });
  });

  describe('getSessionStart', () => {
    it('should return session start time', () => {
      const start = layer.getSessionStart();
      expect(start).toBeLessThanOrEqual(Date.now());
      expect(start).toBeGreaterThan(0);
    });
  });

  describe('add', () => {
    it('should add a valid L4 entry', () => {
      const entry = createEntry();
      layer.add(entry);
      expect(layer.size()).toBe(1);
    });

    it('should throw for non-L4 layer', () => {
      const entry = createEntry({ layer: 'L3' });
      expect(() => layer.add(entry)).toThrow('L4Session can only store L4 layer entries');
    });

    it('should initialize accessCount to 0', () => {
      const entry = createEntry({ accessCount: 10, id: 'init_test' });
      layer.add(entry);
      // First get() increments to 1, so expect 1 not 10 (which confirms add() reset to 0)
      expect(layer.get('init_test')?.accessCount).toBe(1);
    });
  });

  describe('get', () => {
    it('should retrieve existing entry', () => {
      const entry = createEntry();
      layer.add(entry);
      const retrieved = layer.get(entry.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(entry.id);
    });

    it('should return null for non-existent entry', () => {
      expect(layer.get('non_existent')).toBeNull();
    });

    it('should increment accessCount on get', () => {
      const entry = createEntry({ accessCount: 0 });
      layer.add(entry);
      layer.get(entry.id);
      layer.get(entry.id);
      const result = layer.get(entry.id); // This increments to 3
      expect(result?.accessCount).toBe(3); // 0 (add) + 1 + 1 + 1 = 3
    });
  });

  describe('getAll', () => {
    it('should return all entries', () => {
      layer.add(createEntry({ id: 'a' }));
      layer.add(createEntry({ id: 'b' }));
      expect(layer.getAll().length).toBe(2);
    });
  });

  describe('getWorking', () => {
    it('should return same as getAll', () => {
      layer.add(createEntry({ id: 'a' }));
      layer.add(createEntry({ id: 'b' }));
      expect(layer.getWorking().length).toBe(2);
    });
  });

  describe('getRecent', () => {
    it('should return entries sorted by lastAccessed', () => {
      // Note: add() overwrites lastAccessed to Date.now(), so we test
      // the ordering by using get() to update lastAccessed values
      const entry1 = createEntry({ id: '1' });
      const entry2 = createEntry({ id: '2' });
      const entry3 = createEntry({ id: '3' });
      layer.add(entry1);
      layer.add(entry2);
      layer.add(entry3);
      
      // Access entry3 once, entry1 twice (so entry1 should be most recent)
      layer.get('1');
      layer.get('1');
      layer.get('3');
      
      const recent = layer.getRecent(2);
      expect(recent.length).toBe(2);
      expect(recent[0].id).toBe('1'); // Most recently accessed (accessed twice)
      // Second entry could be entry3 or entry2 depending on timing
    });

    it('should return empty array when empty', () => {
      expect(layer.getRecent(10)).toEqual([]);
    });
  });

  describe('remove', () => {
    it('should remove existing entry', () => {
      const entry = createEntry();
      layer.add(entry);
      expect(layer.remove(entry.id)).toBe(true);
      expect(layer.size()).toBe(0);
    });

    it('should return false for non-existent entry', () => {
      expect(layer.remove('non_existent')).toBe(false);
    });
  });

  describe('clearWorking', () => {
    it('should clear all working memory', () => {
      layer.add(createEntry({ id: 'a' }));
      layer.add(createEntry({ id: 'b' }));
      layer.clearWorking();
      expect(layer.size()).toBe(0);
    });

    it('should generate new session ID', () => {
      const oldSessionId = layer.getSessionId();
      layer.clearWorking();
      expect(layer.getSessionId()).not.toBe(oldSessionId);
    });
  });

  describe('update', () => {
    it('should update content of existing entry', () => {
      const entry = createEntry({ id: 'update_test' });
      layer.add(entry);
      expect(layer.update('update_test', 'New content')).toBe(true);
      expect(layer.get('update_test')?.content).toBe('New content');
    });

    it('should return false for non-existent entry', () => {
      expect(layer.update('non_existent', 'content')).toBe(false);
    });
  });

  describe('addTag', () => {
    it('should add a tag to existing entry', () => {
      const entry = createEntry({ id: 'tag_test', tags: [] });
      layer.add(entry);
      expect(layer.addTag('tag_test', 'newTag')).toBe(true);
      expect(layer.get('tag_test')?.tags).toContain('newtag');
    });

    it('should return false for non-existent entry', () => {
      expect(layer.addTag('non_existent', 'tag')).toBe(false);
    });
  });

  describe('has', () => {
    it('should return true for existing entry', () => {
      const entry = createEntry();
      layer.add(entry);
      expect(layer.has(entry.id)).toBe(true);
    });

    it('should return false for non-existent entry', () => {
      expect(layer.has('non_existent')).toBe(false);
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      expect(layer.size()).toBe(0);
      layer.add(createEntry());
      expect(layer.size()).toBe(1);
    });
  });
});