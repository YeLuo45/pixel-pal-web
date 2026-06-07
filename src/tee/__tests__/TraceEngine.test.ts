/**
 * TraceEngine Tests
 * generic-agent-design Trace Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TraceEngine } from '../TraceEngine';

describe('TraceEngine', () => {
  let tee: TraceEngine;

  beforeEach(() => {
    tee = new TraceEngine();
  });

  afterEach(() => {
    tee.clearAll();
  });

  describe('add / trace / complete / fail / remove', () => {
    it('should add', () => {
      expect(tee.add('t1', '')).toMatch(/^tee-/);
    });

    it('should default status to pending', () => {
      tee.add('t1', '');
      expect(tee.getStatus(tee.getAllEntries()[0].id)).toBe('pending');
    });

    it('should mark as active', () => {
      tee.add('t1', '');
      expect(tee.isActive(tee.getAllEntries()[0].id)).toBe(true);
    });

    it('should trace', () => {
      const id = tee.add('t1', '');
      expect(tee.trace(id, 100)).toBe(true);
    });

    it('should set running on trace', () => {
      const id = tee.add('t1', '');
      tee.trace(id, 100);
      expect(tee.isRunning(id)).toBe(true);
    });

    it('should set duration on trace', () => {
      const id = tee.add('t1', '');
      tee.trace(id, 100);
      expect(tee.getDuration(id)).toBe(100);
    });

    it('should not trace inactive', () => {
      const id = tee.add('t1', '');
      tee.setActive(id, false);
      expect(tee.trace(id, 100)).toBe(false);
    });

    it('should return false for unknown trace', () => {
      expect(tee.trace('unknown', 100)).toBe(false);
    });

    it('should complete', () => {
      const id = tee.add('t1', '');
      expect(tee.complete(id)).toBe(true);
    });

    it('should set completed', () => {
      const id = tee.add('t1', '');
      tee.complete(id);
      expect(tee.isCompleted(id)).toBe(true);
    });

    it('should return false for unknown complete', () => {
      expect(tee.complete('unknown')).toBe(false);
    });

    it('should fail', () => {
      const id = tee.add('t1', '');
      expect(tee.fail(id)).toBe(true);
    });

    it('should set failed', () => {
      const id = tee.add('t1', '');
      tee.fail(id);
      expect(tee.isFailed(id)).toBe(true);
    });

    it('should return false for unknown fail', () => {
      expect(tee.fail('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = tee.add('t1', '');
      expect(tee.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      tee.add('t1', '');
      expect(tee.getStats().entries).toBe(1);
    });

    it('should count total added', () => {
      tee.add('t1', '');
      expect(tee.getStats().totalAdded).toBe(1);
    });

    it('should count total traced', () => {
      const id = tee.add('t1', '');
      tee.trace(id, 100);
      expect(tee.getStats().totalTraced).toBe(1);
    });

    it('should count pending', () => {
      tee.add('t1', '');
      expect(tee.getStats().pending).toBe(1);
    });

    it('should count running', () => {
      const id = tee.add('t1', '');
      tee.trace(id, 100);
      expect(tee.getStats().running).toBe(1);
    });

    it('should count completed', () => {
      const id = tee.add('t1', '');
      tee.complete(id);
      expect(tee.getStats().completed).toBe(1);
    });

    it('should count failed', () => {
      const id = tee.add('t1', '');
      tee.fail(id);
      expect(tee.getStats().failed).toBe(1);
    });

    it('should count active', () => {
      tee.add('t1', '');
      expect(tee.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = tee.add('t1', '');
      tee.setActive(id, false);
      expect(tee.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = tee.add('t1', '');
      tee.trace(id, 100);
      expect(tee.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      tee.add('a', '');
      tee.add('a', '');
      expect(tee.getStats().uniqueNames).toBe(1);
    });

    it('should count total duration', () => {
      const id = tee.add('t1', '');
      tee.trace(id, 100);
      expect(tee.getStats().totalDuration).toBe(100);
    });

    it('should count unique parents', () => {
      tee.add('t1', 'p1');
      tee.add('t2', 'p2');
      expect(tee.getStats().uniqueParents).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get entry', () => {
      const id = tee.add('t1', '');
      expect(tee.getEntry(id)?.name).toBe('t1');
    });

    it('should get all', () => {
      tee.add('t1', '');
      expect(tee.getAllEntries()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = tee.add('t1', '');
      expect(tee.hasEntry(id)).toBe(true);
    });

    it('should count', () => {
      expect(tee.getCount()).toBe(0);
      tee.add('t1', '');
      expect(tee.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = tee.add('t1', '');
      expect(tee.getName(id)).toBe('t1');
    });

    it('should get parent', () => {
      const id = tee.add('t1', 'p1');
      expect(tee.getParent(id)).toBe('p1');
    });

    it('should get level', () => {
      const id = tee.add('t1', '');
      tee.setLevel(id, 2);
      expect(tee.getLevel(id)).toBe(2);
    });

    it('should get duration', () => {
      const id = tee.add('t1', '');
      tee.trace(id, 100);
      expect(tee.getDuration(id)).toBe(100);
    });

    it('should get hits', () => {
      const id = tee.add('t1', '');
      tee.trace(id, 100);
      expect(tee.getHits(id)).toBe(1);
    });

    it('should check pending', () => {
      tee.add('t1', '');
      expect(tee.isPending(tee.getAllEntries()[0].id)).toBe(true);
    });

    it('should check running', () => {
      const id = tee.add('t1', '');
      tee.trace(id, 100);
      expect(tee.isRunning(id)).toBe(true);
    });

    it('should check completed', () => {
      const id = tee.add('t1', '');
      tee.complete(id);
      expect(tee.isCompleted(id)).toBe(true);
    });

    it('should check failed', () => {
      const id = tee.add('t1', '');
      tee.fail(id);
      expect(tee.isFailed(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = tee.add('t1', '');
      expect(tee.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = tee.add('t1', '');
      expect(tee.setName(id, 't2')).toBe(true);
    });

    it('should set parent', () => {
      const id = tee.add('t1', '');
      expect(tee.setParent(id, 'p1')).toBe(true);
    });

    it('should set level', () => {
      const id = tee.add('t1', '');
      expect(tee.setLevel(id, 3)).toBe(true);
    });

    it('should set status', () => {
      const id = tee.add('t1', '');
      expect(tee.setStatus(id, 'running')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tee.setActive('unknown', false)).toBe(false);
      expect(tee.setName('unknown', 't')).toBe(false);
      expect(tee.setParent('unknown', 'p')).toBe(false);
      expect(tee.setLevel('unknown', 1)).toBe(false);
      expect(tee.setStatus('unknown', 'pending')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = tee.add('t1', '');
      tee.trace(id, 100);
      tee.setActive(id, false);
      tee.resetAll();
      expect(tee.getDuration(id)).toBe(0);
      expect(tee.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      tee.add('t1', '');
      expect(tee.getByStatus('pending')).toHaveLength(1);
    });

    it('should get active', () => {
      tee.add('t1', '');
      expect(tee.getActiveEntries()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = tee.add('t1', '');
      tee.setActive(id, false);
      expect(tee.getInactiveEntries()).toHaveLength(1);
    });

    it('should get by parent', () => {
      tee.add('t1', 'p1');
      expect(tee.getByParent('p1')).toHaveLength(1);
    });

    it('should get roots', () => {
      tee.add('t1', '');
      expect(tee.getRoots()).toHaveLength(1);
    });

    it('should get all names', () => {
      tee.add('a', '');
      tee.add('b', '');
      expect(tee.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      tee.add('t1', '');
      expect(tee.getNewest()?.name).toBe('t1');
    });

    it('should return null for empty newest', () => {
      expect(tee.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      tee.add('t1', '');
      expect(tee.getOldest()?.name).toBe('t1');
    });

    it('should return null for empty oldest', () => {
      expect(tee.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = tee.add('t1', '');
      expect(tee.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = tee.add('t1', '');
      tee.trace(id, 100);
      expect(tee.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      tee.add('t1', '');
      expect(tee.getTotalAdded()).toBe(1);
    });

    it('should get total traced', () => {
      const id = tee.add('t1', '');
      tee.trace(id, 100);
      expect(tee.getTotalTraced()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        tee.add(`t${i}`, '');
      }
      expect(tee.getCount()).toBe(50);
    });
  });
});