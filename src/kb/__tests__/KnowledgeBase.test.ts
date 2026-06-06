/**
 * KnowledgeBase Tests
 * chatdev-design Knowledge Base
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { KnowledgeBase } from '../KnowledgeBase';

describe('KnowledgeBase', () => {
  let kb: KnowledgeBase;

  beforeEach(() => {
    kb = new KnowledgeBase();
  });

  afterEach(() => {
    kb.clearAll();
  });

  // ============================================================
  // add / query / update
  // ============================================================
  describe('add / query / update', () => {
    it('should add', () => {
      expect(kb.add('t1', 'content', 0.5)).toBe('kb-1');
    });

    it('should query', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.query('t1')).toHaveLength(1);
    });

    it('should return empty for unknown', () => {
      expect(kb.query('unknown')).toHaveLength(0);
    });

    it('should not query inactive', () => {
      const id = kb.add('t1', 'content', 0.5);
      kb.setActive(id, false);
      expect(kb.query('t1')).toHaveLength(0);
    });

    it('should update', () => {
      const id = kb.add('t1', 'content', 0.5);
      expect(kb.update(id, 'new content')).toBe(true);
    });

    it('should return false for unknown update', () => {
      expect(kb.update('unknown', 'content')).toBe(false);
    });

    it('should increment hits on query', () => {
      const id = kb.add('t1', 'content', 0.5);
      kb.query('t1');
      expect(kb.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      kb.add('t1', 'content', 0.5);
      const stats = kb.getStats();
      expect(stats.entries).toBe(1);
    });

    it('should count total hits', () => {
      const id = kb.add('t1', 'content', 0.5);
      kb.query('t1');
      expect(kb.getStats().totalHits).toBe(1);
    });

    it('should count topics', () => {
      kb.add('t1', 'content', 0.5);
      kb.add('t2', 'content', 0.5);
      expect(kb.getStats().topics).toBe(2);
    });

    it('should count active', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getStats().active).toBe(1);
    });

    it('should compute avg confidence', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getStats().avgConfidence).toBe(0.5);
    });

    it('should compute avg hits', () => {
      kb.add('t1', 'content', 0.5);
      kb.query('t1');
      expect(kb.getStats().avgHits).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get entry', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getEntry('kb-1')?.topic).toBe('t1');
    });

    it('should get all', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getAllEntries()).toHaveLength(1);
    });

    it('should remove', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.removeEntry('kb-1')).toBe(true);
    });

    it('should check existence', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.hasEntry('kb-1')).toBe(true);
    });

    it('should count', () => {
      expect(kb.getCount()).toBe(0);
      kb.add('t1', 'content', 0.5);
      expect(kb.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get topic', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getTopic('kb-1')).toBe('t1');
    });

    it('should get content', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getContent('kb-1')).toBe('content');
    });

    it('should get confidence', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getConfidence('kb-1')).toBe(0.5);
    });

    it('should get hits', () => {
      const id = kb.add('t1', 'content', 0.5);
      kb.query('t1');
      expect(kb.getHits(id)).toBe(1);
    });

    it('should check isActive', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.isActive('kb-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = kb.add('t1', 'content', 0.5);
      expect(kb.setActive(id, false)).toBe(true);
    });

    it('should set confidence', () => {
      const id = kb.add('t1', 'content', 0.5);
      expect(kb.setConfidence(id, 0.8)).toBe(true);
    });

    it('should set topic', () => {
      const id = kb.add('t1', 'content', 0.5);
      expect(kb.setTopic(id, 't2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(kb.setActive('unknown', false)).toBe(false);
      expect(kb.setConfidence('unknown', 0.5)).toBe(false);
      expect(kb.setTopic('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset hits', () => {
      const id = kb.add('t1', 'content', 0.5);
      kb.query('t1');
      kb.resetHits();
      expect(kb.getHits(id)).toBe(0);
    });

    it('should reset all', () => {
      const id = kb.add('t1', 'content', 0.5);
      kb.query('t1');
      kb.setActive(id, false);
      kb.resetAll();
      expect(kb.getHits(id)).toBe(0);
      expect(kb.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by topic / state
  // ============================================================
  describe('by topic / state', () => {
    it('should get by topic', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getByTopic('t1')).toHaveLength(1);
    });

    it('should get active', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getActiveEntries()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = kb.add('t1', 'content', 0.5);
      kb.setActive(id, false);
      expect(kb.getInactiveEntries()).toHaveLength(1);
    });

    it('should get all topics', () => {
      kb.add('t1', 'content', 0.5);
      kb.add('t2', 'content', 0.5);
      expect(kb.getAllTopics()).toHaveLength(2);
    });

    it('should get topic count', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getTopicCount()).toBe(1);
    });
  });

  // ============================================================
  // by confidence
  // ============================================================
  describe('by confidence', () => {
    it('should get by min confidence', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getByMinConfidence(0.3)).toHaveLength(1);
    });

    it('should get by max confidence', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getByMaxConfidence(0.7)).toHaveLength(1);
    });

    it('should get sorted by confidence', () => {
      kb.add('low', 'content', 0.3);
      kb.add('high', 'content', 0.9);
      expect(kb.getSortedByConfidence()[0].topic).toBe('high');
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hit', () => {
      const id = kb.add('t1', 'content', 0.5);
      kb.query('t1');
      expect(kb.getMostHit()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(kb.getMostHit()).toBeNull();
    });

    it('should get highest confidence', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getHighestConfidence()?.id).toBe('kb-1');
    });

    it('should return null for empty highest', () => {
      expect(kb.getHighestConfidence()).toBeNull();
    });

    it('should get newest', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getNewest()?.id).toBe('kb-1');
    });

    it('should return null for empty newest', () => {
      expect(kb.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getOldest()?.id).toBe('kb-1');
    });

    it('should return null for empty oldest', () => {
      expect(kb.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      kb.add('t1', 'content', 0.5);
      expect(kb.getCreatedAt('kb-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = kb.add('t1', 'content', 0.5);
      kb.update(id, 'new');
      expect(kb.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        kb.add(`t${i}`, 'content', 0.5);
      }
      expect(kb.getCount()).toBe(50);
    });
  });
});