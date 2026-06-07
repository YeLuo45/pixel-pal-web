/**
 * MemoryEngine Tests
 * generic-agent-design Memory Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryEngine } from '../MemoryEngine';

describe('MemoryEngine', () => {
  let mme: MemoryEngine;

  beforeEach(() => {
    mme = new MemoryEngine();
  });

  afterEach(() => {
    mme.clearAll();
  });

  describe('store / recall / forget / search / remove', () => {
    it('should store', () => {
      expect(mme.store('content1')).toMatch(/^mme-/);
    });

    it('should default type to episodic', () => {
      mme.store('c1');
      expect(mme.getType(mme.getAllMemories()[0].id)).toBe('episodic');
    });

    it('should default importance to 1', () => {
      mme.store('c1');
      expect(mme.getImportance(mme.getAllMemories()[0].id)).toBe(1);
    });

    it('should mark as active', () => {
      mme.store('c1');
      expect(mme.isActive(mme.getAllMemories()[0].id)).toBe(true);
    });

    it('should recall', () => {
      const id = mme.store('c1');
      expect(mme.recall(id)).toBeDefined();
    });

    it('should increment accesses on recall', () => {
      const id = mme.store('c1');
      mme.recall(id);
      expect(mme.getAccesses(id)).toBe(1);
    });

    it('should not recall inactive', () => {
      const id = mme.store('c1');
      mme.forget(id);
      expect(mme.recall(id)).toBeUndefined();
    });

    it('should return undefined for unknown recall', () => {
      expect(mme.recall('unknown')).toBeUndefined();
    });

    it('should forget', () => {
      const id = mme.store('c1');
      expect(mme.forget(id)).toBe(true);
    });

    it('should return false for unknown forget', () => {
      expect(mme.forget('unknown')).toBe(false);
    });

    it('should search', () => {
      mme.store('hello world');
      mme.store('goodbye world');
      expect(mme.search('hello')).toHaveLength(1);
    });

    it('should return empty for no match', () => {
      mme.store('hello');
      expect(mme.search('xyz')).toHaveLength(0);
    });

    it('should remove', () => {
      const id = mme.store('c1');
      expect(mme.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      mme.store('c1');
      expect(mme.getStats().memories).toBe(1);
    });

    it('should count total stored', () => {
      mme.store('c1');
      expect(mme.getStats().totalStored).toBe(1);
    });

    it('should count total recalled', () => {
      const id = mme.store('c1');
      mme.recall(id);
      expect(mme.getStats().totalRecalled).toBe(1);
    });

    it('should count total forgotten', () => {
      const id = mme.store('c1');
      mme.forget(id);
      expect(mme.getStats().totalForgotten).toBe(1);
    });

    it('should count episodic', () => {
      mme.store('c1', 'episodic');
      expect(mme.getStats().episodic).toBe(1);
    });

    it('should count semantic', () => {
      mme.store('c1', 'semantic');
      expect(mme.getStats().semantic).toBe(1);
    });

    it('should count procedural', () => {
      mme.store('c1', 'procedural');
      expect(mme.getStats().procedural).toBe(1);
    });

    it('should count active', () => {
      mme.store('c1');
      expect(mme.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = mme.store('c1');
      mme.forget(id);
      expect(mme.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = mme.store('c1');
      mme.recall(id);
      expect(mme.getStats().totalHits).toBe(1);
    });

    it('should count total accesses', () => {
      const id = mme.store('c1');
      mme.recall(id);
      expect(mme.getStats().totalAccesses).toBe(1);
    });

    it('should count unique contents', () => {
      mme.store('a');
      mme.store('a');
      expect(mme.getStats().uniqueContents).toBe(1);
    });

    it('should count avg importance', () => {
      mme.store('a', 'episodic', 2);
      mme.store('b', 'episodic', 4);
      expect(mme.getStats().avgImportance).toBe(3);
    });

    it('should count max importance', () => {
      mme.store('a', 'episodic', 2);
      mme.store('b', 'episodic', 4);
      expect(mme.getStats().maxImportance).toBe(4);
    });

    it('should count min importance', () => {
      mme.store('a', 'episodic', 2);
      mme.store('b', 'episodic', 4);
      expect(mme.getStats().minImportance).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get memory', () => {
      const id = mme.store('c1');
      expect(mme.getMemory(id)?.content).toBe('c1');
    });

    it('should get all', () => {
      mme.store('c1');
      expect(mme.getAllMemories()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = mme.store('c1');
      expect(mme.hasMemory(id)).toBe(true);
    });

    it('should count', () => {
      expect(mme.getCount()).toBe(0);
      mme.store('c1');
      expect(mme.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get content', () => {
      const id = mme.store('c1');
      expect(mme.getContent(id)).toBe('c1');
    });

    it('should get hits', () => {
      const id = mme.store('c1');
      mme.recall(id);
      expect(mme.getHits(id)).toBe(1);
    });

    it('should check episodic', () => {
      mme.store('c1', 'episodic');
      expect(mme.isEpisodic(mme.getAllMemories()[0].id)).toBe(true);
    });

    it('should check semantic', () => {
      mme.store('c1', 'semantic');
      expect(mme.isSemantic(mme.getAllMemories()[0].id)).toBe(true);
    });

    it('should check procedural', () => {
      mme.store('c1', 'procedural');
      expect(mme.isProcedural(mme.getAllMemories()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = mme.store('c1');
      expect(mme.setActive(id, false)).toBe(true);
    });

    it('should set content', () => {
      const id = mme.store('c1');
      expect(mme.setContent(id, 'c2')).toBe(true);
    });

    it('should set importance', () => {
      const id = mme.store('c1');
      expect(mme.setImportance(id, 5)).toBe(true);
    });

    it('should clamp importance to 0-10', () => {
      const id = mme.store('c1');
      mme.setImportance(id, 20);
      expect(mme.getImportance(id)).toBe(10);
    });

    it('should set type', () => {
      const id = mme.store('c1');
      expect(mme.setType(id, 'semantic')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(mme.setActive('unknown', false)).toBe(false);
      expect(mme.setContent('unknown', 'c')).toBe(false);
      expect(mme.setImportance('unknown', 5)).toBe(false);
      expect(mme.setType('unknown', 'semantic')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = mme.store('c1');
      mme.forget(id);
      mme.resetAll();
      expect(mme.isActive(id)).toBe(true);
    });
  });

  describe('by type / state', () => {
    it('should get by type', () => {
      mme.store('c1', 'semantic');
      expect(mme.getByType('semantic')).toHaveLength(1);
    });

    it('should get active', () => {
      mme.store('c1');
      expect(mme.getActiveMemories()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = mme.store('c1');
      mme.forget(id);
      expect(mme.getInactiveMemories()).toHaveLength(1);
    });

    it('should get by importance range', () => {
      mme.store('a', 'episodic', 2);
      mme.store('b', 'episodic', 8);
      expect(mme.getByImportance(5, 10)).toHaveLength(1);
    });

    it('should get all contents', () => {
      mme.store('a');
      mme.store('b');
      expect(mme.getAllContents()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      mme.store('c1');
      expect(mme.getNewest()?.content).toBe('c1');
    });

    it('should return null for empty newest', () => {
      expect(mme.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      mme.store('c1');
      expect(mme.getOldest()?.content).toBe('c1');
    });

    it('should return null for empty oldest', () => {
      expect(mme.getOldest()).toBeNull();
    });

    it('should get most important', () => {
      mme.store('a', 'episodic', 2);
      mme.store('b', 'episodic', 8);
      expect(mme.getMostImportant()?.content).toBe('b');
    });

    it('should return null for empty most important', () => {
      expect(mme.getMostImportant()).toBeNull();
    });

    it('should get most accessed', () => {
      const id = mme.store('c1');
      mme.recall(id);
      mme.recall(id);
      expect(mme.getMostAccessed()?.content).toBe('c1');
    });

    it('should return null for empty most accessed', () => {
      expect(mme.getMostAccessed()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = mme.store('c1');
      expect(mme.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = mme.store('c1');
      mme.recall(id);
      expect(mme.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total stored', () => {
      mme.store('c1');
      expect(mme.getTotalStored()).toBe(1);
    });

    it('should get total recalled', () => {
      const id = mme.store('c1');
      mme.recall(id);
      expect(mme.getTotalRecalled()).toBe(1);
    });

    it('should get total forgotten', () => {
      const id = mme.store('c1');
      mme.forget(id);
      expect(mme.getTotalForgotten()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many memories', () => {
      for (let i = 0; i < 50; i++) {
        mme.store(`c${i}`);
      }
      expect(mme.getCount()).toBe(50);
    });
  });
});