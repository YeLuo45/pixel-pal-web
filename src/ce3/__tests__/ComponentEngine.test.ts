/**
 * ComponentEngine Tests
 * claude-code-design Component Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentEngine } from '../ComponentEngine';

describe('ComponentEngine', () => {
  let ce: ComponentEngine;

  beforeEach(() => {
    ce = new ComponentEngine();
  });

  afterEach(() => {
    ce.clearAll();
  });

  // ============================================================
  // register / use
  // ============================================================
  describe('register / use', () => {
    it('should register', () => {
      expect(ce.register('Button', 'ui')).toBe('ce3-1');
    });

    it('should mark as active', () => {
      const id = ce.register('Button', 'ui');
      expect(ce.isActive(id)).toBe(true);
    });

    it('should use', () => {
      const id = ce.register('Button', 'ui');
      expect(ce.use(id)).toBe(true);
    });

    it('should increment usages on use', () => {
      const id = ce.register('Button', 'ui');
      ce.use(id);
      expect(ce.getUsages(id)).toBe(1);
    });

    it('should log history on use', () => {
      const id = ce.register('Button', 'ui');
      ce.use(id);
      expect(ce.getHistory(id)).toHaveLength(1);
    });

    it('should not use inactive', () => {
      const id = ce.register('Button', 'ui');
      ce.setActive(id, false);
      expect(ce.use(id)).toBe(false);
    });

    it('should return false for unknown use', () => {
      expect(ce.use('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ce.register('Button', 'ui');
      const stats = ce.getStats();
      expect(stats.components).toBe(1);
    });

    it('should count total usages', () => {
      const id = ce.register('Button', 'ui');
      ce.use(id);
      expect(ce.getStats().totalUsages).toBe(1);
    });

    it('should count active', () => {
      ce.register('Button', 'ui');
      expect(ce.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ce.register('Button', 'ui');
      ce.setActive(id, false);
      expect(ce.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ce.register('Button', 'ui');
      ce.use(id);
      expect(ce.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      ce.register('Button', 'ui');
      ce.register('Input', 'ui');
      expect(ce.getStats().uniqueNames).toBe(2);
    });

    it('should count unique types', () => {
      ce.register('Button', 'ui');
      ce.register('Service', 'logic');
      expect(ce.getStats().uniqueTypes).toBe(2);
    });

    it('should compute avg usages', () => {
      const id = ce.register('Button', 'ui');
      ce.use(id);
      expect(ce.getStats().avgUsages).toBe(1);
    });

    it('should get max usages', () => {
      const id = ce.register('Button', 'ui');
      ce.use(id);
      ce.use(id);
      expect(ce.getStats().maxUsages).toBe(2);
    });

    it('should get min usages', () => {
      ce.register('Button', 'ui');
      expect(ce.getStats().minUsages).toBe(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get component', () => {
      ce.register('Button', 'ui');
      expect(ce.getComponent('ce3-1')?.name).toBe('Button');
    });

    it('should get all', () => {
      ce.register('Button', 'ui');
      expect(ce.getAllComponents()).toHaveLength(1);
    });

    it('should remove', () => {
      ce.register('Button', 'ui');
      expect(ce.removeComponent('ce3-1')).toBe(true);
    });

    it('should check existence', () => {
      ce.register('Button', 'ui');
      expect(ce.hasComponent('ce3-1')).toBe(true);
    });

    it('should count', () => {
      expect(ce.getCount()).toBe(0);
      ce.register('Button', 'ui');
      expect(ce.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      ce.register('Button', 'ui');
      expect(ce.getName('ce3-1')).toBe('Button');
    });

    it('should get type', () => {
      ce.register('Button', 'ui');
      expect(ce.getType('ce3-1')).toBe('ui');
    });

    it('should get usages', () => {
      ce.register('Button', 'ui');
      expect(ce.getUsages('ce3-1')).toBe(0);
    });

    it('should get history', () => {
      ce.register('Button', 'ui');
      expect(ce.getHistory('ce3-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = ce.register('Button', 'ui');
      ce.use(id);
      expect(ce.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ce.register('Button', 'ui');
      expect(ce.setActive('ce3-1', false)).toBe(true);
    });

    it('should set name', () => {
      ce.register('Button', 'ui');
      expect(ce.setName('ce3-1', 'Input')).toBe(true);
    });

    it('should set type', () => {
      ce.register('Button', 'ui');
      expect(ce.setType('ce3-1', 'logic')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ce.setActive('unknown', false)).toBe(false);
      expect(ce.setName('unknown', 'n')).toBe(false);
      expect(ce.setType('unknown', 't')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ce.register('Button', 'ui');
      ce.use(id);
      ce.setActive(id, false);
      ce.resetAll();
      expect(ce.getUsages(id)).toBe(0);
      expect(ce.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / type
  // ============================================================
  describe('by name / type', () => {
    it('should get by name', () => {
      ce.register('Button', 'ui');
      expect(ce.getByName('Button')).toHaveLength(1);
    });

    it('should get by type', () => {
      ce.register('Button', 'ui');
      ce.register('Input', 'ui');
      expect(ce.getByType('ui')).toHaveLength(2);
    });

    it('should get active', () => {
      ce.register('Button', 'ui');
      expect(ce.getActiveComponents()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ce.register('Button', 'ui');
      ce.setActive('ce3-1', false);
      expect(ce.getInactiveComponents()).toHaveLength(1);
    });

    it('should get all names', () => {
      ce.register('Button', 'ui');
      ce.register('Input', 'ui');
      expect(ce.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      ce.register('Button', 'ui');
      expect(ce.getNameCount()).toBe(1);
    });

    it('should get all types', () => {
      ce.register('Button', 'ui');
      ce.register('Service', 'logic');
      expect(ce.getAllTypes()).toHaveLength(2);
    });

    it('should get type count', () => {
      ce.register('Button', 'ui');
      expect(ce.getTypeCount()).toBe(1);
    });

    it('should get by min usages', () => {
      const id = ce.register('Button', 'ui');
      ce.use(id);
      expect(ce.getByMinUsages(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most usages', () => {
      const id = ce.register('Button', 'ui');
      ce.use(id);
      ce.use(id);
      expect(ce.getMostUsages()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ce.getMostUsages()).toBeNull();
    });

    it('should get newest', () => {
      ce.register('Button', 'ui');
      expect(ce.getNewest()?.id).toBe('ce3-1');
    });

    it('should return null for empty newest', () => {
      expect(ce.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ce.register('Button', 'ui');
      expect(ce.getOldest()?.id).toBe('ce3-1');
    });

    it('should return null for empty oldest', () => {
      expect(ce.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ce.register('Button', 'ui');
      expect(ce.getCreatedAt('ce3-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ce.register('Button', 'ui');
      ce.use(id);
      expect(ce.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total usages', () => {
      const id = ce.register('Button', 'ui');
      ce.use(id);
      expect(ce.getTotalUsages()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many components', () => {
      for (let i = 0; i < 50; i++) {
        ce.register(`c${i}`, 'ui');
      }
      expect(ce.getCount()).toBe(50);
    });
  });
});