/**
 * RefactorEngine Tests
 * claude-code-design Refactor Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RefactorEngine } from '../RefactorEngine';

describe('RefactorEngine', () => {
  let re: RefactorEngine;

  beforeEach(() => {
    re = new RefactorEngine();
  });

  afterEach(() => {
    re.clearAll();
  });

  // ============================================================
  // addRule / apply
  // ============================================================
  describe('addRule / apply', () => {
    it('should add rule', () => {
      expect(re.addRule('r1', 'var ', 'let ')).toBe('re-1');
    });

    it('should mark as active', () => {
      const id = re.addRule('r1', 'var ', 'let ');
      expect(re.isActive(id)).toBe(true);
    });

    it('should apply', () => {
      const id = re.addRule('r1', 'var ', 'let ');
      expect(re.apply(id, 'var x = 1')).toBe('let x = 1');
    });

    it('should increment applied on change', () => {
      const id = re.addRule('r1', 'var ', 'let ');
      re.apply(id, 'var x = 1');
      expect(re.getApplied(id)).toBe(1);
    });

    it('should not increment applied on no change', () => {
      const id = re.addRule('r1', 'var ', 'let ');
      re.apply(id, 'const x = 1');
      expect(re.getApplied(id)).toBe(0);
    });

    it('should return code unchanged for unknown', () => {
      expect(re.apply('unknown', 'code')).toBe('code');
    });

    it('should not apply inactive', () => {
      const id = re.addRule('r1', 'var ', 'let ');
      re.setActive(id, false);
      expect(re.apply(id, 'var x = 1')).toBe('var x = 1');
    });

    it('should increment hits on apply', () => {
      const id = re.addRule('r1', 'var ', 'let ');
      re.apply(id, 'code');
      expect(re.getHits(id)).toBe(1);
    });

    it('should apply all', () => {
      re.addRule('r1', 'var ', 'let ');
      re.addRule('r2', 'let ', 'const ');
      expect(re.applyAll('var x = 1')).toBe('const x = 1');
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      re.addRule('r1', 'a', 'b');
      const stats = re.getStats();
      expect(stats.rules).toBe(1);
    });

    it('should count total applied', () => {
      const id = re.addRule('r1', 'a', 'b');
      re.apply(id, 'abc');
      expect(re.getStats().totalApplied).toBe(1);
    });

    it('should count total hits', () => {
      const id = re.addRule('r1', 'a', 'b');
      re.apply(id, 'code');
      expect(re.getStats().totalHits).toBe(1);
    });

    it('should count active', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = re.addRule('r1', 'a', 'b');
      re.setActive(id, false);
      expect(re.getStats().inactive).toBe(1);
    });

    it('should compute avg applied', () => {
      const id = re.addRule('r1', 'a', 'b');
      re.apply(id, 'abc');
      expect(re.getStats().avgApplied).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get rule', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.getRule('re-1')?.name).toBe('r1');
    });

    it('should get all', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.getAllRules()).toHaveLength(1);
    });

    it('should remove', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.removeRule('re-1')).toBe(true);
    });

    it('should check existence', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.hasRule('re-1')).toBe(true);
    });

    it('should count', () => {
      expect(re.getCount()).toBe(0);
      re.addRule('r1', 'a', 'b');
      expect(re.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.getName('re-1')).toBe('r1');
    });

    it('should get pattern', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.getPattern('re-1')).toBe('a');
    });

    it('should get replacement', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.getReplacement('re-1')).toBe('b');
    });

    it('should get applied', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.getApplied('re-1')).toBe(0);
    });

    it('should get hits', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.getHits('re-1')).toBe(0);
    });

    it('should get history', () => {
      const id = re.addRule('r1', 'a', 'b');
      re.apply(id, 'abc');
      expect(re.getHistory(id)).toEqual(['abc']);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = re.addRule('r1', 'a', 'b');
      expect(re.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = re.addRule('r1', 'a', 'b');
      expect(re.setName(id, 'r2')).toBe(true);
    });

    it('should set pattern', () => {
      const id = re.addRule('r1', 'a', 'b');
      expect(re.setPattern(id, 'c')).toBe(true);
    });

    it('should set replacement', () => {
      const id = re.addRule('r1', 'a', 'b');
      expect(re.setReplacement(id, 'd')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(re.setActive('unknown', false)).toBe(false);
      expect(re.setName('unknown', 'r')).toBe(false);
      expect(re.setPattern('unknown', 'p')).toBe(false);
      expect(re.setReplacement('unknown', 'r')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = re.addRule('r1', 'a', 'b');
      re.apply(id, 'abc');
      re.setActive(id, false);
      re.resetAll();
      expect(re.getApplied(id)).toBe(0);
      expect(re.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.getByName('r1')).toHaveLength(1);
    });

    it('should get active', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.getActiveRules()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = re.addRule('r1', 'a', 'b');
      re.setActive(id, false);
      expect(re.getInactiveRules()).toHaveLength(1);
    });

    it('should get all names', () => {
      re.addRule('r1', 'a', 'b');
      re.addRule('r2', 'c', 'd');
      expect(re.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.getNameCount()).toBe(1);
    });

    it('should get by min applied', () => {
      const id = re.addRule('r1', 'a', 'b');
      re.apply(id, 'abc');
      expect(re.getByMinApplied(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most applied', () => {
      const id = re.addRule('r1', 'a', 'b');
      re.apply(id, 'abc');
      expect(re.getMostApplied()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(re.getMostApplied()).toBeNull();
    });

    it('should get newest', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.getNewest()?.id).toBe('re-1');
    });

    it('should return null for empty newest', () => {
      expect(re.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.getOldest()?.id).toBe('re-1');
    });

    it('should return null for empty oldest', () => {
      expect(re.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      re.addRule('r1', 'a', 'b');
      expect(re.getCreatedAt('re-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = re.addRule('r1', 'a', 'b');
      re.apply(id, 'abc');
      expect(re.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many rules', () => {
      for (let i = 0; i < 50; i++) {
        re.addRule(`r${i}`, `p${i}`, `rep${i}`);
      }
      expect(re.getCount()).toBe(50);
    });
  });
});