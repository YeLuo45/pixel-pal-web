/**
 * MemoryManager Tests
 * generic-agent-design Memory Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryManager } from '../MemoryManager';

describe('MemoryManager', () => {
  let manager: MemoryManager;

  beforeEach(() => {
    manager = new MemoryManager();
  });

  afterEach(() => {
    manager.clearAll();
  });

  // ============================================================
  // store
  // ============================================================
  describe('store', () => {
    it('should store memory', () => {
      const id = manager.store({ content: 'hello', importance: 0.5, timestamp: 1000, associations: [] });
      expect(id).toBe('mem-1');
    });

    it('should auto-increment id', () => {
      const id1 = manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: [] });
      const id2 = manager.store({ content: 'b', importance: 0.5, timestamp: 1000, associations: [] });
      expect(id1).toBe('mem-1');
      expect(id2).toBe('mem-2');
    });

    it('should not mutate input', () => {
      const assoc = ['x'];
      manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: assoc });
      assoc.push('y');
      expect(manager.getMemory('mem-1')?.associations).toEqual(['x']);
    });
  });

  // ============================================================
  // retrieve
  // ============================================================
  describe('retrieve', () => {
    it('should retrieve memory', () => {
      const id = manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: [] });
      const memory = manager.retrieve(id);
      expect(memory?.content).toBe('a');
    });

    it('should return null for unknown', () => {
      expect(manager.retrieve('unknown')).toBeNull();
    });
  });

  // ============================================================
  // search
  // ============================================================
  describe('search', () => {
    it('should search by content', () => {
      manager.store({ content: 'hello world', importance: 0.5, timestamp: 1000, associations: [] });
      manager.store({ content: 'goodbye world', importance: 0.5, timestamp: 1000, associations: [] });
      const results = manager.search('hello');
      expect(results).toHaveLength(1);
    });

    it('should be case-insensitive', () => {
      manager.store({ content: 'Hello World', importance: 0.5, timestamp: 1000, associations: [] });
      const results = manager.search('hello');
      expect(results).toHaveLength(1);
    });

    it('should return empty for no match', () => {
      manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: [] });
      expect(manager.search('xyz')).toHaveLength(0);
    });
  });

  // ============================================================
  // decay
  // ============================================================
  describe('decay', () => {
    it('should remove low importance', () => {
      manager.store({ content: 'a', importance: 0.05, timestamp: 1000, associations: [] });
      const removed = manager.decay();
      expect(removed).toBe(1);
    });

    it('should keep high importance', () => {
      manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: [] });
      const removed = manager.decay();
      expect(removed).toBe(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should return stats for empty', () => {
      const stats = manager.getStats();
      expect(stats.total).toBe(0);
    });

    it('should calculate stats', () => {
      manager.store({ content: 'a', importance: 0.3, timestamp: 1000, associations: [] });
      manager.store({ content: 'b', importance: 0.7, timestamp: 2000, associations: [] });
      const stats = manager.getStats();
      expect(stats.total).toBe(2);
      expect(stats.avgImportance).toBe(0.5);
      expect(stats.oldest).toBe(1000);
      expect(stats.newest).toBe(2000);
    });
  });

  // ============================================================
  // getMemory / getAllMemories / removeMemory
  // ============================================================
  describe('memory queries', () => {
    it('should get memory by id', () => {
      manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: [] });
      expect(manager.getMemory('mem-1')?.content).toBe('a');
    });

    it('should get all memories', () => {
      manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: [] });
      manager.store({ content: 'b', importance: 0.5, timestamp: 1000, associations: [] });
      expect(manager.getAllMemories()).toHaveLength(2);
    });

    it('should remove memory', () => {
      manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: [] });
      expect(manager.removeMemory('mem-1')).toBe(true);
    });

    it('should return false for unknown remove', () => {
      expect(manager.removeMemory('unknown')).toBe(false);
    });
  });

  // ============================================================
  // updateImportance
  // ============================================================
  describe('updateImportance', () => {
    it('should update importance', () => {
      manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: [] });
      expect(manager.updateImportance('mem-1', 0.9)).toBe(true);
      expect(manager.getMemory('mem-1')?.importance).toBe(0.9);
    });

    it('should clamp to 0-1', () => {
      manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: [] });
      manager.updateImportance('mem-1', 1.5);
      expect(manager.getMemory('mem-1')?.importance).toBe(1);
    });

    it('should return false for unknown', () => {
      expect(manager.updateImportance('unknown', 0.5)).toBe(false);
    });
  });

  // ============================================================
  // associations
  // ============================================================
  describe('associations', () => {
    it('should add association', () => {
      manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: [] });
      manager.store({ content: 'b', importance: 0.5, timestamp: 1000, associations: [] });
      expect(manager.addAssociation('mem-1', 'mem-2')).toBe(true);
    });

    it('should not add duplicate', () => {
      manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: [] });
      manager.store({ content: 'b', importance: 0.5, timestamp: 1000, associations: [] });
      manager.addAssociation('mem-1', 'mem-2');
      manager.addAssociation('mem-1', 'mem-2');
      expect(manager.getAssociations('mem-1')).toHaveLength(1);
    });

    it('should remove association', () => {
      manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: [] });
      manager.store({ content: 'b', importance: 0.5, timestamp: 1000, associations: [] });
      manager.addAssociation('mem-1', 'mem-2');
      expect(manager.removeAssociation('mem-1', 'mem-2')).toBe(true);
    });

    it('should return false for unknown association', () => {
      expect(manager.addAssociation('unknown', 'mem-1')).toBe(false);
    });
  });

  // ============================================================
  // filters
  // ============================================================
  describe('filters', () => {
    it('should get by importance', () => {
      manager.store({ content: 'a', importance: 0.3, timestamp: 1000, associations: [] });
      manager.store({ content: 'b', importance: 0.8, timestamp: 1000, associations: [] });
      expect(manager.getByImportance(0.5, 1.0)).toHaveLength(1);
    });

    it('should get recent', () => {
      manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: [] });
      manager.store({ content: 'b', importance: 0.5, timestamp: 2000, associations: [] });
      const recent = manager.getRecent(1);
      expect(recent[0].timestamp).toBe(2000);
    });
  });

  // ============================================================
  // has / count
  // ============================================================
  describe('has / count', () => {
    it('should check existence', () => {
      manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: [] });
      expect(manager.hasMemory('mem-1')).toBe(true);
    });

    it('should count memories', () => {
      manager.store({ content: 'a', importance: 0.5, timestamp: 1000, associations: [] });
      expect(manager.getMemoryCount()).toBe(1);
    });
  });

  // ============================================================
  // decay threshold
  // ============================================================
  describe('decay threshold', () => {
    it('should set threshold', () => {
      manager.setDecayThreshold(0.5);
      expect(manager.getDecayThreshold()).toBe(0.5);
    });

    it('should clamp to 0-1', () => {
      manager.setDecayThreshold(1.5);
      expect(manager.getDecayThreshold()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many memories', () => {
      for (let i = 0; i < 100; i++) {
        manager.store({ content: `m${i}`, importance: 0.5, timestamp: 1000 + i, associations: [] });
      }
      expect(manager.getMemoryCount()).toBe(100);
    });
  });
});