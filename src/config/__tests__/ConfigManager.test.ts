/**
 * ConfigManager Tests
 * nanobot-design Config Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigManager } from '../ConfigManager';

describe('ConfigManager', () => {
  let manager: ConfigManager;

  beforeEach(() => {
    manager = new ConfigManager();
  });

  afterEach(() => {
    manager.clearAll();
  });

  // ============================================================
  // set / get
  // ============================================================
  describe('set / get', () => {
    it('should set value', () => {
      expect(manager.set('k1', 'v1')).toBe(true);
      expect(manager.get('k1')).toBe('v1');
    });

    it('should reject invalid number', () => {
      expect(manager.set('k1', 'abc', 'number')).toBe(false);
    });

    it('should accept valid number', () => {
      expect(manager.set('k1', '123', 'number')).toBe(true);
    });

    it('should accept valid boolean', () => {
      expect(manager.set('k1', 'true', 'boolean')).toBe(true);
    });

    it('should reject invalid boolean', () => {
      expect(manager.set('k1', 'yes', 'boolean')).toBe(false);
    });

    it('should accept valid json', () => {
      expect(manager.set('k1', '{"a":1}', 'json')).toBe(true);
    });

    it('should reject invalid json', () => {
      expect(manager.set('k1', '{a:1}', 'json')).toBe(false);
    });
  });

  // ============================================================
  // getConfig / validate
  // ============================================================
  describe('getConfig / validate', () => {
    it('should get config', () => {
      manager.set('k1', 'v1');
      const c = manager.getConfig('k1');
      expect(c?.value).toBe('v1');
    });

    it('should validate config', () => {
      manager.set('k1', '123', 'number');
      const c = manager.getConfig('k1');
      expect(manager.validate(c!)).toBe(true);
    });

    it('should reject invalid number', () => {
      const result = manager.validateType('abc', 'number');
      expect(result).toBe(false);
    });
  });

  // ============================================================
  // getHistory
  // ============================================================
  describe('getHistory', () => {
    it('should track history on update', () => {
      manager.set('k1', 'v1');
      manager.set('k1', 'v2');
      expect(manager.getHistoryCount('k1')).toBe(1);
    });

    it('should return empty for no history', () => {
      manager.set('k1', 'v1');
      expect(manager.getHistory('k1')).toHaveLength(0);
    });
  });

  // ============================================================
  // getAll / has / remove / count
  // ============================================================
  describe('queries', () => {
    it('should get all', () => {
      manager.set('k1', 'v1');
      manager.set('k2', 'v2');
      expect(manager.getAll()).toHaveLength(2);
    });

    it('should check existence', () => {
      manager.set('k1', 'v1');
      expect(manager.has('k1')).toBe(true);
    });

    it('should remove', () => {
      manager.set('k1', 'v1');
      expect(manager.remove('k1')).toBe(true);
    });

    it('should return false for unknown remove', () => {
      expect(manager.remove('unknown')).toBe(false);
    });

    it('should count', () => {
      expect(manager.getCount()).toBe(0);
      manager.set('k1', 'v1');
      expect(manager.getCount()).toBe(1);
    });
  });

  // ============================================================
  // version / rollback
  // ============================================================
  describe('version / rollback', () => {
    it('should get version', () => {
      manager.set('k1', 'v1');
      expect(manager.getVersion('k1')).toBe(1);
    });

    it('should increment version on update', () => {
      manager.set('k1', 'v1');
      manager.set('k1', 'v2');
      expect(manager.getVersion('k1')).toBe(2);
    });

    it('should rollback', () => {
      manager.set('k1', 'v1');
      manager.set('k1', 'v2');
      expect(manager.rollback('k1', 1)).toBe(true);
      expect(manager.get('k1')).toBe('v1');
    });

    it('should return false for unknown rollback', () => {
      expect(manager.rollback('unknown', 1)).toBe(false);
    });
  });

  // ============================================================
  // getKeysByType
  // ============================================================
  describe('getKeysByType', () => {
    it('should filter by type', () => {
      manager.set('k1', 'v1', 'string');
      manager.set('k2', '123', 'number');
      expect(manager.getKeysByType('string')).toHaveLength(1);
    });
  });

  // ============================================================
  // export / import
  // ============================================================
  describe('export / import', () => {
    it('should export to json', () => {
      manager.set('k1', 'v1');
      const json = manager.exportJson();
      expect(json).toContain('k1');
    });

    it('should import from json', () => {
      const json = JSON.stringify([
        { key: 'k1', value: 'v1', type: 'string', version: 1, updated: 1000 },
        { key: 'k2', value: '123', type: 'number', version: 1, updated: 1000 },
      ]);
      const count = manager.importJson(json);
      expect(count).toBe(2);
    });

    it('should return 0 for invalid json', () => {
      expect(manager.importJson('not json')).toBe(0);
    });
  });

  // ============================================================
  // clear
  // ============================================================
  describe('clear', () => {
    it('should clear history', () => {
      manager.set('k1', 'v1');
      manager.set('k1', 'v2');
      manager.clearHistory();
      expect(manager.getHistoryCount('k1')).toBe(0);
    });
  });

  // ============================================================
  // getRecent
  // ============================================================
  describe('getRecent', () => {
    it('should get recent configs', () => {
      manager.set('k1', 'v1');
      manager.set('k2', 'v2');
      const recent = manager.getRecent(1);
      expect(recent).toHaveLength(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many configs', () => {
      for (let i = 0; i < 50; i++) {
        manager.set(`k${i}`, `v${i}`);
      }
      expect(manager.getCount()).toBe(50);
    });
  });
});