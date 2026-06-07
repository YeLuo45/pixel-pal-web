/**
 * PriorityEngine Tests
 * generic-agent-design Priority Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PriorityEngine } from '../PriorityEngine';

describe('PriorityEngine', () => {
  let pre: PriorityEngine;

  beforeEach(() => {
    pre = new PriorityEngine();
  });

  afterEach(() => {
    pre.clearAll();
  });

  describe('add / promote / demote / remove', () => {
    it('should add', () => {
      expect(pre.add('item1')).toBe('pre-1');
    });

    it('should default level to medium', () => {
      pre.add('item1');
      expect(pre.getLevel('pre-1')).toBe('medium');
    });

    it('should mark as active', () => {
      pre.add('item1');
      expect(pre.isActive('pre-1')).toBe(true);
    });

    it('should promote', () => {
      pre.add('item1', 'low');
      expect(pre.promote('pre-1', 5)).toBe(true);
    });

    it('should change level on promote', () => {
      pre.add('item1', 'low');
      pre.promote('pre-1', 5);
      expect(pre.getLevel('pre-1')).toBe('high');
    });

    it('should not promote inactive', () => {
      pre.add('item1');
      pre.setActive('pre-1', false);
      expect(pre.promote('pre-1')).toBe(false);
    });

    it('should return false for unknown promote', () => {
      expect(pre.promote('unknown')).toBe(false);
    });

    it('should demote', () => {
      pre.add('item1', 'high');
      expect(pre.demote('pre-1', 3)).toBe(true);
    });

    it('should not demote inactive', () => {
      pre.add('item1');
      pre.setActive('pre-1', false);
      expect(pre.demote('pre-1')).toBe(false);
    });

    it('should return false for unknown demote', () => {
      expect(pre.demote('unknown')).toBe(false);
    });

    it('should remove', () => {
      pre.add('item1');
      expect(pre.remove('pre-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      pre.add('item1');
      expect(pre.getStats().items).toBe(1);
    });

    it('should count total added', () => {
      pre.add('item1');
      expect(pre.getStats().totalAdded).toBe(1);
    });

    it('should count total promoted', () => {
      pre.add('item1', 'low');
      pre.promote('pre-1');
      expect(pre.getStats().totalPromoted).toBe(1);
    });

    it('should count total demoted', () => {
      pre.add('item1', 'high');
      pre.demote('pre-1');
      expect(pre.getStats().totalDemoted).toBe(1);
    });

    it('should count low', () => {
      pre.add('item1', 'low');
      expect(pre.getStats().low).toBe(1);
    });

    it('should count medium', () => {
      pre.add('item1', 'medium');
      expect(pre.getStats().medium).toBe(1);
    });

    it('should count high', () => {
      pre.add('item1', 'high');
      expect(pre.getStats().high).toBe(1);
    });

    it('should count critical', () => {
      pre.add('item1', 'critical');
      expect(pre.getStats().critical).toBe(1);
    });

    it('should count active', () => {
      pre.add('item1');
      expect(pre.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      pre.add('item1');
      pre.setActive('pre-1', false);
      expect(pre.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      pre.add('item1');
      pre.promote('pre-1');
      expect(pre.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      pre.add('a');
      pre.add('a');
      expect(pre.getStats().uniqueNames).toBe(1);
    });

    it('should compute avg score', () => {
      pre.add('a', 'low');
      pre.add('b', 'high');
      expect(pre.getStats().avgScore).toBe(5.5);
    });

    it('should get max score', () => {
      pre.add('a', 'low');
      pre.add('b', 'high');
      expect(pre.getStats().maxScore).toBe(10);
    });

    it('should get min score', () => {
      pre.add('a', 'low');
      pre.add('b', 'high');
      expect(pre.getStats().minScore).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get item', () => {
      pre.add('item1');
      expect(pre.getItem('pre-1')?.name).toBe('item1');
    });

    it('should get all', () => {
      pre.add('item1');
      expect(pre.getAllItems()).toHaveLength(1);
    });

    it('should check existence', () => {
      pre.add('item1');
      expect(pre.hasItem('pre-1')).toBe(true);
    });

    it('should count', () => {
      expect(pre.getCount()).toBe(0);
      pre.add('item1');
      expect(pre.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      pre.add('item1');
      expect(pre.getName('pre-1')).toBe('item1');
    });

    it('should get score', () => {
      pre.add('item1', 'medium');
      expect(pre.getScore('pre-1')).toBe(5);
    });

    it('should get hits', () => {
      pre.add('item1');
      pre.promote('pre-1');
      expect(pre.getHits('pre-1')).toBe(1);
    });

    it('should check low', () => {
      pre.add('item1', 'low');
      expect(pre.isLow('pre-1')).toBe(true);
    });

    it('should check medium', () => {
      pre.add('item1', 'medium');
      expect(pre.isMedium('pre-1')).toBe(true);
    });

    it('should check high', () => {
      pre.add('item1', 'high');
      expect(pre.isHigh('pre-1')).toBe(true);
    });

    it('should check critical', () => {
      pre.add('item1', 'critical');
      expect(pre.isCritical('pre-1')).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      pre.add('item1');
      expect(pre.setActive('pre-1', false)).toBe(true);
    });

    it('should set name', () => {
      pre.add('item1');
      expect(pre.setName('pre-1', 'item2')).toBe(true);
    });

    it('should set level', () => {
      pre.add('item1');
      expect(pre.setLevel('pre-1', 'high')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pre.setActive('unknown', false)).toBe(false);
      expect(pre.setName('unknown', 'i')).toBe(false);
      expect(pre.setLevel('unknown', 'high')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      pre.add('item1');
      pre.promote('pre-1');
      pre.setActive('pre-1', false);
      pre.resetAll();
      expect(pre.getHits('pre-1')).toBe(0);
      expect(pre.isActive('pre-1')).toBe(true);
    });
  });

  describe('by level / state', () => {
    it('should get by level', () => {
      pre.add('item1', 'low');
      expect(pre.getByLevel('low')).toHaveLength(1);
    });

    it('should get active', () => {
      pre.add('item1');
      expect(pre.getActiveItems()).toHaveLength(1);
    });

    it('should get inactive', () => {
      pre.add('item1');
      pre.setActive('pre-1', false);
      expect(pre.getInactiveItems()).toHaveLength(1);
    });

    it('should get all names', () => {
      pre.add('a');
      pre.add('b');
      expect(pre.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      pre.add('item1');
      expect(pre.getNewest()?.id).toBe('pre-1');
    });

    it('should return null for empty newest', () => {
      expect(pre.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pre.add('item1');
      expect(pre.getOldest()?.id).toBe('pre-1');
    });

    it('should return null for empty oldest', () => {
      expect(pre.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      pre.add('item1');
      expect(pre.getCreatedAt('pre-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      pre.add('item1');
      pre.promote('pre-1');
      expect(pre.getUpdatedAt('pre-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      pre.add('item1');
      expect(pre.getTotalAdded()).toBe(1);
    });

    it('should get total promoted', () => {
      pre.add('item1');
      pre.promote('pre-1');
      expect(pre.getTotalPromoted()).toBe(1);
    });

    it('should get total demoted', () => {
      pre.add('item1', 'high');
      pre.demote('pre-1');
      expect(pre.getTotalDemoted()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many items', () => {
      for (let i = 0; i < 50; i++) {
        pre.add(`item${i}`);
      }
      expect(pre.getCount()).toBe(50);
    });
  });
});