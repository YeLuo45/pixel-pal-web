/**
 * ActionEngine Tests
 * generic-agent-design Action Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ActionEngine } from '../ActionEngine';

describe('ActionEngine', () => {
  let ace: ActionEngine;

  beforeEach(() => {
    ace = new ActionEngine();
  });

  afterEach(() => {
    ace.clearAll();
  });

  describe('define / queue / execute / complete / fail / remove', () => {
    it('should define', () => {
      expect(ace.define('a1')).toMatch(/^ace-/);
    });

    it('should default state to idle', () => {
      ace.define('a1');
      expect(ace.getState(ace.getAllActions()[0].id)).toBe('idle');
    });

    it('should mark as active', () => {
      ace.define('a1');
      expect(ace.isActive(ace.getAllActions()[0].id)).toBe(true);
    });

    it('should queue', () => {
      const id = ace.define('a1');
      expect(ace.queue(id)).toBe(true);
    });

    it('should set queued', () => {
      const id = ace.define('a1');
      ace.queue(id);
      expect(ace.isQueued(id)).toBe(true);
    });

    it('should not queue inactive', () => {
      const id = ace.define('a1');
      ace.setActive(id, false);
      expect(ace.queue(id)).toBe(false);
    });

    it('should return false for unknown queue', () => {
      expect(ace.queue('unknown')).toBe(false);
    });

    it('should execute', () => {
      const id = ace.define('a1');
      expect(ace.execute(id)).toBe(true);
    });

    it('should set running', () => {
      const id = ace.define('a1');
      ace.execute(id);
      expect(ace.isRunning(id)).toBe(true);
    });

    it('should not execute inactive', () => {
      const id = ace.define('a1');
      ace.setActive(id, false);
      expect(ace.execute(id)).toBe(false);
    });

    it('should return false for unknown execute', () => {
      expect(ace.execute('unknown')).toBe(false);
    });

    it('should complete', () => {
      const id = ace.define('a1');
      expect(ace.complete(id, 100)).toBe(true);
    });

    it('should set done', () => {
      const id = ace.define('a1');
      ace.complete(id, 100);
      expect(ace.isDone(id)).toBe(true);
    });

    it('should set duration on complete', () => {
      const id = ace.define('a1');
      ace.complete(id, 100);
      expect(ace.getDuration(id)).toBe(100);
    });

    it('should return false for unknown complete', () => {
      expect(ace.complete('unknown', 100)).toBe(false);
    });

    it('should fail', () => {
      const id = ace.define('a1');
      expect(ace.fail(id)).toBe(true);
    });

    it('should set failed', () => {
      const id = ace.define('a1');
      ace.fail(id);
      expect(ace.isFailed(id)).toBe(true);
    });

    it('should return false for unknown fail', () => {
      expect(ace.fail('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = ace.define('a1');
      expect(ace.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      ace.define('a1');
      expect(ace.getStats().actions).toBe(1);
    });

    it('should count total defined', () => {
      ace.define('a1');
      expect(ace.getStats().totalDefined).toBe(1);
    });

    it('should count total executed', () => {
      const id = ace.define('a1');
      ace.execute(id);
      expect(ace.getStats().totalExecuted).toBe(1);
    });

    it('should count total done', () => {
      const id = ace.define('a1');
      ace.complete(id, 100);
      expect(ace.getStats().totalDone).toBe(1);
    });

    it('should count total failed', () => {
      const id = ace.define('a1');
      ace.fail(id);
      expect(ace.getStats().totalFailed).toBe(1);
    });

    it('should count idle', () => {
      ace.define('a1');
      expect(ace.getStats().idle).toBe(1);
    });

    it('should count queued', () => {
      const id = ace.define('a1');
      ace.queue(id);
      expect(ace.getStats().queued).toBe(1);
    });

    it('should count running', () => {
      const id = ace.define('a1');
      ace.execute(id);
      expect(ace.getStats().running).toBe(1);
    });

    it('should count done', () => {
      const id = ace.define('a1');
      ace.complete(id, 100);
      expect(ace.getStats().done).toBe(1);
    });

    it('should count failed', () => {
      const id = ace.define('a1');
      ace.fail(id);
      expect(ace.getStats().failed).toBe(1);
    });

    it('should count active', () => {
      ace.define('a1');
      expect(ace.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ace.define('a1');
      ace.setActive(id, false);
      expect(ace.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ace.define('a1');
      ace.queue(id);
      expect(ace.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      ace.define('a');
      ace.define('a');
      expect(ace.getStats().uniqueNames).toBe(1);
    });

    it('should count total duration', () => {
      const id = ace.define('a1');
      ace.complete(id, 100);
      expect(ace.getStats().totalDuration).toBe(100);
    });
  });

  describe('queries', () => {
    it('should get action', () => {
      const id = ace.define('a1');
      expect(ace.getAction(id)?.name).toBe('a1');
    });

    it('should get all', () => {
      ace.define('a1');
      expect(ace.getAllActions()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = ace.define('a1');
      expect(ace.hasAction(id)).toBe(true);
    });

    it('should count', () => {
      expect(ace.getCount()).toBe(0);
      ace.define('a1');
      expect(ace.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = ace.define('a1');
      expect(ace.getName(id)).toBe('a1');
    });

    it('should get duration', () => {
      const id = ace.define('a1');
      ace.complete(id, 100);
      expect(ace.getDuration(id)).toBe(100);
    });

    it('should get hits', () => {
      const id = ace.define('a1');
      ace.queue(id);
      expect(ace.getHits(id)).toBe(1);
    });

    it('should check idle', () => {
      ace.define('a1');
      expect(ace.isIdle(ace.getAllActions()[0].id)).toBe(true);
    });

    it('should check queued', () => {
      const id = ace.define('a1');
      ace.queue(id);
      expect(ace.isQueued(id)).toBe(true);
    });

    it('should check running', () => {
      const id = ace.define('a1');
      ace.execute(id);
      expect(ace.isRunning(id)).toBe(true);
    });

    it('should check done', () => {
      const id = ace.define('a1');
      ace.complete(id, 100);
      expect(ace.isDone(id)).toBe(true);
    });

    it('should check failed', () => {
      const id = ace.define('a1');
      ace.fail(id);
      expect(ace.isFailed(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = ace.define('a1');
      expect(ace.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = ace.define('a1');
      expect(ace.setName(id, 'a2')).toBe(true);
    });

    it('should set state', () => {
      const id = ace.define('a1');
      expect(ace.setState(id, 'running')).toBe(true);
    });

    it('should set duration', () => {
      const id = ace.define('a1');
      expect(ace.setDuration(id, 200)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ace.setActive('unknown', false)).toBe(false);
      expect(ace.setName('unknown', 'a')).toBe(false);
      expect(ace.setState('unknown', 'idle')).toBe(false);
      expect(ace.setDuration('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = ace.define('a1');
      ace.complete(id, 100);
      ace.setActive(id, false);
      ace.resetAll();
      expect(ace.isIdle(id)).toBe(true);
      expect(ace.isActive(id)).toBe(true);
    });
  });

  describe('by state / state', () => {
    it('should get by state', () => {
      ace.define('a1');
      expect(ace.getByState('idle')).toHaveLength(1);
    });

    it('should get active', () => {
      ace.define('a1');
      expect(ace.getActiveActions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = ace.define('a1');
      ace.setActive(id, false);
      expect(ace.getInactiveActions()).toHaveLength(1);
    });

    it('should get all names', () => {
      ace.define('a');
      ace.define('b');
      expect(ace.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      ace.define('a1');
      expect(ace.getNewest()?.name).toBe('a1');
    });

    it('should return null for empty newest', () => {
      expect(ace.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ace.define('a1');
      expect(ace.getOldest()?.name).toBe('a1');
    });

    it('should return null for empty oldest', () => {
      expect(ace.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = ace.define('a1');
      expect(ace.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ace.define('a1');
      ace.queue(id);
      expect(ace.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total defined', () => {
      ace.define('a1');
      expect(ace.getTotalDefined()).toBe(1);
    });

    it('should get total executed', () => {
      const id = ace.define('a1');
      ace.execute(id);
      expect(ace.getTotalExecuted()).toBe(1);
    });

    it('should get total done', () => {
      const id = ace.define('a1');
      ace.complete(id, 100);
      expect(ace.getTotalDone()).toBe(1);
    });

    it('should get total failed', () => {
      const id = ace.define('a1');
      ace.fail(id);
      expect(ace.getTotalFailed()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many actions', () => {
      for (let i = 0; i < 50; i++) {
        ace.define(`a${i}`);
      }
      expect(ace.getCount()).toBe(50);
    });
  });
});