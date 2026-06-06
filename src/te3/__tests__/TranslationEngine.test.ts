/**
 * TranslationEngine Tests
 * chatdev-design Translation Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TranslationEngine } from '../TranslationEngine';

describe('TranslationEngine', () => {
  let te: TranslationEngine;

  beforeEach(() => {
    te = new TranslationEngine();
  });

  afterEach(() => {
    te.clearAll();
  });

  // ============================================================
  // add / access / getByLang
  // ============================================================
  describe('add / access / getByLang', () => {
    it('should add', () => {
      expect(te.add('en', 'zh', 'hello', '你好')).toBe('te3-1');
    });

    it('should mark as active', () => {
      const id = te.add('en', 'zh', 'hello', '你好');
      expect(te.isActive(id)).toBe(true);
    });

    it('should access', () => {
      const id = te.add('en', 'zh', 'hello', '你好');
      expect(te.access(id)).toBe(true);
    });

    it('should increment hits on access', () => {
      const id = te.add('en', 'zh', 'hello', '你好');
      te.access(id);
      expect(te.getHits(id)).toBe(1);
    });

    it('should log history on access', () => {
      const id = te.add('en', 'zh', 'hello', '你好');
      te.access(id);
      expect(te.getHistory(id)).toHaveLength(1);
    });

    it('should not access inactive', () => {
      const id = te.add('en', 'zh', 'hello', '你好');
      te.setActive(id, false);
      expect(te.access(id)).toBe(false);
    });

    it('should return false for unknown access', () => {
      expect(te.access('unknown')).toBe(false);
    });

    it('should get by lang', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getByLang('en', 'zh')).toHaveLength(1);
    });

    it('should return empty for unknown lang', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getByLang('fr', 'de')).toHaveLength(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      te.add('en', 'zh', 'hello', '你好');
      const stats = te.getStats();
      expect(stats.translations).toBe(1);
    });

    it('should count unique languages', () => {
      te.add('en', 'zh', 'hello', '你好');
      te.add('fr', 'de', 'bonjour', 'hallo');
      expect(te.getStats().uniqueLanguages).toBe(4);
    });

    it('should count unique pairs', () => {
      te.add('en', 'zh', 'hello', '你好');
      te.add('fr', 'de', 'bonjour', 'hallo');
      expect(te.getStats().uniquePairs).toBe(2);
    });

    it('should count active', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = te.add('en', 'zh', 'hello', '你好');
      te.setActive(id, false);
      expect(te.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = te.add('en', 'zh', 'hello', '你好');
      te.access(id);
      expect(te.getStats().totalHits).toBe(1);
    });

    it('should compute avg text length', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getStats().avgTextLength).toBe(5);
    });

    it('should get max text length', () => {
      te.add('en', 'zh', 'short', '短');
      te.add('en', 'zh', 'longer text', '更长的文本');
      expect(te.getStats().maxTextLength).toBe(11);
    });

    it('should get min text length', () => {
      te.add('en', 'zh', 'short', '短');
      te.add('en', 'zh', 'longer text', '更长的文本');
      expect(te.getStats().minTextLength).toBe(5);
    });

    it('should compute total text length', () => {
      te.add('en', 'zh', 'abc', 'xyz');
      te.add('en', 'zh', 'defg', 'wxyz');
      expect(te.getStats().totalTextLength).toBe(7);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get translation', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getTranslation('te3-1')?.text).toBe('hello');
    });

    it('should get all', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getAllTranslations()).toHaveLength(1);
    });

    it('should remove', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.removeTranslation('te3-1')).toBe(true);
    });

    it('should check existence', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.hasTranslation('te3-1')).toBe(true);
    });

    it('should count', () => {
      expect(te.getCount()).toBe(0);
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get source', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getSource('te3-1')).toBe('en');
    });

    it('should get target', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getTarget('te3-1')).toBe('zh');
    });

    it('should get text', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getText('te3-1')).toBe('hello');
    });

    it('should get translated', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getTranslated('te3-1')).toBe('你好');
    });

    it('should get text length', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getTextLength('te3-1')).toBe(5);
    });

    it('should get history', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getHistory('te3-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = te.add('en', 'zh', 'hello', '你好');
      te.access(id);
      expect(te.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.setActive('te3-1', false)).toBe(true);
    });

    it('should set source', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.setSource('te3-1', 'fr')).toBe(true);
    });

    it('should set target', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.setTarget('te3-1', 'de')).toBe(true);
    });

    it('should set text', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.setText('te3-1', 'hi')).toBe(true);
    });

    it('should set translated', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.setTranslated('te3-1', '嗨')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(te.setActive('unknown', false)).toBe(false);
      expect(te.setSource('unknown', 's')).toBe(false);
      expect(te.setTarget('unknown', 't')).toBe(false);
      expect(te.setText('unknown', 'x')).toBe(false);
      expect(te.setTranslated('unknown', 'x')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = te.add('en', 'zh', 'hello', '你好');
      te.access(id);
      te.setActive(id, false);
      te.resetAll();
      expect(te.getHits(id)).toBe(0);
      expect(te.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by source / target / state
  // ============================================================
  describe('by source / target / state', () => {
    it('should get by source', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getBySource('en')).toHaveLength(1);
    });

    it('should get by target', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getByTarget('zh')).toHaveLength(1);
    });

    it('should get active', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getActiveTranslations()).toHaveLength(1);
    });

    it('should get inactive', () => {
      te.add('en', 'zh', 'hello', '你好');
      te.setActive('te3-1', false);
      expect(te.getInactiveTranslations()).toHaveLength(1);
    });

    it('should get all sources', () => {
      te.add('en', 'zh', 'hello', '你好');
      te.add('fr', 'de', 'bonjour', 'hallo');
      expect(te.getAllSources()).toHaveLength(2);
    });

    it('should get all targets', () => {
      te.add('en', 'zh', 'hello', '你好');
      te.add('fr', 'de', 'bonjour', 'hallo');
      expect(te.getAllTargets()).toHaveLength(2);
    });

    it('should get source count', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getSourceCount()).toBe(1);
    });

    it('should get target count', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getTargetCount()).toBe(1);
    });

    it('should get by min text length', () => {
      te.add('en', 'zh', 'long text', '长文本');
      te.add('en', 'zh', 'x', 'x');
      expect(te.getByMinTextLength(5)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most text length', () => {
      te.add('en', 'zh', 'long text', '长文本');
      te.add('en', 'zh', 'x', 'x');
      expect(te.getMostTextLength()?.id).toBe('te3-1');
    });

    it('should return null for empty most', () => {
      expect(te.getMostTextLength()).toBeNull();
    });

    it('should get newest', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getNewest()?.id).toBe('te3-1');
    });

    it('should return null for empty newest', () => {
      expect(te.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getOldest()?.id).toBe('te3-1');
    });

    it('should return null for empty oldest', () => {
      expect(te.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      te.add('en', 'zh', 'hello', '你好');
      expect(te.getCreatedAt('te3-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = te.add('en', 'zh', 'hello', '你好');
      te.access(id);
      expect(te.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many translations', () => {
      for (let i = 0; i < 50; i++) {
        te.add('en', 'zh', `text${i}`, `翻译${i}`);
      }
      expect(te.getCount()).toBe(50);
    });
  });
});