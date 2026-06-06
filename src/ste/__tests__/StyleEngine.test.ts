/**
 * StyleEngine Tests
 * claude-code-design Style Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StyleEngine } from '../StyleEngine';

describe('StyleEngine', () => {
  let ste: StyleEngine;

  beforeEach(() => {
    ste = new StyleEngine();
  });

  afterEach(() => {
    ste.clearAll();
  });

  // ============================================================
  // define / apply / reset
  // ============================================================
  describe('define / apply / reset', () => {
    it('should define', () => {
      expect(ste.define('s1', 'color', 'red')).toBe('ste-1');
    });

    it('should mark as active', () => {
      const id = ste.define('s1', 'color', 'red');
      expect(ste.isActive(id)).toBe(true);
    });

    it('should apply', () => {
      const id = ste.define('s1', 'color', 'red');
      expect(ste.apply(id)).toBe(true);
    });

    it('should increment applications on apply', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.apply(id);
      expect(ste.getApplications(id)).toBe(1);
    });

    it('should log history on apply', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.apply(id);
      expect(ste.getHistory(id)).toHaveLength(1);
    });

    it('should not apply inactive', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.setActive(id, false);
      expect(ste.apply(id)).toBe(false);
    });

    it('should return false for unknown apply', () => {
      expect(ste.apply('unknown')).toBe(false);
    });

    it('should reset', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.apply(id);
      expect(ste.reset(id)).toBe(true);
    });

    it('should mark as zero on reset', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.apply(id);
      ste.reset(id);
      expect(ste.getApplications(id)).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(ste.reset('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ste.define('s1', 'color', 'red');
      const stats = ste.getStats();
      expect(stats.styles).toBe(1);
    });

    it('should count total applications', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.apply(id);
      expect(ste.getStats().totalApplications).toBe(1);
    });

    it('should count active', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.setActive(id, false);
      expect(ste.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.apply(id);
      expect(ste.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      ste.define('s1', 'color', 'red');
      ste.define('s2', 'color', 'blue');
      expect(ste.getStats().uniqueNames).toBe(2);
    });

    it('should count unique properties', () => {
      ste.define('s1', 'color', 'red');
      ste.define('s2', 'size', '12px');
      expect(ste.getStats().uniqueProperties).toBe(2);
    });

    it('should compute avg applications', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.apply(id);
      expect(ste.getStats().avgApplications).toBe(1);
    });

    it('should get max applications', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.apply(id);
      ste.apply(id);
      expect(ste.getStats().maxApplications).toBe(2);
    });

    it('should get min applications', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getStats().minApplications).toBe(0);
    });

    it('should compute avg value length', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getStats().avgValueLength).toBe(3);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get style', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getStyle('ste-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getAllStyles()).toHaveLength(1);
    });

    it('should remove', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.removeStyle('ste-1')).toBe(true);
    });

    it('should check existence', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.hasStyle('ste-1')).toBe(true);
    });

    it('should count', () => {
      expect(ste.getCount()).toBe(0);
      ste.define('s1', 'color', 'red');
      expect(ste.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getName('ste-1')).toBe('s1');
    });

    it('should get property', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getProperty('ste-1')).toBe('color');
    });

    it('should get value', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getValue('ste-1')).toBe('red');
    });

    it('should get value length', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getValueLength('ste-1')).toBe(3);
    });

    it('should get history', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getHistory('ste-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.apply(id);
      expect(ste.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.setActive('ste-1', false)).toBe(true);
    });

    it('should set name', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.setName('ste-1', 's2')).toBe(true);
    });

    it('should set property', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.setProperty('ste-1', 'size')).toBe(true);
    });

    it('should set value', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.setValue('ste-1', 'blue')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ste.setActive('unknown', false)).toBe(false);
      expect(ste.setName('unknown', 's')).toBe(false);
      expect(ste.setProperty('unknown', 'p')).toBe(false);
      expect(ste.setValue('unknown', 'v')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.apply(id);
      ste.setActive(id, false);
      ste.resetAll();
      expect(ste.getApplications(id)).toBe(0);
      expect(ste.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / property / state
  // ============================================================
  describe('by name / property / state', () => {
    it('should get by name', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getByName('s1')).toHaveLength(1);
    });

    it('should get by property', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getByProperty('color')).toHaveLength(1);
    });

    it('should get active', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getActiveStyles()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ste.define('s1', 'color', 'red');
      ste.setActive('ste-1', false);
      expect(ste.getInactiveStyles()).toHaveLength(1);
    });

    it('should get all names', () => {
      ste.define('s1', 'color', 'red');
      ste.define('s2', 'color', 'blue');
      expect(ste.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getNameCount()).toBe(1);
    });

    it('should get all properties', () => {
      ste.define('s1', 'color', 'red');
      ste.define('s2', 'size', '12px');
      expect(ste.getAllProperties()).toHaveLength(2);
    });

    it('should get property count', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getPropertyCount()).toBe(1);
    });

    it('should get by min applications', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.apply(id);
      expect(ste.getByMinApplications(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most applications', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.apply(id);
      ste.apply(id);
      expect(ste.getMostApplications()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ste.getMostApplications()).toBeNull();
    });

    it('should get newest', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getNewest()?.id).toBe('ste-1');
    });

    it('should return null for empty newest', () => {
      expect(ste.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getOldest()?.id).toBe('ste-1');
    });

    it('should return null for empty oldest', () => {
      expect(ste.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ste.define('s1', 'color', 'red');
      expect(ste.getCreatedAt('ste-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.apply(id);
      expect(ste.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total applications', () => {
      const id = ste.define('s1', 'color', 'red');
      ste.apply(id);
      expect(ste.getTotalApplications()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many styles', () => {
      for (let i = 0; i < 50; i++) {
        ste.define(`s${i}`, 'color', 'red');
      }
      expect(ste.getCount()).toBe(50);
    });
  });
});