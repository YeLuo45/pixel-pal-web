/**
 * ReplayManager Tests
 * thunderbolt-design Replay Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReplayManager } from '../ReplayManager';

describe('ReplayManager', () => {
  let rm: ReplayManager;

  beforeEach(() => {
    rm = new ReplayManager();
  });

  afterEach(() => {
    rm.clearAll();
  });

  // ============================================================
  // save / play / pause / step / seek
  // ============================================================
  describe('save / play / pause / step / seek', () => {
    it('should save', () => {
      expect(rm.save('r1', 10)).toBe('rm-1');
    });

    it('should mark as active', () => {
      const id = rm.save('r1', 10);
      expect(rm.isActive(id)).toBe(true);
    });

    it('should mark as not playing', () => {
      const id = rm.save('r1', 10);
      expect(rm.isPlaying(id)).toBe(false);
    });

    it('should mark as paused initially', () => {
      const id = rm.save('r1', 10);
      expect(rm.isPaused(id)).toBe(true);
    });

    it('should play', () => {
      const id = rm.save('r1', 10);
      expect(rm.play(id)).toBe(true);
    });

    it('should mark as playing', () => {
      const id = rm.save('r1', 10);
      rm.play(id);
      expect(rm.isPlaying(id)).toBe(true);
    });

    it('should not play inactive', () => {
      const id = rm.save('r1', 10);
      rm.setActive(id, false);
      expect(rm.play(id)).toBe(false);
    });

    it('should not play twice', () => {
      const id = rm.save('r1', 10);
      rm.play(id);
      expect(rm.play(id)).toBe(false);
    });

    it('should return false for unknown play', () => {
      expect(rm.play('unknown')).toBe(false);
    });

    it('should pause', () => {
      const id = rm.save('r1', 10);
      rm.play(id);
      expect(rm.pause(id)).toBe(true);
    });

    it('should mark as not playing on pause', () => {
      const id = rm.save('r1', 10);
      rm.play(id);
      rm.pause(id);
      expect(rm.isPlaying(id)).toBe(false);
    });

    it('should not pause not playing', () => {
      const id = rm.save('r1', 10);
      expect(rm.pause(id)).toBe(false);
    });

    it('should return false for unknown pause', () => {
      expect(rm.pause('unknown')).toBe(false);
    });

    it('should step', () => {
      const id = rm.save('r1', 10);
      rm.play(id);
      expect(rm.step(id)).toBe(true);
    });

    it('should increment position on step', () => {
      const id = rm.save('r1', 10);
      rm.play(id);
      rm.step(id);
      expect(rm.getPosition(id)).toBe(1);
    });

    it('should not step not playing', () => {
      const id = rm.save('r1', 10);
      expect(rm.step(id)).toBe(false);
    });

    it('should return false for unknown step', () => {
      expect(rm.step('unknown')).toBe(false);
    });

    it('should seek', () => {
      const id = rm.save('r1', 10);
      expect(rm.seek(id, 5)).toBe(true);
    });

    it('should set position on seek', () => {
      const id = rm.save('r1', 10);
      rm.seek(id, 5);
      expect(rm.getPosition(id)).toBe(5);
    });

    it('should not seek invalid', () => {
      const id = rm.save('r1', 10);
      expect(rm.seek(id, -1)).toBe(false);
      expect(rm.seek(id, 20)).toBe(false);
    });

    it('should return false for unknown seek', () => {
      expect(rm.seek('unknown', 5)).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      rm.save('r1', 10);
      const stats = rm.getStats();
      expect(stats.replays).toBe(1);
    });

    it('should count playing', () => {
      const id = rm.save('r1', 10);
      rm.play(id);
      expect(rm.getStats().playing).toBe(1);
    });

    it('should count paused', () => {
      rm.save('r1', 10);
      expect(rm.getStats().paused).toBe(1);
    });

    it('should count total steps', () => {
      rm.save('r1', 10);
      rm.save('r2', 20);
      expect(rm.getStats().totalSteps).toBe(30);
    });

    it('should count total plays', () => {
      const id = rm.save('r1', 10);
      rm.play(id);
      expect(rm.getStats().totalPlays).toBe(1);
    });

    it('should count active', () => {
      rm.save('r1', 10);
      expect(rm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = rm.save('r1', 10);
      rm.setActive(id, false);
      expect(rm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = rm.save('r1', 10);
      rm.play(id);
      expect(rm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      rm.save('r1', 10);
      rm.save('r2', 20);
      expect(rm.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg steps', () => {
      rm.save('r1', 10);
      rm.save('r2', 20);
      expect(rm.getStats().avgSteps).toBe(15);
    });

    it('should get max steps', () => {
      rm.save('r1', 10);
      rm.save('r2', 30);
      expect(rm.getStats().maxSteps).toBe(30);
    });

    it('should get min steps', () => {
      rm.save('r1', 10);
      rm.save('r2', 30);
      expect(rm.getStats().minSteps).toBe(10);
    });

    it('should compute avg position', () => {
      const id = rm.save('r1', 10);
      rm.seek(id, 5);
      expect(rm.getStats().avgPosition).toBe(5);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get replay', () => {
      rm.save('r1', 10);
      expect(rm.getReplay('rm-1')?.name).toBe('r1');
    });

    it('should get all', () => {
      rm.save('r1', 10);
      expect(rm.getAllReplays()).toHaveLength(1);
    });

    it('should remove', () => {
      rm.save('r1', 10);
      expect(rm.removeReplay('rm-1')).toBe(true);
    });

    it('should check existence', () => {
      rm.save('r1', 10);
      expect(rm.hasReplay('rm-1')).toBe(true);
    });

    it('should count', () => {
      expect(rm.getCount()).toBe(0);
      rm.save('r1', 10);
      expect(rm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      rm.save('r1', 10);
      expect(rm.getName('rm-1')).toBe('r1');
    });

    it('should get steps', () => {
      rm.save('r1', 10);
      expect(rm.getSteps('rm-1')).toBe(10);
    });

    it('should get position', () => {
      rm.save('r1', 10);
      expect(rm.getPosition('rm-1')).toBe(0);
    });

    it('should get history', () => {
      rm.save('r1', 10);
      expect(rm.getHistory('rm-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = rm.save('r1', 10);
      rm.play(id);
      expect(rm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      rm.save('r1', 10);
      expect(rm.setActive('rm-1', false)).toBe(true);
    });

    it('should set name', () => {
      rm.save('r1', 10);
      expect(rm.setName('rm-1', 'r2')).toBe(true);
    });

    it('should set steps', () => {
      rm.save('r1', 10);
      expect(rm.setSteps('rm-1', 20)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(rm.setActive('unknown', false)).toBe(false);
      expect(rm.setName('unknown', 'r')).toBe(false);
      expect(rm.setSteps('unknown', 10)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = rm.save('r1', 10);
      rm.play(id);
      rm.step(id);
      rm.setActive(id, false);
      rm.resetAll();
      expect(rm.getPosition(id)).toBe(0);
      expect(rm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      rm.save('r1', 10);
      expect(rm.getByName('r1')).toHaveLength(1);
    });

    it('should get playing', () => {
      const id = rm.save('r1', 10);
      rm.play(id);
      expect(rm.getPlayingReplays()).toHaveLength(1);
    });

    it('should get paused', () => {
      rm.save('r1', 10);
      expect(rm.getPausedReplays()).toHaveLength(1);
    });

    it('should get active', () => {
      rm.save('r1', 10);
      expect(rm.getActiveReplays()).toHaveLength(1);
    });

    it('should get inactive', () => {
      rm.save('r1', 10);
      rm.setActive('rm-1', false);
      expect(rm.getInactiveReplays()).toHaveLength(1);
    });

    it('should get all names', () => {
      rm.save('r1', 10);
      rm.save('r2', 20);
      expect(rm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      rm.save('r1', 10);
      expect(rm.getNameCount()).toBe(1);
    });

    it('should get by min steps', () => {
      rm.save('r1', 10);
      rm.save('r2', 20);
      expect(rm.getByMinSteps(15)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most steps', () => {
      rm.save('r1', 10);
      rm.save('r2', 30);
      expect(rm.getMostSteps()?.id).toBe('rm-2');
    });

    it('should return null for empty most', () => {
      expect(rm.getMostSteps()).toBeNull();
    });

    it('should get newest', () => {
      rm.save('r1', 10);
      expect(rm.getNewest()?.id).toBe('rm-1');
    });

    it('should return null for empty newest', () => {
      expect(rm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      rm.save('r1', 10);
      expect(rm.getOldest()?.id).toBe('rm-1');
    });

    it('should return null for empty oldest', () => {
      expect(rm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      rm.save('r1', 10);
      expect(rm.getCreatedAt('rm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = rm.save('r1', 10);
      rm.play(id);
      expect(rm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total plays', () => {
      const id = rm.save('r1', 10);
      rm.play(id);
      expect(rm.getTotalPlays()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many replays', () => {
      for (let i = 0; i < 50; i++) {
        rm.save(`r${i}`, 10);
      }
      expect(rm.getCount()).toBe(50);
    });
  });
});