/**
 * AttentionEngine Tests
 * generic-agent-design Attention Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AttentionEngine } from '../AttentionEngine';

describe('AttentionEngine', () => {
  let ae: AttentionEngine;

  beforeEach(() => {
    ae = new AttentionEngine();
  });

  afterEach(() => {
    ae.clearAll();
  });

  // ============================================================
  // define / focus / getCurrent
  // ============================================================
  describe('define / focus / getCurrent', () => {
    it('should define', () => {
      expect(ae.define('f1', 0.5)).toBe('foc-1');
    });

    it('should focus', () => {
      const id = ae.define('f1', 0.5);
      expect(ae.focus(id)).toBe(true);
    });

    it('should not focus inactive', () => {
      const id = ae.define('f1', 0.5);
      ae.setActive(id, false);
      expect(ae.focus(id)).toBe(false);
    });

    it('should get current', () => {
      const id = ae.define('f1', 0.5);
      ae.focus(id);
      expect(ae.getCurrent()?.id).toBe(id);
    });

    it('should return null for empty current', () => {
      expect(ae.getCurrent()).toBeNull();
    });

    it('should return null for unknown focus', () => {
      expect(ae.focus('unknown')).toBe(false);
    });

    it('should increment hits on focus', () => {
      const id = ae.define('f1', 0.5);
      ae.focus(id);
      expect(ae.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ae.define('f1', 0.5);
      const stats = ae.getStats();
      expect(stats.focuses).toBe(1);
    });

    it('should count active', () => {
      ae.define('f1', 0.5);
      expect(ae.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ae.define('f1', 0.5);
      ae.setActive(id, false);
      expect(ae.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ae.define('f1', 0.5);
      ae.focus(id);
      expect(ae.getStats().totalHits).toBe(1);
    });

    it('should compute avg weight', () => {
      ae.define('f1', 0.5);
      expect(ae.getStats().avgWeight).toBe(0.5);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get focus', () => {
      ae.define('f1', 0.5);
      expect(ae.getFocus('foc-1')?.name).toBe('f1');
    });

    it('should get all', () => {
      ae.define('f1', 0.5);
      expect(ae.getAllFocuses()).toHaveLength(1);
    });

    it('should remove', () => {
      ae.define('f1', 0.5);
      expect(ae.removeFocus('foc-1')).toBe(true);
    });

    it('should check existence', () => {
      ae.define('f1', 0.5);
      expect(ae.hasFocus('foc-1')).toBe(true);
    });

    it('should count', () => {
      expect(ae.getCount()).toBe(0);
      ae.define('f1', 0.5);
      expect(ae.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      ae.define('f1', 0.5);
      expect(ae.getName('foc-1')).toBe('f1');
    });

    it('should get weight', () => {
      ae.define('f1', 0.5);
      expect(ae.getWeight('foc-1')).toBe(0.5);
    });

    it('should get hits', () => {
      const id = ae.define('f1', 0.5);
      ae.focus(id);
      expect(ae.getHits(id)).toBe(1);
    });

    it('should check isActive', () => {
      ae.define('f1', 0.5);
      expect(ae.isActive('foc-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = ae.define('f1', 0.5);
      expect(ae.setActive(id, false)).toBe(true);
    });

    it('should set weight', () => {
      const id = ae.define('f1', 0.5);
      expect(ae.setWeight(id, 0.8)).toBe(true);
    });

    it('should set name', () => {
      const id = ae.define('f1', 0.5);
      expect(ae.setName(id, 'f2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ae.setActive('unknown', false)).toBe(false);
      expect(ae.setWeight('unknown', 0.5)).toBe(false);
      expect(ae.setName('unknown', 'a')).toBe(false);
    });

    it('should clear current on setActive false', () => {
      const id = ae.define('f1', 0.5);
      ae.focus(id);
      ae.setActive(id, false);
      expect(ae.getCurrent()).toBeNull();
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset hits', () => {
      const id = ae.define('f1', 0.5);
      ae.focus(id);
      ae.resetHits();
      expect(ae.getHits(id)).toBe(0);
    });

    it('should reset all', () => {
      const id = ae.define('f1', 0.5);
      ae.focus(id);
      ae.resetAll();
      expect(ae.getHits(id)).toBe(0);
      expect(ae.getCurrent()).toBeNull();
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      ae.define('f1', 0.5);
      expect(ae.getByName('f1')).toHaveLength(1);
    });

    it('should get active', () => {
      ae.define('f1', 0.5);
      expect(ae.getActiveFocuses()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = ae.define('f1', 0.5);
      ae.setActive(id, false);
      expect(ae.getInactiveFocuses()).toHaveLength(1);
    });

    it('should get by min weight', () => {
      ae.define('f1', 0.5);
      expect(ae.getByMinWeight(0.3)).toHaveLength(1);
    });

    it('should get sorted by weight', () => {
      ae.define('low', 0.3);
      ae.define('high', 0.9);
      expect(ae.getSortedByWeight()[0].name).toBe('high');
    });

    it('should get all names', () => {
      ae.define('f1', 0.5);
      ae.define('f2', 0.6);
      expect(ae.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      ae.define('f1', 0.5);
      expect(ae.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most hit', () => {
      const id = ae.define('f1', 0.5);
      ae.focus(id);
      expect(ae.getMostHit()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(ae.getMostHit()).toBeNull();
    });

    it('should get highest weight', () => {
      ae.define('f1', 0.5);
      expect(ae.getHighestWeight()?.id).toBe('foc-1');
    });

    it('should return null for empty highest', () => {
      expect(ae.getHighestWeight()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ae.define('f1', 0.5);
      expect(ae.getCreatedAt('foc-1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // current id
  // ============================================================
  describe('current id', () => {
    it('should get current id', () => {
      const id = ae.define('f1', 0.5);
      ae.focus(id);
      expect(ae.getCurrentId()).toBe(id);
    });

    it('should return null for empty current id', () => {
      expect(ae.getCurrentId()).toBeNull();
    });

    it('should clear current on remove', () => {
      const id = ae.define('f1', 0.5);
      ae.focus(id);
      ae.removeFocus(id);
      expect(ae.getCurrentId()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many focuses', () => {
      for (let i = 0; i < 50; i++) {
        ae.define(`f${i}`, 0.5);
      }
      expect(ae.getCount()).toBe(50);
    });
  });
});