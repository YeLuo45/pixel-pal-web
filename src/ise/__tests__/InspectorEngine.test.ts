/**
 * InspectorEngine Tests
 * claude-code-design Inspector Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InspectorEngine } from '../InspectorEngine';

describe('InspectorEngine', () => {
  let ise: InspectorEngine;

  beforeEach(() => {
    ise = new InspectorEngine();
  });

  afterEach(() => {
    ise.clearAll();
  });

  describe('add / inspect / remove', () => {
    it('should add', () => {
      expect(ise.add('e1', {})).toMatch(/^ise-/);
    });

    it('should set kind object', () => {
      ise.add('e1', {});
      expect(ise.getKind(ise.getAllEntries()[0].id)).toBe('object');
    });

    it('should set kind array', () => {
      ise.add('e1', []);
      expect(ise.getKind(ise.getAllEntries()[0].id)).toBe('array');
    });

    it('should set kind function', () => {
      ise.add('e1', () => {});
      expect(ise.getKind(ise.getAllEntries()[0].id)).toBe('function');
    });

    it('should set kind string', () => {
      ise.add('e1', 'hi');
      expect(ise.getKind(ise.getAllEntries()[0].id)).toBe('string');
    });

    it('should set kind number', () => {
      ise.add('e1', 42);
      expect(ise.getKind(ise.getAllEntries()[0].id)).toBe('number');
    });

    it('should set kind boolean', () => {
      ise.add('e1', true);
      expect(ise.getKind(ise.getAllEntries()[0].id)).toBe('boolean');
    });

    it('should mark as active', () => {
      ise.add('e1', {});
      expect(ise.isActive(ise.getAllEntries()[0].id)).toBe(true);
    });

    it('should inspect', () => {
      const id = ise.add('e1', {});
      expect(ise.inspect(id)).toBe(true);
    });

    it('should not inspect inactive', () => {
      const id = ise.add('e1', {});
      ise.setActive(id, false);
      expect(ise.inspect(id)).toBe(false);
    });

    it('should return false for unknown inspect', () => {
      expect(ise.inspect('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = ise.add('e1', {});
      expect(ise.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      ise.add('e1', {});
      expect(ise.getStats().entries).toBe(1);
    });

    it('should count total added', () => {
      ise.add('e1', {});
      expect(ise.getStats().totalAdded).toBe(1);
    });

    it('should count total inspected', () => {
      const id = ise.add('e1', {});
      ise.inspect(id);
      expect(ise.getStats().totalInspected).toBe(1);
    });

    it('should count object', () => {
      ise.add('e1', {});
      expect(ise.getStats().object).toBe(1);
    });

    it('should count array', () => {
      ise.add('e1', []);
      expect(ise.getStats().array).toBe(1);
    });

    it('should count function', () => {
      ise.add('e1', () => {});
      expect(ise.getStats().function).toBe(1);
    });

    it('should count string', () => {
      ise.add('e1', 'hi');
      expect(ise.getStats().string).toBe(1);
    });

    it('should count number', () => {
      ise.add('e1', 42);
      expect(ise.getStats().number).toBe(1);
    });

    it('should count boolean', () => {
      ise.add('e1', true);
      expect(ise.getStats().boolean).toBe(1);
    });

    it('should count active', () => {
      ise.add('e1', {});
      expect(ise.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ise.add('e1', {});
      ise.setActive(id, false);
      expect(ise.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ise.add('e1', {});
      ise.inspect(id);
      expect(ise.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      ise.add('a', {});
      ise.add('a', {});
      expect(ise.getStats().uniqueNames).toBe(1);
    });

    it('should count total detail len', () => {
      ise.add('e1', {});
      expect(ise.getStats().totalDetailLen).toBeGreaterThan(0);
    });
  });

  describe('queries', () => {
    it('should get entry', () => {
      const id = ise.add('e1', {});
      expect(ise.getEntry(id)?.name).toBe('e1');
    });

    it('should get all', () => {
      ise.add('e1', {});
      expect(ise.getAllEntries()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = ise.add('e1', {});
      expect(ise.hasEntry(id)).toBe(true);
    });

    it('should count', () => {
      expect(ise.getCount()).toBe(0);
      ise.add('e1', {});
      expect(ise.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = ise.add('e1', {});
      expect(ise.getName(id)).toBe('e1');
    });

    it('should get detail', () => {
      const id = ise.add('e1', { a: 1 });
      expect(ise.getDetail(id)).toBe('{"a":1}');
    });

    it('should get hits', () => {
      const id = ise.add('e1', {});
      ise.inspect(id);
      expect(ise.getHits(id)).toBe(1);
    });

    it('should check object', () => {
      ise.add('e1', {});
      expect(ise.isObject(ise.getAllEntries()[0].id)).toBe(true);
    });

    it('should check array', () => {
      ise.add('e1', []);
      expect(ise.isArray(ise.getAllEntries()[0].id)).toBe(true);
    });

    it('should check function', () => {
      ise.add('e1', () => {});
      expect(ise.isFunction(ise.getAllEntries()[0].id)).toBe(true);
    });

    it('should check string', () => {
      ise.add('e1', 'hi');
      expect(ise.isString(ise.getAllEntries()[0].id)).toBe(true);
    });

    it('should check number', () => {
      ise.add('e1', 42);
      expect(ise.isNumber(ise.getAllEntries()[0].id)).toBe(true);
    });

    it('should check boolean', () => {
      ise.add('e1', true);
      expect(ise.isBoolean(ise.getAllEntries()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = ise.add('e1', {});
      expect(ise.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = ise.add('e1', {});
      expect(ise.setName(id, 'e2')).toBe(true);
    });

    it('should set kind', () => {
      const id = ise.add('e1', {});
      expect(ise.setKind(id, 'string')).toBe(true);
    });

    it('should set detail', () => {
      const id = ise.add('e1', {});
      expect(ise.setDetail(id, 'custom')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ise.setActive('unknown', false)).toBe(false);
      expect(ise.setName('unknown', 'e')).toBe(false);
      expect(ise.setKind('unknown', 'object')).toBe(false);
      expect(ise.setDetail('unknown', 'd')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = ise.add('e1', {});
      ise.setActive(id, false);
      ise.resetAll();
      expect(ise.isActive(id)).toBe(true);
    });
  });

  describe('by kind / state', () => {
    it('should get by kind', () => {
      ise.add('e1', {});
      expect(ise.getByKind('object')).toHaveLength(1);
    });

    it('should get active', () => {
      ise.add('e1', {});
      expect(ise.getActiveEntries()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = ise.add('e1', {});
      ise.setActive(id, false);
      expect(ise.getInactiveEntries()).toHaveLength(1);
    });

    it('should get all names', () => {
      ise.add('a', {});
      ise.add('b', {});
      expect(ise.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      ise.add('e1', {});
      expect(ise.getNewest()?.name).toBe('e1');
    });

    it('should return null for empty newest', () => {
      expect(ise.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ise.add('e1', {});
      expect(ise.getOldest()?.name).toBe('e1');
    });

    it('should return null for empty oldest', () => {
      expect(ise.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = ise.add('e1', {});
      expect(ise.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ise.add('e1', {});
      ise.inspect(id);
      expect(ise.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      ise.add('e1', {});
      expect(ise.getTotalAdded()).toBe(1);
    });

    it('should get total inspected', () => {
      const id = ise.add('e1', {});
      ise.inspect(id);
      expect(ise.getTotalInspected()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        ise.add(`e${i}`, {});
      }
      expect(ise.getCount()).toBe(50);
    });
  });
});