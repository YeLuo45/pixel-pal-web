/**
 * ActionCoordinator Tests
 * thunderbolt-design Action Coordinator
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ActionCoordinator } from '../ActionCoordinator';

describe('ActionCoordinator', () => {
  let ac: ActionCoordinator;

  beforeEach(() => {
    ac = new ActionCoordinator();
  });

  afterEach(() => {
    ac.clearAll();
  });

  // ============================================================
  // register / coordinate
  // ============================================================
  describe('register / coordinate', () => {
    it('should register', () => {
      expect(ac.register('a1')).toBe('ac-1');
    });

    it('should mark as pending', () => {
      const id = ac.register('a1');
      expect(ac.getStatus(id)).toBe('pending');
    });

    it('should coordinate', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      expect(ac.coordinate(id1, id2)).toBe(true);
    });

    it('should not coordinate same twice', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      expect(ac.coordinate(id1, id2)).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(ac.coordinate('unknown', 'other')).toBe(false);
    });

    it('should be bidirectional', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      expect(ac.isCoordinatedWith(id2, id1)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ac.register('a1');
      const stats = ac.getStats();
      expect(stats.actions).toBe(1);
    });

    it('should count pending', () => {
      ac.register('a1');
      expect(ac.getStats().pending).toBe(1);
    });

    it('should count running', () => {
      const id = ac.register('a1');
      ac.start(id);
      expect(ac.getStats().running).toBe(1);
    });

    it('should count done', () => {
      const id = ac.register('a1');
      ac.complete(id);
      expect(ac.getStats().done).toBe(1);
    });

    it('should count failed', () => {
      const id = ac.register('a1');
      ac.fail(id);
      expect(ac.getStats().failed).toBe(1);
    });

    it('should count coordinated', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      expect(ac.getStats().coordinated).toBe(2);
    });

    it('should count total relations', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      expect(ac.getStats().totalRelations).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get action', () => {
      ac.register('a1');
      expect(ac.getAction('ac-1')?.name).toBe('a1');
    });

    it('should get all', () => {
      ac.register('a1');
      expect(ac.getAllActions()).toHaveLength(1);
    });

    it('should remove', () => {
      ac.register('a1');
      expect(ac.removeAction('ac-1')).toBe(true);
    });

    it('should check existence', () => {
      ac.register('a1');
      expect(ac.hasAction('ac-1')).toBe(true);
    });

    it('should count', () => {
      expect(ac.getCount()).toBe(0);
      ac.register('a1');
      expect(ac.getCount()).toBe(1);
    });

    it('should remove relation when removing action', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      ac.removeAction(id1);
      expect(ac.getCoordinatedWith(id2)).toHaveLength(0);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      ac.register('a1');
      expect(ac.getName('ac-1')).toBe('a1');
    });

    it('should get status', () => {
      ac.register('a1');
      expect(ac.getStatus('ac-1')).toBe('pending');
    });

    it('should get coordinated with', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      expect(ac.getCoordinatedWith(id1)).toContain(id2);
    });

    it('should get coordinated count', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      expect(ac.getCoordinatedCount(id1)).toBe(1);
    });

    it('should get hits', () => {
      const id = ac.register('a1');
      ac.touch(id);
      expect(ac.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isPending', () => {
      ac.register('a1');
      expect(ac.isPending('ac-1')).toBe(true);
    });

    it('should check isRunning', () => {
      const id = ac.register('a1');
      ac.start(id);
      expect(ac.isRunning('ac-1')).toBe(true);
    });

    it('should check isDone', () => {
      const id = ac.register('a1');
      ac.complete(id);
      expect(ac.isDone('ac-1')).toBe(true);
    });

    it('should check isFailed', () => {
      const id = ac.register('a1');
      ac.fail(id);
      expect(ac.isFailed('ac-1')).toBe(true);
    });

    it('should check isCoordinated', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      expect(ac.isCoordinated(id1)).toBe(true);
    });

    it('should check isCoordinatedWith', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      expect(ac.isCoordinatedWith(id1, id2)).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set status', () => {
      const id = ac.register('a1');
      expect(ac.setStatus(id, 'running')).toBe(true);
    });

    it('should set name', () => {
      const id = ac.register('a1');
      expect(ac.setName(id, 'a2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ac.setStatus('unknown', 'running')).toBe(false);
      expect(ac.setName('unknown', 'a')).toBe(false);
    });
  });

  // ============================================================
  // start / complete / fail
  // ============================================================
  describe('start / complete / fail', () => {
    it('should start', () => {
      const id = ac.register('a1');
      expect(ac.start(id)).toBe(true);
    });

    it('should complete', () => {
      const id = ac.register('a1');
      expect(ac.complete(id)).toBe(true);
    });

    it('should fail', () => {
      const id = ac.register('a1');
      expect(ac.fail(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ac.start('unknown')).toBe(false);
      expect(ac.complete('unknown')).toBe(false);
      expect(ac.fail('unknown')).toBe(false);
    });
  });

  // ============================================================
  // touch
  // ============================================================
  describe('touch', () => {
    it('should touch', () => {
      const id = ac.register('a1');
      expect(ac.touch(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ac.touch('unknown')).toBe(false);
    });
  });

  // ============================================================
  // uncoordinate
  // ============================================================
  describe('uncoordinate', () => {
    it('should uncoordinate', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      expect(ac.uncoordinate(id1, id2)).toBe(true);
    });

    it('should not uncoordinate non-existing', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      expect(ac.uncoordinate(id1, id2)).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(ac.uncoordinate('unknown', 'other')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset hits', () => {
      const id = ac.register('a1');
      ac.touch(id);
      ac.resetHits();
      expect(ac.getHits(id)).toBe(0);
    });

    it('should reset all', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      ac.complete(id1);
      ac.resetAll();
      expect(ac.getCoordinatedCount(id1)).toBe(0);
      expect(ac.isPending(id1)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      ac.register('a1');
      expect(ac.getByName('a1')).toHaveLength(1);
    });

    it('should get by status', () => {
      ac.register('a1');
      expect(ac.getByStatus('pending')).toHaveLength(1);
    });

    it('should get pending', () => {
      ac.register('a1');
      expect(ac.getPendingActions()).toHaveLength(1);
    });

    it('should get running', () => {
      const id = ac.register('a1');
      ac.start(id);
      expect(ac.getRunningActions()).toHaveLength(1);
    });

    it('should get done', () => {
      const id = ac.register('a1');
      ac.complete(id);
      expect(ac.getDoneActions()).toHaveLength(1);
    });

    it('should get failed', () => {
      const id = ac.register('a1');
      ac.fail(id);
      expect(ac.getFailedActions()).toHaveLength(1);
    });

    it('should get coordinated', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      expect(ac.getCoordinatedActions()).toHaveLength(2);
    });

    it('should get uncoordinated', () => {
      ac.register('a1');
      expect(ac.getUncoordinatedActions()).toHaveLength(1);
    });

    it('should get all names', () => {
      ac.register('a1');
      ac.register('a2');
      expect(ac.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      ac.register('a1');
      expect(ac.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // by min
  // ============================================================
  describe('by min', () => {
    it('should get by min coordination', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      expect(ac.getByMinCoordination(1)).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most coordinated', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      expect(ac.getMostCoordinated()?.id).toBe(id1);
    });

    it('should return null for empty most', () => {
      expect(ac.getMostCoordinated()).toBeNull();
    });

    it('should get newest', () => {
      ac.register('a1');
      expect(ac.getNewest()?.id).toBe('ac-1');
    });

    it('should return null for empty newest', () => {
      expect(ac.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ac.register('a1');
      expect(ac.getOldest()?.id).toBe('ac-1');
    });

    it('should return null for empty oldest', () => {
      expect(ac.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ac.register('a1');
      expect(ac.getCreatedAt('ac-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ac.register('a1');
      ac.touch(id);
      expect(ac.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total relations
  // ============================================================
  describe('total relations', () => {
    it('should get total relations', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      expect(ac.getTotalRelations()).toBe(1);
    });

    it('should reset total relations', () => {
      const id1 = ac.register('a1');
      const id2 = ac.register('a2');
      ac.coordinate(id1, id2);
      ac.resetTotalRelations();
      expect(ac.getTotalRelations()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many actions', () => {
      for (let i = 0; i < 50; i++) {
        ac.register(`a${i}`);
      }
      expect(ac.getCount()).toBe(50);
    });
  });
});