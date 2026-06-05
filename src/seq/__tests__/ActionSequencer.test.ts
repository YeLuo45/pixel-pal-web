/**
 * ActionSequencer Tests
 * thunderbolt-design Action Sequencer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ActionSequencer } from '../ActionSequencer';

describe('ActionSequencer', () => {
  let as: ActionSequencer;

  beforeEach(() => {
    as = new ActionSequencer();
  });

  afterEach(() => {
    as.clearAll();
  });

  // ============================================================
  // define / execute
  // ============================================================
  describe('define / execute', () => {
    it('should define', () => {
      expect(as.define('a1', 1)).toBe('act-1');
    });

    it('should execute', () => {
      const id = as.define('a1', 1);
      expect(as.execute(id, () => 'result')).toBe('result');
    });

    it('should return null for unknown execute', () => {
      expect(as.execute('unknown', () => 'r')).toBeNull();
    });

    it('should catch errors', () => {
      const id = as.define('a1', 1);
      as.execute(id, () => { throw new Error('oops'); });
      expect(as.hasError(id)).toBe(true);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset', () => {
      const id = as.define('a1', 1);
      as.execute(id, () => 'r');
      as.reset();
      expect(as.isExecuted(id)).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      as.define('a1', 1);
      const stats = as.getStats();
      expect(stats.total).toBe(1);
    });

    it('should count executed', () => {
      const id = as.define('a1', 1);
      as.execute(id, () => 'r');
      expect(as.getStats().executed).toBe(1);
    });

    it('should count pending', () => {
      as.define('a1', 1);
      expect(as.getStats().pending).toBe(1);
    });

    it('should count errors', () => {
      const id = as.define('a1', 1);
      as.execute(id, () => { throw new Error('e'); });
      expect(as.getStats().errors).toBe(1);
    });

    it('should compute avg duration', () => {
      const id = as.define('a1', 1);
      as.execute(id, () => 'r');
      expect(as.getStats().avgDuration).toBeGreaterThanOrEqual(0);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get action', () => {
      as.define('a1', 1);
      expect(as.getAction('act-1')?.name).toBe('a1');
    });

    it('should get all', () => {
      as.define('a1', 1);
      expect(as.getAllActions()).toHaveLength(1);
    });

    it('should remove', () => {
      as.define('a1', 1);
      expect(as.removeAction('act-1')).toBe(true);
    });

    it('should check existence', () => {
      as.define('a1', 1);
      expect(as.hasAction('act-1')).toBe(true);
    });

    it('should count', () => {
      expect(as.getCount()).toBe(0);
      as.define('a1', 1);
      expect(as.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      as.define('a1', 1);
      expect(as.getName('act-1')).toBe('a1');
    });

    it('should get order', () => {
      as.define('a1', 5);
      expect(as.getOrder('act-1')).toBe(5);
    });

    it('should get result', () => {
      const id = as.define('a1', 1);
      as.execute(id, () => 'val');
      expect(as.getResult(id)).toBe('val');
    });

    it('should get error', () => {
      const id = as.define('a1', 1);
      as.execute(id, () => { throw new Error('e'); });
      expect(as.getError(id)).toBe('e');
    });

    it('should get duration', () => {
      const id = as.define('a1', 1);
      as.execute(id, () => 'r');
      expect(as.getDuration(id)).toBeGreaterThanOrEqual(0);
    });

    it('should check isExecuted', () => {
      const id = as.define('a1', 1);
      as.execute(id, () => 'r');
      expect(as.isExecuted(id)).toBe(true);
    });

    it('should check isPending', () => {
      as.define('a1', 1);
      expect(as.isPending('act-1')).toBe(true);
    });

    it('should check hasError', () => {
      as.define('a1', 1);
      expect(as.hasError('act-1')).toBe(false);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set order', () => {
      const id = as.define('a1', 1);
      expect(as.setOrder(id, 10)).toBe(true);
    });

    it('should set name', () => {
      const id = as.define('a1', 1);
      expect(as.setName(id, 'a2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(as.setOrder('unknown', 10)).toBe(false);
      expect(as.setName('unknown', 'a')).toBe(false);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      as.define('a1', 1);
      expect(as.getCreatedAt('act-1')).toBeGreaterThan(0);
    });

    it('should get executed at', () => {
      const id = as.define('a1', 1);
      as.execute(id, () => 'r');
      expect(as.getExecutedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      as.define('a1', 1);
      expect(as.getByName('a1')).toHaveLength(1);
    });

    it('should get executed', () => {
      const id = as.define('a1', 1);
      as.execute(id, () => 'r');
      expect(as.getExecutedActions()).toHaveLength(1);
    });

    it('should get pending', () => {
      as.define('a1', 1);
      expect(as.getPendingActions()).toHaveLength(1);
    });

    it('should get errored', () => {
      const id = as.define('a1', 1);
      as.execute(id, () => { throw new Error('e'); });
      expect(as.getErroredActions()).toHaveLength(1);
    });

    it('should get sorted by order', () => {
      as.define('a1', 2);
      as.define('a2', 1);
      const sorted = as.getSortedByOrder();
      expect(sorted[0].name).toBe('a2');
    });
  });

  // ============================================================
  // next
  // ============================================================
  describe('next', () => {
    it('should get next pending', () => {
      as.define('a1', 1);
      expect(as.getNextPending()?.name).toBe('a1');
    });

    it('should return null for empty', () => {
      expect(as.getNextPending()).toBeNull();
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get longest', () => {
      const id = as.define('a1', 1);
      as.execute(id, () => 'r');
      expect(as.getLongest()?.id).toBe(id);
    });

    it('should return null for empty longest', () => {
      expect(as.getLongest()).toBeNull();
    });

    it('should get shortest', () => {
      const id = as.define('a1', 1);
      as.execute(id, () => 'r');
      expect(as.getShortest()?.id).toBe(id);
    });

    it('should return null for empty shortest', () => {
      expect(as.getShortest()).toBeNull();
    });
  });

  // ============================================================
  // execute all
  // ============================================================
  describe('execute all', () => {
    it('should execute all', () => {
      as.define('a1', 1);
      as.define('a2', 2);
      expect(as.executeAll(() => 'r')).toBe(2);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many actions', () => {
      for (let i = 0; i < 50; i++) {
        as.define(`a${i}`, i);
      }
      expect(as.getCount()).toBe(50);
    });
  });
});