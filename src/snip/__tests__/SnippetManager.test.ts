/**
 * SnippetManager Tests
 * claude-code-design Snippet Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SnippetManager } from '../SnippetManager';

describe('SnippetManager', () => {
  let sm: SnippetManager;

  beforeEach(() => {
    sm = new SnippetManager();
  });

  afterEach(() => {
    sm.clearAll();
  });

  // ============================================================
  // add / update / search
  // ============================================================
  describe('add / update / search', () => {
    it('should add', () => {
      expect(sm.add('s1', 'code', 'ts')).toBe('snip-1');
    });

    it('should set initial version to 1', () => {
      const id = sm.add('s1', 'code', 'ts');
      expect(sm.getVersion(id)).toBe(1);
    });

    it('should update', () => {
      const id = sm.add('s1', 'code', 'ts');
      expect(sm.update(id, 'new code')).toBe(true);
    });

    it('should increment version on update', () => {
      const id = sm.add('s1', 'code', 'ts');
      sm.update(id, 'new code');
      expect(sm.getVersion(id)).toBe(2);
    });

    it('should return false for unknown update', () => {
      expect(sm.update('unknown', 'code')).toBe(false);
    });

    it('should search', () => {
      sm.add('s1', 'function test() {}', 'ts');
      expect(sm.search('test')).toHaveLength(1);
    });

    it('should return empty for no match', () => {
      sm.add('s1', 'code', 'ts');
      expect(sm.search('xyz')).toHaveLength(0);
    });

    it('should increment hits on search', () => {
      const id = sm.add('s1', 'function test() {}', 'ts');
      sm.search('test');
      expect(sm.getHits(id)).toBe(1);
    });

    it('should search by tag', () => {
      const id = sm.add('s1', 'code', 'ts', ['test']);
      expect(sm.search('test')).toHaveLength(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      sm.add('s1', 'code', 'ts');
      const stats = sm.getStats();
      expect(stats.snippets).toBe(1);
    });

    it('should count languages', () => {
      sm.add('s1', 'code', 'ts');
      sm.add('s2', 'code', 'js');
      expect(sm.getStats().languages).toBe(2);
    });

    it('should count total hits', () => {
      const id = sm.add('s1', 'function test() {}', 'ts');
      sm.search('test');
      expect(sm.getStats().totalHits).toBe(1);
    });

    it('should compute avg version', () => {
      const id = sm.add('s1', 'code', 'ts');
      sm.update(id, 'new');
      expect(sm.getStats().avgVersion).toBe(2);
    });

    it('should compute avg hits', () => {
      const id = sm.add('s1', 'function test() {}', 'ts');
      sm.search('test');
      expect(sm.getStats().avgHits).toBe(1);
    });

    it('should count total updates', () => {
      const id = sm.add('s1', 'code', 'ts');
      sm.update(id, 'new');
      expect(sm.getStats().totalUpdates).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get snippet', () => {
      sm.add('s1', 'code', 'ts');
      expect(sm.getSnippet('snip-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      sm.add('s1', 'code', 'ts');
      expect(sm.getAllSnippets()).toHaveLength(1);
    });

    it('should remove', () => {
      sm.add('s1', 'code', 'ts');
      expect(sm.removeSnippet('snip-1')).toBe(true);
    });

    it('should check existence', () => {
      sm.add('s1', 'code', 'ts');
      expect(sm.hasSnippet('snip-1')).toBe(true);
    });

    it('should count', () => {
      expect(sm.getCount()).toBe(0);
      sm.add('s1', 'code', 'ts');
      expect(sm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      sm.add('s1', 'code', 'ts');
      expect(sm.getName('snip-1')).toBe('s1');
    });

    it('should get code', () => {
      sm.add('s1', 'const x = 1;', 'ts');
      expect(sm.getCode('snip-1')).toBe('const x = 1;');
    });

    it('should get language', () => {
      sm.add('s1', 'code', 'ts');
      expect(sm.getLanguage('snip-1')).toBe('ts');
    });

    it('should get version', () => {
      sm.add('s1', 'code', 'ts');
      expect(sm.getVersion('snip-1')).toBe(1);
    });

    it('should get hits', () => {
      const id = sm.add('s1', 'function test() {}', 'ts');
      sm.search('test');
      expect(sm.getHits(id)).toBe(1);
    });

    it('should get tags', () => {
      const id = sm.add('s1', 'code', 'ts', ['t1', 't2']);
      expect(sm.getTags(id)).toEqual(['t1', 't2']);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set name', () => {
      const id = sm.add('s1', 'code', 'ts');
      expect(sm.setName(id, 's2')).toBe(true);
    });

    it('should set language', () => {
      const id = sm.add('s1', 'code', 'ts');
      expect(sm.setLanguage(id, 'js')).toBe(true);
    });

    it('should set tags', () => {
      const id = sm.add('s1', 'code', 'ts');
      expect(sm.setTags(id, ['t1'])).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sm.setName('unknown', 's')).toBe(false);
      expect(sm.setLanguage('unknown', 'js')).toBe(false);
      expect(sm.setTags('unknown', [])).toBe(false);
    });
  });

  // ============================================================
  // tags
  // ============================================================
  describe('tags', () => {
    it('should add tag', () => {
      const id = sm.add('s1', 'code', 'ts');
      expect(sm.addTag(id, 't1')).toBe(true);
    });

    it('should not add duplicate tag', () => {
      const id = sm.add('s1', 'code', 'ts', ['t1']);
      sm.addTag(id, 't1');
      expect(sm.getTags(id)).toEqual(['t1']);
    });

    it('should remove tag', () => {
      const id = sm.add('s1', 'code', 'ts', ['t1']);
      expect(sm.removeTag(id, 't1')).toBe(true);
    });

    it('should return false for unknown tag', () => {
      expect(sm.addTag('unknown', 't')).toBe(false);
      expect(sm.removeTag('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset hits', () => {
      const id = sm.add('s1', 'function test() {}', 'ts');
      sm.search('test');
      sm.resetHits();
      expect(sm.getHits(id)).toBe(0);
    });

    it('should reset all', () => {
      const id = sm.add('s1', 'code', 'ts');
      sm.update(id, 'new');
      sm.resetAll();
      expect(sm.getVersion(id)).toBe(1);
    });
  });

  // ============================================================
  // by language / tag
  // ============================================================
  describe('by language / tag', () => {
    it('should get by language', () => {
      sm.add('s1', 'code', 'ts');
      expect(sm.getByLanguage('ts')).toHaveLength(1);
    });

    it('should get by name', () => {
      sm.add('s1', 'code', 'ts');
      expect(sm.getByName('s1')).toHaveLength(1);
    });

    it('should get by tag', () => {
      sm.add('s1', 'code', 'ts', ['t1']);
      expect(sm.getByTag('t1')).toHaveLength(1);
    });

    it('should get by min version', () => {
      const id = sm.add('s1', 'code', 'ts');
      sm.update(id, 'new');
      expect(sm.getByMinVersion(2)).toHaveLength(1);
    });
  });

  // ============================================================
  // languages
  // ============================================================
  describe('languages', () => {
    it('should get all languages', () => {
      sm.add('s1', 'code', 'ts');
      sm.add('s2', 'code', 'js');
      expect(sm.getAllLanguages()).toHaveLength(2);
    });

    it('should get language count', () => {
      sm.add('s1', 'code', 'ts');
      expect(sm.getLanguageCount()).toBe(1);
    });

    it('should get by language count', () => {
      sm.add('s1', 'code', 'ts');
      expect(sm.getByLanguageCount('ts')).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hit', () => {
      const id = sm.add('s1', 'function test() {}', 'ts');
      sm.search('test');
      expect(sm.getMostHit()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(sm.getMostHit()).toBeNull();
    });

    it('should get highest version', () => {
      const id = sm.add('s1', 'code', 'ts');
      sm.update(id, 'new');
      expect(sm.getHighestVersion()?.id).toBe(id);
    });

    it('should return null for empty highest', () => {
      expect(sm.getHighestVersion()).toBeNull();
    });

    it('should get newest', () => {
      sm.add('s1', 'code', 'ts');
      expect(sm.getNewest()?.id).toBe('snip-1');
    });

    it('should return null for empty newest', () => {
      expect(sm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sm.add('s1', 'code', 'ts');
      expect(sm.getOldest()?.id).toBe('snip-1');
    });

    it('should return null for empty oldest', () => {
      expect(sm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      sm.add('s1', 'code', 'ts');
      expect(sm.getCreatedAt('snip-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sm.add('s1', 'code', 'ts');
      sm.update(id, 'new');
      expect(sm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total updates
  // ============================================================
  describe('total updates', () => {
    it('should get total updates', () => {
      const id = sm.add('s1', 'code', 'ts');
      sm.update(id, 'new');
      expect(sm.getTotalUpdates()).toBe(1);
    });

    it('should reset total updates', () => {
      const id = sm.add('s1', 'code', 'ts');
      sm.update(id, 'new');
      sm.resetTotalUpdates();
      expect(sm.getTotalUpdates()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many snippets', () => {
      for (let i = 0; i < 50; i++) {
        sm.add(`s${i}`, 'code', 'ts');
      }
      expect(sm.getCount()).toBe(50);
    });
  });
});