/**
 * KnowledgeBase Tests
 * generic-agent-design Knowledge Base
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
  // addKnowledge
  // ============================================================
  describe('addKnowledge', () => {
    it('should add knowledge', () => {
      const id = kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      expect(id).toBe('kb-1');
    });

    it('should not mutate input', () => {
      const tags = ['a'];
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags });
      tags.push('b');
      expect(kb.getTags('kb-1')).toEqual(['a']);
    });
  });

  // ============================================================
  // update
  // ============================================================
  describe('update', () => {
    it('should update knowledge', () => {
      const id = kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      const result = kb.update(id, 'c2');
      expect(result?.content).toBe('c2');
      expect(result?.version).toBe(2);
    });

    it('should return null for unknown', () => {
      expect(kb.update('unknown', 'x')).toBeNull();
    });

    it('should save to history', () => {
      const id = kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      kb.update(id, 'c2');
      expect(kb.getHistoryCount(id)).toBe(1);
    });
  });

  // ============================================================
  // search
  // ============================================================
  describe('search', () => {
    it('should search by content', () => {
      kb.addKnowledge({ topic: 't1', content: 'hello world', version: 1, updated: Date.now(), tags: [] });
      kb.addKnowledge({ topic: 't2', content: 'goodbye world', version: 1, updated: Date.now(), tags: [] });
      expect(kb.search('hello')).toHaveLength(1);
    });

    it('should search by topic', () => {
      kb.addKnowledge({ topic: 'JavaScript', content: 'language', version: 1, updated: Date.now(), tags: [] });
      expect(kb.search('javascript')).toHaveLength(1);
    });

    it('should be case-insensitive', () => {
      kb.addKnowledge({ topic: 'T1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      expect(kb.search('T1')).toHaveLength(1);
    });
  });

  // ============================================================
  // getByTag
  // ============================================================
  describe('getByTag', () => {
    it('should get by tag', () => {
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: ['js'] });
      kb.addKnowledge({ topic: 't2', content: 'c2', version: 1, updated: Date.now(), tags: ['py'] });
      expect(kb.getByTag('js')).toHaveLength(1);
    });

    it('should return empty for no match', () => {
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: ['js'] });
      expect(kb.getByTag('python')).toHaveLength(0);
    });
  });

  // ============================================================
  // getHistory
  // ============================================================
  describe('getHistory', () => {
    it('should return empty for no history', () => {
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      expect(kb.getHistory('kb-1')).toHaveLength(0);
    });

    it('should return history', () => {
      const id = kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      kb.update(id, 'c2');
      kb.update(id, 'c3');
      expect(kb.getHistory(id)).toHaveLength(2);
    });
  });

  // ============================================================
  // getKnowledge / getAllKnowledge
  // ============================================================
  describe('queries', () => {
    it('should get knowledge', () => {
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      expect(kb.getKnowledge('kb-1')?.content).toBe('c1');
    });

    it('should get all', () => {
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      kb.addKnowledge({ topic: 't2', content: 'c2', version: 1, updated: Date.now(), tags: [] });
      expect(kb.getAllKnowledge()).toHaveLength(2);
    });

    it('should remove knowledge', () => {
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      expect(kb.removeKnowledge('kb-1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(kb.removeKnowledge('unknown')).toBe(false);
    });
  });

  // ============================================================
  // has / count
  // ============================================================
  describe('has / count', () => {
    it('should check existence', () => {
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      expect(kb.hasKnowledge('kb-1')).toBe(true);
    });

    it('should count', () => {
      expect(kb.getKnowledgeCount()).toBe(0);
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      expect(kb.getKnowledgeCount()).toBe(1);
    });
  });

  // ============================================================
  // getByTopic
  // ============================================================
  describe('getByTopic', () => {
    it('should filter by topic', () => {
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      kb.addKnowledge({ topic: 't1', content: 'c2', version: 1, updated: Date.now(), tags: [] });
      kb.addKnowledge({ topic: 't2', content: 'c3', version: 1, updated: Date.now(), tags: [] });
      expect(kb.getByTopic('t1')).toHaveLength(2);
    });
  });

  // ============================================================
  // getByVersion / getLatestVersion
  // ============================================================
  describe('version queries', () => {
    it('should get by version', () => {
      const id = kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      kb.update(id, 'c2');
      const old = kb.getByVersion(id, 1);
      expect(old?.content).toBe('c1');
    });

    it('should get latest', () => {
      const id = kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      kb.update(id, 'c2');
      const latest = kb.getLatestVersion(id);
      expect(latest?.content).toBe('c2');
    });
  });

  // ============================================================
  // tags
  // ============================================================
  describe('tags', () => {
    it('should add tag', () => {
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      expect(kb.addTag('kb-1', 'js')).toBe(true);
    });

    it('should not add duplicate', () => {
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: ['js'] });
      kb.addTag('kb-1', 'js');
      expect(kb.getTags('kb-1')).toHaveLength(1);
    });

    it('should remove tag', () => {
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: ['js'] });
      expect(kb.removeTag('kb-1', 'js')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(kb.addTag('unknown', 'x')).toBe(false);
      expect(kb.removeTag('unknown', 'x')).toBe(false);
    });

    it('should get all tags', () => {
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: ['js', 'py'] });
      kb.addKnowledge({ topic: 't2', content: 'c2', version: 1, updated: Date.now(), tags: ['rust'] });
      expect(kb.getAllTags()).toHaveLength(3);
    });
  });

  // ============================================================
  // getTopics
  // ============================================================
  describe('getTopics', () => {
    it('should get unique topics', () => {
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      kb.addKnowledge({ topic: 't1', content: 'c2', version: 1, updated: Date.now(), tags: [] });
      kb.addKnowledge({ topic: 't2', content: 'c3', version: 1, updated: Date.now(), tags: [] });
      expect(kb.getTopics()).toHaveLength(2);
    });
  });

  // ============================================================
  // rollback
  // ============================================================
  describe('rollback', () => {
    it('should rollback to version', () => {
      const id = kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      kb.update(id, 'c2');
      expect(kb.rollback(id, 1)).toBe(true);
      const k = kb.getKnowledge(id);
      expect(k?.content).toBe('c1');
    });

    it('should return false for unknown', () => {
      expect(kb.rollback('unknown', 1)).toBe(false);
    });
  });

  // ============================================================
  // getHistoryCount
  // ============================================================
  describe('getHistoryCount', () => {
    it('should return 0 for no history', () => {
      kb.addKnowledge({ topic: 't1', content: 'c1', version: 1, updated: Date.now(), tags: [] });
      expect(kb.getHistoryCount('kb-1')).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many knowledge', () => {
      for (let i = 0; i < 100; i++) {
        kb.addKnowledge({ topic: `t${i}`, content: 'c', version: 1, updated: Date.now(), tags: [] });
      }
      expect(kb.getKnowledgeCount()).toBe(100);
    });
  });
});