/**
 * SkeletonEngine Tests
 * nanobot-design Skeleton Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SkeletonEngine } from '../SkeletonEngine';

describe('SkeletonEngine', () => {
  let ske: SkeletonEngine;

  beforeEach(() => {
    ske = new SkeletonEngine();
  });

  afterEach(() => {
    ske.clearAll();
  });

  describe('add / addField / build / remove', () => {
    it('should add', () => {
      expect(ske.add('s1')).toMatch(/^ske-/);
    });

    it('should default built to false', () => {
      ske.add('s1');
      expect(ske.isBuilt(ske.getAllSkeletons()[0].id)).toBe(false);
    });

    it('should mark as active', () => {
      ske.add('s1');
      expect(ske.isActive(ske.getAllSkeletons()[0].id)).toBe(true);
    });

    it('should add field', () => {
      const id = ske.add('s1');
      expect(ske.addField(id, 'f1', 'string')).toBe(true);
    });

    it('should not add field inactive', () => {
      const id = ske.add('s1');
      ske.setActive(id, false);
      expect(ske.addField(id, 'f1', 'string')).toBe(false);
    });

    it('should return false for unknown addField', () => {
      expect(ske.addField('unknown', 'f1', 'string')).toBe(false);
    });

    it('should build', () => {
      const id = ske.add('s1');
      expect(ske.build(id)).toBe(true);
    });

    it('should set built', () => {
      const id = ske.add('s1');
      ske.build(id);
      expect(ske.isBuilt(id)).toBe(true);
    });

    it('should not build inactive', () => {
      const id = ske.add('s1');
      ske.setActive(id, false);
      expect(ske.build(id)).toBe(false);
    });

    it('should return false for unknown build', () => {
      expect(ske.build('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = ske.add('s1');
      expect(ske.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      ske.add('s1');
      expect(ske.getStats().skeletons).toBe(1);
    });

    it('should count total added', () => {
      ske.add('s1');
      expect(ske.getStats().totalAdded).toBe(1);
    });

    it('should count total built', () => {
      const id = ske.add('s1');
      ske.build(id);
      expect(ske.getStats().totalBuilt).toBe(1);
    });

    it('should count total fields', () => {
      const id = ske.add('s1');
      ske.addField(id, 'f1', 'string');
      expect(ske.getStats().totalFields).toBe(1);
    });

    it('should count string fields', () => {
      const id = ske.add('s1');
      ske.addField(id, 'f1', 'string');
      expect(ske.getStats().string).toBe(1);
    });

    it('should count number fields', () => {
      const id = ske.add('s1');
      ske.addField(id, 'f1', 'number');
      expect(ske.getStats().number).toBe(1);
    });

    it('should count boolean fields', () => {
      const id = ske.add('s1');
      ske.addField(id, 'f1', 'boolean');
      expect(ske.getStats().boolean).toBe(1);
    });

    it('should count date fields', () => {
      const id = ske.add('s1');
      ske.addField(id, 'f1', 'date');
      expect(ske.getStats().date).toBe(1);
    });

    it('should count object fields', () => {
      const id = ske.add('s1');
      ske.addField(id, 'f1', 'object');
      expect(ske.getStats().object).toBe(1);
    });

    it('should count built', () => {
      const id = ske.add('s1');
      ske.build(id);
      expect(ske.getStats().built).toBe(1);
    });

    it('should count unbuilt', () => {
      ske.add('s1');
      expect(ske.getStats().unbuilt).toBe(1);
    });

    it('should count active', () => {
      ske.add('s1');
      expect(ske.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ske.add('s1');
      ske.setActive(id, false);
      expect(ske.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ske.add('s1');
      ske.addField(id, 'f1', 'string');
      expect(ske.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      ske.add('a');
      ske.add('a');
      expect(ske.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get skeleton', () => {
      const id = ske.add('s1');
      expect(ske.getSkeleton(id)?.name).toBe('s1');
    });

    it('should get all', () => {
      ske.add('s1');
      expect(ske.getAllSkeletons()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = ske.add('s1');
      expect(ske.hasSkeleton(id)).toBe(true);
    });

    it('should count', () => {
      expect(ske.getCount()).toBe(0);
      ske.add('s1');
      expect(ske.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = ske.add('s1');
      expect(ske.getName(id)).toBe('s1');
    });

    it('should get fields', () => {
      const id = ske.add('s1');
      ske.addField(id, 'f1', 'string');
      expect(ske.getFields(id).size).toBe(1);
    });

    it('should get field count', () => {
      const id = ske.add('s1');
      ske.addField(id, 'f1', 'string');
      expect(ske.getFieldCount(id)).toBe(1);
    });

    it('should get built', () => {
      const id = ske.add('s1');
      ske.build(id);
      expect(ske.getBuilt(id)).toBe(true);
    });

    it('should get hits', () => {
      const id = ske.add('s1');
      ske.addField(id, 'f1', 'string');
      expect(ske.getHits(id)).toBe(1);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = ske.add('s1');
      expect(ske.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = ske.add('s1');
      expect(ske.setName(id, 's2')).toBe(true);
    });

    it('should remove field', () => {
      const id = ske.add('s1');
      ske.addField(id, 'f1', 'string');
      expect(ske.removeField(id, 'f1')).toBe(true);
    });

    it('should set built', () => {
      const id = ske.add('s1');
      expect(ske.setBuilt(id, true)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ske.setActive('unknown', false)).toBe(false);
      expect(ske.setName('unknown', 's')).toBe(false);
      expect(ske.removeField('unknown', 'f')).toBe(false);
      expect(ske.setBuilt('unknown', true)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = ske.add('s1');
      ske.addField(id, 'f1', 'string');
      ske.build(id);
      ske.setActive(id, false);
      ske.resetAll();
      expect(ske.getFieldCount(id)).toBe(0);
      expect(ske.isActive(id)).toBe(true);
    });
  });

  describe('by built / state', () => {
    it('should get by built', () => {
      ske.add('s1');
      expect(ske.getByBuilt(false)).toHaveLength(1);
    });

    it('should get active', () => {
      ske.add('s1');
      expect(ske.getActiveSkeletons()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = ske.add('s1');
      ske.setActive(id, false);
      expect(ske.getInactiveSkeletons()).toHaveLength(1);
    });

    it('should get all names', () => {
      ske.add('a');
      ske.add('b');
      expect(ske.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      ske.add('s1');
      expect(ske.getNewest()?.name).toBe('s1');
    });

    it('should return null for empty newest', () => {
      expect(ske.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ske.add('s1');
      expect(ske.getOldest()?.name).toBe('s1');
    });

    it('should return null for empty oldest', () => {
      expect(ske.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = ske.add('s1');
      expect(ske.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ske.add('s1');
      ske.addField(id, 'f1', 'string');
      expect(ske.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      ske.add('s1');
      expect(ske.getTotalAdded()).toBe(1);
    });

    it('should get total built', () => {
      const id = ske.add('s1');
      ske.build(id);
      expect(ske.getTotalBuilt()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many skeletons', () => {
      for (let i = 0; i < 50; i++) {
        ske.add(`s${i}`);
      }
      expect(ske.getCount()).toBe(50);
    });
  });
});