/**
 * TranslationEngine Tests
 * chatdev-design Translation Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TranslationEngine } from '../TranslationEngine';

describe('TranslationEngine', () => {
  let tre: TranslationEngine;

  beforeEach(() => {
    tre = new TranslationEngine();
  });

  afterEach(() => {
    tre.clearAll();
  });

  describe('add / translate / remove', () => {
    it('should add', () => {
      expect(tre.add('k1', 'hello', 'en', 'zh')).toMatch(/^tre-/);
    });

    it('should mark as active', () => {
      tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.isActive(tre.getAllTranslations()[0].id)).toBe(true);
    });

    it('should translate', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.translate(id, 'hi')).toBe(true);
    });

    it('should not translate inactive', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      tre.setActive(id, false);
      expect(tre.translate(id, 'hi')).toBe(false);
    });

    it('should return false for unknown translate', () => {
      expect(tre.translate('unknown', 'hi')).toBe(false);
    });

    it('should remove', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getStats().translations).toBe(1);
    });

    it('should count total added', () => {
      tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getStats().totalAdded).toBe(1);
    });

    it('should count total translated', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      tre.translate(id, 'hi');
      expect(tre.getStats().totalTranslated).toBe(1);
    });

    it('should count en', () => {
      tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getStats().en).toBe(1);
    });

    it('should count zh', () => {
      tre.add('k1', '你好', 'zh', 'en');
      expect(tre.getStats().zh).toBe(1);
    });

    it('should count ja', () => {
      tre.add('k1', 'こんにちは', 'ja', 'en');
      expect(tre.getStats().ja).toBe(1);
    });

    it('should count es', () => {
      tre.add('k1', 'hola', 'es', 'en');
      expect(tre.getStats().es).toBe(1);
    });

    it('should count fr', () => {
      tre.add('k1', 'bonjour', 'fr', 'en');
      expect(tre.getStats().fr).toBe(1);
    });

    it('should count de', () => {
      tre.add('k1', 'hallo', 'de', 'en');
      expect(tre.getStats().de).toBe(1);
    });

    it('should count active', () => {
      tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      tre.setActive(id, false);
      expect(tre.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      tre.translate(id, 'hi');
      expect(tre.getStats().totalHits).toBe(1);
    });

    it('should count unique keys', () => {
      tre.add('a', 'hello', 'en', 'zh');
      tre.add('a', 'hi', 'en', 'zh');
      expect(tre.getStats().uniqueKeys).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get translation', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getTranslation(id)?.key).toBe('k1');
    });

    it('should get all', () => {
      tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getAllTranslations()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.hasTranslation(id)).toBe(true);
    });

    it('should count', () => {
      expect(tre.getCount()).toBe(0);
      tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get key', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getKey(id)).toBe('k1');
    });

    it('should get source', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getSource(id)).toBe('hello');
    });

    it('should get target', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getTarget(id)).toContain('zh');
    });

    it('should get source lang', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getSourceLang(id)).toBe('en');
    });

    it('should get target lang', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getTargetLang(id)).toBe('zh');
    });

    it('should get hits', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      tre.translate(id, 'hi');
      expect(tre.getHits(id)).toBe(1);
    });

    it('should check en', () => {
      tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.isEn(tre.getAllTranslations()[0].id)).toBe(true);
    });

    it('should check zh', () => {
      tre.add('k1', '你好', 'zh', 'en');
      expect(tre.isZh(tre.getAllTranslations()[0].id)).toBe(true);
    });

    it('should check ja', () => {
      tre.add('k1', 'こんにちは', 'ja', 'en');
      expect(tre.isJa(tre.getAllTranslations()[0].id)).toBe(true);
    });

    it('should check es', () => {
      tre.add('k1', 'hola', 'es', 'en');
      expect(tre.isEs(tre.getAllTranslations()[0].id)).toBe(true);
    });

    it('should check fr', () => {
      tre.add('k1', 'bonjour', 'fr', 'en');
      expect(tre.isFr(tre.getAllTranslations()[0].id)).toBe(true);
    });

    it('should check de', () => {
      tre.add('k1', 'hallo', 'de', 'en');
      expect(tre.isDe(tre.getAllTranslations()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.setActive(id, false)).toBe(true);
    });

    it('should set key', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.setKey(id, 'k2')).toBe(true);
    });

    it('should set source', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.setSource(id, 'hi')).toBe(true);
    });

    it('should set target', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.setTarget(id, 'custom')).toBe(true);
    });

    it('should set source lang', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.setSourceLang(id, 'fr')).toBe(true);
    });

    it('should set target lang', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.setTargetLang(id, 'ja')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tre.setActive('unknown', false)).toBe(false);
      expect(tre.setKey('unknown', 'k')).toBe(false);
      expect(tre.setSource('unknown', 's')).toBe(false);
      expect(tre.setTarget('unknown', 't')).toBe(false);
      expect(tre.setSourceLang('unknown', 'en')).toBe(false);
      expect(tre.setTargetLang('unknown', 'zh')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      tre.setActive(id, false);
      tre.resetAll();
      expect(tre.isActive(id)).toBe(true);
    });
  });

  describe('by lang / state', () => {
    it('should get by lang', () => {
      tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getBySourceLang('en')).toHaveLength(1);
    });

    it('should get active', () => {
      tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getActiveTranslations()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      tre.setActive(id, false);
      expect(tre.getInactiveTranslations()).toHaveLength(1);
    });

    it('should get all keys', () => {
      tre.add('a', 'hello', 'en', 'zh');
      tre.add('b', 'hi', 'en', 'zh');
      expect(tre.getAllKeys()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getNewest()?.key).toBe('k1');
    });

    it('should return null for empty newest', () => {
      expect(tre.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getOldest()?.key).toBe('k1');
    });

    it('should return null for empty oldest', () => {
      expect(tre.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      tre.translate(id, 'hi');
      expect(tre.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      tre.add('k1', 'hello', 'en', 'zh');
      expect(tre.getTotalAdded()).toBe(1);
    });

    it('should get total translated', () => {
      const id = tre.add('k1', 'hello', 'en', 'zh');
      tre.translate(id, 'hi');
      expect(tre.getTotalTranslated()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many translations', () => {
      for (let i = 0; i < 50; i++) {
        tre.add(`k${i}`, 'hello', 'en', 'zh');
      }
      expect(tre.getCount()).toBe(50);
    });
  });
});