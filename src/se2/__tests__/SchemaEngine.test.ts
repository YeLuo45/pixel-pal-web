/**
 * SchemaEngine Tests
 * claude-code-design Schema Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SchemaEngine } from '../SchemaEngine';

describe('SchemaEngine', () => {
  let se: SchemaEngine;

  beforeEach(() => {
    se = new SchemaEngine();
  });

  afterEach(() => {
    se.clearAll();
  });

  // ============================================================
  // define / validate
  // ============================================================
  describe('define / validate', () => {
    it('should define', () => {
      expect(se.define('s1', ['a', 'b'])).toBe('se2-1');
    });

    it('should mark as active', () => {
      const id = se.define('s1', ['a', 'b']);
      expect(se.isActive(id)).toBe(true);
    });

    it('should validate valid', () => {
      const id = se.define('s1', ['a', 'b']);
      expect(se.validate(id, true)).toBe(true);
    });

    it('should validate invalid', () => {
      const id = se.define('s1', ['a', 'b']);
      expect(se.validate(id, false)).toBe(true);
    });

    it('should increment valid on validate true', () => {
      const id = se.define('s1', ['a', 'b']);
      se.validate(id, true);
      expect(se.getValid(id)).toBe(1);
    });

    it('should increment invalid on validate false', () => {
      const id = se.define('s1', ['a', 'b']);
      se.validate(id, false);
      expect(se.getInvalid(id)).toBe(1);
    });

    it('should not validate inactive', () => {
      const id = se.define('s1', ['a', 'b']);
      se.setActive(id, false);
      expect(se.validate(id, true)).toBe(false);
    });

    it('should return false for unknown validate', () => {
      expect(se.validate('unknown', true)).toBe(false);
    });

    it('should add field', () => {
      const id = se.define('s1', ['a']);
      expect(se.addField(id, 'b')).toBe(true);
    });

    it('should not add duplicate field', () => {
      const id = se.define('s1', ['a']);
      expect(se.addField(id, 'a')).toBe(false);
    });

    it('should not add field inactive', () => {
      const id = se.define('s1', ['a']);
      se.setActive(id, false);
      expect(se.addField(id, 'b')).toBe(false);
    });

    it('should return false for unknown addField', () => {
      expect(se.addField('unknown', 'a')).toBe(false);
    });

    it('should remove field', () => {
      const id = se.define('s1', ['a', 'b']);
      expect(se.removeField(id, 'a')).toBe(true);
    });

    it('should not remove missing field', () => {
      const id = se.define('s1', ['a']);
      expect(se.removeField(id, 'b')).toBe(false);
    });

    it('should return false for unknown removeField', () => {
      expect(se.removeField('unknown', 'a')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      se.define('s1', ['a']);
      const stats = se.getStats();
      expect(stats.schemas).toBe(1);
    });

    it('should count total valid', () => {
      const id = se.define('s1', ['a']);
      se.validate(id, true);
      expect(se.getStats().totalValid).toBe(1);
    });

    it('should count total invalid', () => {
      const id = se.define('s1', ['a']);
      se.validate(id, false);
      expect(se.getStats().totalInvalid).toBe(1);
    });

    it('should count active', () => {
      se.define('s1', ['a']);
      expect(se.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = se.define('s1', ['a']);
      se.setActive(id, false);
      expect(se.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = se.define('s1', ['a']);
      se.validate(id, true);
      expect(se.getStats().totalHits).toBe(1);
    });

    it('should compute avg valid', () => {
      const id = se.define('s1', ['a']);
      se.validate(id, true);
      expect(se.getStats().avgValid).toBe(1);
    });

    it('should compute avg invalid', () => {
      const id = se.define('s1', ['a']);
      se.validate(id, false);
      expect(se.getStats().avgInvalid).toBe(1);
    });

    it('should count unique names', () => {
      se.define('s1', ['a']);
      se.define('s2', ['a']);
      expect(se.getStats().uniqueNames).toBe(2);
    });

    it('should count total fields', () => {
      se.define('s1', ['a', 'b']);
      se.define('s2', ['c']);
      expect(se.getStats().totalFields).toBe(3);
    });

    it('should compute valid rate', () => {
      const id = se.define('s1', ['a']);
      se.validate(id, true);
      expect(se.getStats().validRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get schema', () => {
      se.define('s1', ['a']);
      expect(se.getSchema('se2-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      se.define('s1', ['a']);
      expect(se.getAllSchemas()).toHaveLength(1);
    });

    it('should remove', () => {
      se.define('s1', ['a']);
      expect(se.removeSchema('se2-1')).toBe(true);
    });

    it('should check existence', () => {
      se.define('s1', ['a']);
      expect(se.hasSchema('se2-1')).toBe(true);
    });

    it('should count', () => {
      expect(se.getCount()).toBe(0);
      se.define('s1', ['a']);
      expect(se.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      se.define('s1', ['a']);
      expect(se.getName('se2-1')).toBe('s1');
    });

    it('should get fields', () => {
      se.define('s1', ['a', 'b']);
      expect(se.getFields('se2-1')).toEqual(['a', 'b']);
    });

    it('should get field count', () => {
      se.define('s1', ['a', 'b']);
      expect(se.getFieldCount('se2-1')).toBe(2);
    });

    it('should get valid', () => {
      se.define('s1', ['a']);
      expect(se.getValid('se2-1')).toBe(0);
    });

    it('should get invalid', () => {
      se.define('s1', ['a']);
      expect(se.getInvalid('se2-1')).toBe(0);
    });

    it('should get hits', () => {
      const id = se.define('s1', ['a']);
      se.validate(id, true);
      expect(se.getHits(id)).toBe(1);
    });

    it('should check hasField', () => {
      const id = se.define('s1', ['a']);
      expect(se.hasField(id, 'a')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      se.define('s1', ['a']);
      expect(se.setActive('se2-1', false)).toBe(true);
    });

    it('should set name', () => {
      se.define('s1', ['a']);
      expect(se.setName('se2-1', 's2')).toBe(true);
    });

    it('should set fields', () => {
      se.define('s1', ['a']);
      expect(se.setFields('se2-1', ['x', 'y'])).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(se.setActive('unknown', false)).toBe(false);
      expect(se.setName('unknown', 's')).toBe(false);
      expect(se.setFields('unknown', [])).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = se.define('s1', ['a']);
      se.validate(id, true);
      se.setActive(id, false);
      se.resetAll();
      expect(se.getValid(id)).toBe(0);
      expect(se.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      se.define('s1', ['a']);
      expect(se.getByName('s1')).toHaveLength(1);
    });

    it('should get active', () => {
      se.define('s1', ['a']);
      expect(se.getActiveSchemas()).toHaveLength(1);
    });

    it('should get inactive', () => {
      se.define('s1', ['a']);
      se.setActive('se2-1', false);
      expect(se.getInactiveSchemas()).toHaveLength(1);
    });

    it('should get all names', () => {
      se.define('s1', ['a']);
      se.define('s2', ['a']);
      expect(se.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      se.define('s1', ['a']);
      expect(se.getNameCount()).toBe(1);
    });

    it('should get all fields', () => {
      se.define('s1', ['a', 'b']);
      se.define('s2', ['c']);
      expect(se.getAllFields()).toHaveLength(3);
    });

    it('should get unique field count', () => {
      se.define('s1', ['a', 'b']);
      expect(se.getUniqueFieldCount()).toBe(2);
    });

    it('should get by min fields', () => {
      se.define('s1', ['a', 'b']);
      se.define('s2', ['c']);
      expect(se.getByMinFields(2)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most fields', () => {
      const id = se.define('s1', ['a', 'b', 'c']);
      se.define('s2', ['x']);
      expect(se.getMostFields()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(se.getMostFields()).toBeNull();
    });

    it('should get newest', () => {
      se.define('s1', ['a']);
      expect(se.getNewest()?.id).toBe('se2-1');
    });

    it('should return null for empty newest', () => {
      expect(se.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      se.define('s1', ['a']);
      expect(se.getOldest()?.id).toBe('se2-1');
    });

    it('should return null for empty oldest', () => {
      expect(se.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      se.define('s1', ['a']);
      expect(se.getCreatedAt('se2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = se.define('s1', ['a']);
      se.validate(id, true);
      expect(se.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total valid global', () => {
      const id = se.define('s1', ['a']);
      se.validate(id, true);
      expect(se.getTotalValidGlobal()).toBe(1);
    });

    it('should get total invalid global', () => {
      const id = se.define('s1', ['a']);
      se.validate(id, false);
      expect(se.getTotalInvalidGlobal()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many schemas', () => {
      for (let i = 0; i < 50; i++) {
        se.define(`s${i}`, ['a', 'b']);
      }
      expect(se.getCount()).toBe(50);
    });
  });
});