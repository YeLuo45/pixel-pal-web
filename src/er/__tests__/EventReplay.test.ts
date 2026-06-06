/**
 * EventReplay Tests
 * thunderbolt-design Event Replay
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventReplay } from '../EventReplay';

describe('EventReplay', () => {
  let er: EventReplay;

  beforeEach(() => {
    er = new EventReplay();
  });

  afterEach(() => {
    er.clearAll();
  });

  // ============================================================
  // record / replay / checkpoint
  // ============================================================
  describe('record / replay / checkpoint', () => {
    it('should record', () => {
      expect(er.record('click', { x: 1 })).toBe('er-1');
    });

    it('should mark as active', () => {
      const id = er.record('click', {});
      expect(er.isActive(id)).toBe(true);
    });

    it('should not mark as replayed initially', () => {
      const id = er.record('click', {});
      expect(er.isReplayed(id)).toBe(false);
    });

    it('should replay', () => {
      const id = er.record('click', {});
      expect(er.replay(id)).toBe(true);
    });

    it('should mark as replayed', () => {
      const id = er.record('click', {});
      er.replay(id);
      expect(er.isReplayed(id)).toBe(true);
    });

    it('should increment replay count', () => {
      const id = er.record('click', {});
      er.replay(id);
      expect(er.getReplayCount(id)).toBe(1);
    });

    it('should not replay inactive', () => {
      const id = er.record('click', {});
      er.setActive(id, false);
      expect(er.replay(id)).toBe(false);
    });

    it('should return false for unknown replay', () => {
      expect(er.replay('unknown')).toBe(false);
    });

    it('should checkpoint', () => {
      expect(er.checkpoint()).toBe('cp-1');
    });

    it('should replay from checkpoint', () => {
      const id = er.record('click', {});
      const cpId = er.checkpoint();
      expect(er.replayFromCheckpoint(cpId)).toBe(1);
    });

    it('should return 0 for unknown checkpoint replay', () => {
      expect(er.replayFromCheckpoint('unknown')).toBe(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      er.record('click', {});
      const stats = er.getStats();
      expect(stats.events).toBe(1);
    });

    it('should count replayed', () => {
      const id = er.record('click', {});
      er.replay(id);
      expect(er.getStats().replayed).toBe(1);
    });

    it('should count checkpoints', () => {
      er.record('click', {});
      er.checkpoint();
      expect(er.getStats().checkpoints).toBe(1);
    });

    it('should count total replays', () => {
      const id = er.record('click', {});
      er.replay(id);
      er.replay(id);
      expect(er.getStats().totalReplays).toBe(2);
    });

    it('should count total hits', () => {
      const id = er.record('click', {});
      er.touch(id);
      expect(er.getStats().totalHits).toBe(1);
    });

    it('should count active', () => {
      er.record('click', {});
      expect(er.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = er.record('click', {});
      er.setActive(id, false);
      expect(er.getStats().inactive).toBe(1);
    });

    it('should count types', () => {
      er.record('click', {});
      er.record('hover', {});
      expect(er.getStats().types).toBe(2);
    });

    it('should compute replay rate', () => {
      const id = er.record('click', {});
      er.replay(id);
      expect(er.getStats().replayRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get event', () => {
      er.record('click', { x: 1 });
      expect(er.getEvent('er-1')?.type).toBe('click');
    });

    it('should get all events', () => {
      er.record('click', {});
      expect(er.getAllEvents()).toHaveLength(1);
    });

    it('should get ordered events', () => {
      er.record('click', {});
      er.record('hover', {});
      expect(er.getOrderedEvents()).toHaveLength(2);
    });

    it('should get checkpoint', () => {
      er.record('click', {});
      er.checkpoint();
      expect(er.getCheckpoint('cp-1')?.position).toBe(1);
    });

    it('should get all checkpoints', () => {
      er.checkpoint();
      expect(er.getAllCheckpoints()).toHaveLength(1);
    });

    it('should remove event', () => {
      er.record('click', {});
      expect(er.removeEvent('er-1')).toBe(true);
    });

    it('should remove checkpoint', () => {
      er.checkpoint();
      expect(er.removeCheckpoint('cp-1')).toBe(true);
    });

    it('should check existence', () => {
      er.record('click', {});
      expect(er.hasEvent('er-1')).toBe(true);
    });

    it('should count', () => {
      expect(er.getCount()).toBe(0);
      er.record('click', {});
      expect(er.getCount()).toBe(1);
    });

    it('should get checkpoint count', () => {
      expect(er.getCheckpointCount()).toBe(0);
      er.checkpoint();
      expect(er.getCheckpointCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get type', () => {
      er.record('click', {});
      expect(er.getType('er-1')).toBe('click');
    });

    it('should get data', () => {
      er.record('click', { x: 1 });
      expect(er.getData('er-1')).toEqual({ x: 1 });
    });

    it('should get replay count', () => {
      er.record('click', {});
      expect(er.getReplayCount('er-1')).toBe(0);
    });

    it('should get hits', () => {
      const id = er.record('click', {});
      er.touch(id);
      expect(er.getHits(id)).toBe(1);
    });

    it('should get history', () => {
      er.record('click', {});
      expect(er.getHistory('er-1').length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // state checks
  // ============================================================
  describe('state checks', () => {
    it('should check isReplayed', () => {
      er.record('click', {});
      expect(er.isReplayed('er-1')).toBe(false);
    });

    it('should check isActive', () => {
      er.record('click', {});
      expect(er.isActive('er-1')).toBe(true);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = er.record('click', {});
      expect(er.setActive(id, false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(er.setActive('unknown', false)).toBe(false);
    });
  });

  // ============================================================
  // touch
  // ============================================================
  describe('touch', () => {
    it('should touch', () => {
      const id = er.record('click', {});
      expect(er.touch(id)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(er.touch('unknown')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = er.record('click', {});
      er.replay(id);
      er.touch(id);
      er.checkpoint();
      er.setActive(id, false);
      er.resetAll();
      expect(er.getReplayCount(id)).toBe(0);
      expect(er.isActive(id)).toBe(true);
      expect(er.getCheckpointCount()).toBe(0);
    });
  });

  // ============================================================
  // by type / state
  // ============================================================
  describe('by type / state', () => {
    it('should get by type', () => {
      er.record('click', {});
      expect(er.getByType('click')).toHaveLength(1);
    });

    it('should get replayed', () => {
      const id = er.record('click', {});
      er.replay(id);
      expect(er.getReplayedEvents()).toHaveLength(1);
    });

    it('should get unreplayed', () => {
      er.record('click', {});
      expect(er.getUnreplayedEvents()).toHaveLength(1);
    });

    it('should get active', () => {
      er.record('click', {});
      expect(er.getActiveEvents()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = er.record('click', {});
      er.setActive(id, false);
      expect(er.getInactiveEvents()).toHaveLength(1);
    });

    it('should get all types', () => {
      er.record('click', {});
      er.record('hover', {});
      expect(er.getAllTypes()).toHaveLength(2);
    });

    it('should get type count', () => {
      er.record('click', {});
      expect(er.getTypeCount()).toBe(1);
    });

    it('should get by min replay count', () => {
      const id = er.record('click', {});
      er.replay(id);
      expect(er.getByMinReplayCount(1)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most replayed', () => {
      const id = er.record('click', {});
      er.replay(id);
      er.replay(id);
      expect(er.getMostReplayed()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(er.getMostReplayed()).toBeNull();
    });

    it('should get newest', () => {
      er.record('click', {});
      expect(er.getNewest()?.id).toBe('er-1');
    });

    it('should return null for empty newest', () => {
      expect(er.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      er.record('click', {});
      expect(er.getOldest()?.id).toBe('er-1');
    });

    it('should return null for empty oldest', () => {
      expect(er.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      er.record('click', {});
      expect(er.getCreatedAt('er-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = er.record('click', {});
      er.replay(id);
      expect(er.getUpdatedAt(id)).toBeGreaterThan(0);
    });

    it('should get event order position', () => {
      const id = er.record('click', {});
      expect(er.getEventOrderPosition(id)).toBe(0);
    });

    it('should return -1 for unknown order position', () => {
      expect(er.getEventOrderPosition('unknown')).toBe(-1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many events', () => {
      for (let i = 0; i < 50; i++) {
        er.record(`type${i}`, { i });
      }
      expect(er.getCount()).toBe(50);
    });
  });
});