/**
 * ConfigurationManager Tests
 * claude-code-design Configuration Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigurationManager } from '../ConfigurationManager';

describe('ConfigurationManager', () => {
  let manager: ConfigurationManager;

  beforeEach(() => {
    manager = new ConfigurationManager();
  });

  afterEach(() => {
    manager.clear();
  });

  // ============================================================
  // defineSchema
  // ============================================================
  describe('defineSchema', () => {
    it('should define schema', () => {
      manager.defineSchema({ key: 'name', type: 'string', required: true, default: 'default' });
      expect(manager.getSchemaCount()).toBe(1);
    });

    it('should set default value', () => {
      manager.defineSchema({ key: 'name', type: 'string', required: false, default: 'hello' });
      expect(manager.get<string>('name')).toBe('hello');
    });
  });

  // ============================================================
  // set / get
  // ============================================================
  describe('set / get', () => {
    it('should set value', () => {
      expect(manager.set('key1', 'value1')).toBe(true);
    });

    it('should get value', () => {
      manager.set('key1', 'value1');
      expect(manager.get<string>('key1')).toBe('value1');
    });

    it('should reject wrong type', () => {
      manager.defineSchema({ key: 'age', type: 'number', required: true });
      expect(manager.set('age', 'not a number')).toBe(false);
    });

    it('should accept correct type', () => {
      manager.defineSchema({ key: 'age', type: 'number', required: true });
      expect(manager.set('age', 42)).toBe(true);
    });
  });

  // ============================================================
  // validate
  // ============================================================
  describe('validate', () => {
    it('should pass valid', () => {
      manager.defineSchema({ key: 'name', type: 'string', required: true });
      manager.set('name', 'hello');
      expect(manager.validate().valid).toBe(true);
    });

    it('should fail missing required', () => {
      manager.defineSchema({ key: 'name', type: 'string', required: true });
      expect(manager.validate().valid).toBe(false);
    });

    it('should fail wrong type', () => {
      manager.defineSchema({ key: 'name', type: 'string', required: true });
      manager.set('name', 123);
      expect(manager.validate().valid).toBe(false);
    });
  });

  // ============================================================
  // export / import
  // ============================================================
  describe('export / import', () => {
    it('should export', () => {
      manager.set('key1', 'value1');
      const result = manager.export();
      expect(result.key1).toBe('value1');
    });

    it('should import', () => {
      expect(manager.import({ key1: 'value1' })).toBe(true);
    });

    it('should reject invalid import', () => {
      manager.defineSchema({ key: 'age', type: 'number', required: true });
      expect(manager.import({ age: 'invalid' })).toBe(false);
    });
  });

  // ============================================================
  // has / remove / clear / count
  // ============================================================
  describe('has / remove / clear / count', () => {
    it('should check existence', () => {
      manager.set('key1', 'value1');
      expect(manager.has('key1')).toBe(true);
    });

    it('should remove', () => {
      manager.set('key1', 'value1');
      expect(manager.remove('key1')).toBe(true);
    });

    it('should clear', () => {
      manager.set('key1', 'value1');
      manager.clear();
      expect(manager.getCount()).toBe(0);
    });

    it('should count', () => {
      expect(manager.getCount()).toBe(0);
      manager.set('key1', 'value1');
      expect(manager.getCount()).toBe(1);
    });
  });

  // ============================================================
  // all / keys
  // ============================================================
  describe('all / keys', () => {
    it('should get all', () => {
      manager.set('a', 1);
      manager.set('b', 2);
      expect(manager.getAll()).toHaveLength(2);
    });

    it('should get all keys', () => {
      manager.set('a', 1);
      manager.set('b', 2);
      expect(manager.getAllKeys()).toHaveLength(2);
    });
  });

  // ============================================================
  // schema queries
  // ============================================================
  describe('schema queries', () => {
    it('should get schema', () => {
      manager.defineSchema({ key: 'name', type: 'string', required: true });
      expect(manager.getSchema('name')?.type).toBe('string');
    });

    it('should check hasSchema', () => {
      manager.defineSchema({ key: 'name', type: 'string', required: true });
      expect(manager.hasSchema('name')).toBe(true);
    });

    it('should count schemas', () => {
      manager.defineSchema({ key: 'a', type: 'string', required: true });
      expect(manager.getSchemaCount()).toBe(1);
    });

    it('should remove schema', () => {
      manager.defineSchema({ key: 'a', type: 'string', required: true });
      expect(manager.removeSchema('a')).toBe(true);
    });

    it('should get type', () => {
      manager.defineSchema({ key: 'a', type: 'number', required: true });
      expect(manager.getType('a')).toBe('number');
    });

    it('should check required', () => {
      manager.defineSchema({ key: 'a', type: 'string', required: true });
      expect(manager.isRequired('a')).toBe(true);
    });

    it('should get default', () => {
      manager.defineSchema({ key: 'a', type: 'string', required: false, default: 'x' });
      expect(manager.getDefault('a')).toBe('x');
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset to default', () => {
      manager.defineSchema({ key: 'a', type: 'string', required: false, default: 'x' });
      manager.set('a', 'y');
      expect(manager.resetToDefault('a')).toBe(true);
    });

    it('should return false for no default', () => {
      manager.defineSchema({ key: 'a', type: 'string', required: true });
      expect(manager.resetToDefault('a')).toBe(false);
    });

    it('should reset all to defaults', () => {
      manager.defineSchema({ key: 'a', type: 'string', required: false, default: 'x' });
      manager.defineSchema({ key: 'b', type: 'string', required: false, default: 'y' });
      manager.set('a', 'modified');
      expect(manager.resetAllToDefaults()).toBe(2);
    });
  });

  // ============================================================
  // by type
  // ============================================================
  describe('by type', () => {
    it('should get by type', () => {
      manager.defineSchema({ key: 'a', type: 'string', required: false, default: 'x' });
      manager.defineSchema({ key: 'b', type: 'number', required: false, default: 5 });
      expect(manager.getByType('string')).toHaveLength(1);
    });
  });

  // ============================================================
  // required
  // ============================================================
  describe('required', () => {
    it('should get required configs', () => {
      manager.defineSchema({ key: 'a', type: 'string', required: true });
      expect(manager.getRequiredConfigs()).toContain('a');
    });

    it('should get missing required', () => {
      manager.defineSchema({ key: 'a', type: 'string', required: true });
      expect(manager.getMissingRequired()).toContain('a');
    });
  });

  // ============================================================
  // convenience
  // ============================================================
  describe('convenience', () => {
    it('should check isValid', () => {
      expect(manager.isValid()).toBe(true);
    });

    it('should get errors', () => {
      expect(manager.getErrors()).toEqual([]);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many configs', () => {
      for (let i = 0; i < 50; i++) {
        manager.set(`key${i}`, i);
      }
      expect(manager.getCount()).toBe(50);
    });
  });
});