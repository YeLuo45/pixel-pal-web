/**
 * PathEngine Tests
 * thunderbolt-design Path Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PathEngine } from '../PathEngine';

describe('PathEngine', () => {
  let pe: PathEngine;

  beforeEach(() => {
    pe = new PathEngine();
  });

  afterEach(() => {
    pe.clearAll();
  });

  // ============================================================
  // register / visit / reset
  // ============================================================
  describe('register / visit / reset', () => {
    it('should register', () => {
      expect(pe.register('p1', ['s1', 's2'])).toBe('pe6-1');
    });

    it('should mark as active', () => {
      const id = pe.register('p1', ['s1', 's2']);
      expect(pe.isActive(id)).toBe(true);
    });

    it('should mark as in progress', () => {
      const id = pe.register('p1', ['s1', 's2']);
      expect(pe.isCompleted(id)).toBe(false);
    });

    it('should visit correct segment', () => {
      const id = pe.register('p1', ['s1', 's2']);
      expect(pe.visit(id, 's1')).toBe(true);
    });

    it('should not visit wrong segment', () => {
      const id = pe.register('p1', ['s1', 's2']);
      expect(pe.visit(id, 'wrong')).toBe(false);
    });

    it('should increment visited on visit', () => {
      const id = pe.register('p1', ['s1', 's2']);
      pe.visit(id, 's1');
      expect(pe.getVisited(id)).toBe(1);
    });

    it('should mark as completed at last segment', () => {
      const id = pe.register('p1', ['s1']);
      pe.visit(id, 's1');
      expect(pe.isCompleted(id)).toBe(true);
    });

    it('should not visit completed', () => {
      const id = pe.register('p1', ['s1']);
      pe.visit(id, 's1');
      expect(pe.visit(id, 's1')).toBe(false);
    });

    it('should not visit inactive', () => {
      const id = pe.register('p1', ['s1', 's2']);
      pe.setActive(id, false);
      expect(pe.visit(id, 's1')).toBe(false);
    });

    it('should return false for unknown visit', () => {
      expect(pe.visit('unknown', 's1')).toBe(false);
    });

    it('should reset', () => {
      const id = pe.register('p1', ['s1', 's2']);
      pe.visit(id, 's1');
      expect(pe.reset(id)).toBe(true);
    });

    it('should mark as not completed on reset', () => {
      const id = pe.register('p1', ['s1']);
      pe.visit(id, 's1');
      pe.reset(id);
      expect(pe.isCompleted(id)).toBe(false);
    });

    it('should return false for unknown reset', () => {
      expect(pe.reset('unknown')).toBe(false);
    });

    it('should get current segment', () => {
      const id = pe.register('p1', ['s1', 's2']);
      expect(pe.getCurrentSegment(id)).toBe('s1');
    });

    it('should return done for completed', () => {
      const id = pe.register('p1', ['s1']);
      pe.visit(id, 's1');
      expect(pe.getCurrentSegment(id)).toBe('done');
    });

    it('should return empty for unknown current segment', () => {
      expect(pe.getCurrentSegment('unknown')).toBe('');
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      pe.register('p1', ['s1', 's2']);
      const stats = pe.getStats();
      expect(stats.paths).toBe(1);
    });

    it('should count total visits', () => {
      const id = pe.register('p1', ['s1', 's2']);
      pe.visit(id, 's1');
      expect(pe.getStats().totalVisits).toBe(1);
    });

    it('should count total segments', () => {
      pe.register('p1', ['s1', 's2']);
      pe.register('p2', ['s1', 's2', 's3']);
      expect(pe.getStats().totalSegments).toBe(5);
    });

    it('should count completed', () => {
      const id = pe.register('p1', ['s1']);
      pe.visit(id, 's1');
      expect(pe.getStats().completed).toBe(1);
    });

    it('should count in progress', () => {
      pe.register('p1', ['s1', 's2']);
      expect(pe.getStats().inProgress).toBe(1);
    });

    it('should count active', () => {
      pe.register('p1', ['s1']);
      expect(pe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pe.register('p1', ['s1']);
      pe.setActive(id, false);
      expect(pe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pe.register('p1', ['s1', 's2']);
      pe.visit(id, 's1');
      expect(pe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      pe.register('p1', ['s1']);
      pe.register('p2', ['s1']);
      expect(pe.getStats().uniqueNames).toBe(2);
    });

    it('should compute avg segments', () => {
      pe.register('p1', ['s1', 's2', 's3']);
      expect(pe.getStats().avgSegments).toBe(3);
    });

    it('should get max segments', () => {
      pe.register('p1', ['s1', 's2']);
      pe.register('p2', ['s1', 's2', 's3', 's4']);
      expect(pe.getStats().maxSegments).toBe(4);
    });

    it('should get min segments', () => {
      pe.register('p1', ['s1', 's2']);
      pe.register('p2', ['s1']);
      expect(pe.getStats().minSegments).toBe(1);
    });

    it('should compute completion rate', () => {
      const id = pe.register('p1', ['s1']);
      pe.visit(id, 's1');
      expect(pe.getStats().completionRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get path', () => {
      pe.register('p1', ['s1']);
      expect(pe.getPath('pe6-1')?.name).toBe('p1');
    });

    it('should get all', () => {
      pe.register('p1', ['s1']);
      expect(pe.getAllPaths()).toHaveLength(1);
    });

    it('should remove', () => {
      pe.register('p1', ['s1']);
      expect(pe.removePath('pe6-1')).toBe(true);
    });

    it('should check existence', () => {
      pe.register('p1', ['s1']);
      expect(pe.hasPath('pe6-1')).toBe(true);
    });

    it('should count', () => {
      expect(pe.getCount()).toBe(0);
      pe.register('p1', ['s1']);
      expect(pe.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      pe.register('p1', ['s1']);
      expect(pe.getName('pe6-1')).toBe('p1');
    });

    it('should get segments', () => {
      pe.register('p1', ['s1', 's2']);
      expect(pe.getSegments('pe6-1')).toEqual(['s1', 's2']);
    });

    it('should get segment count', () => {
      pe.register('p1', ['s1', 's2']);
      expect(pe.getSegmentCount('pe6-1')).toBe(2);
    });

    it('should get current segment index', () => {
      pe.register('p1', ['s1', 's2']);
      expect(pe.getCurrentSegmentIndex('pe6-1')).toBe(0);
    });

    it('should get visited', () => {
      pe.register('p1', ['s1']);
      expect(pe.getVisited('pe6-1')).toBe(0);
    });

    it('should get history', () => {
      pe.register('p1', ['s1']);
      expect(pe.getHistory('pe6-1')).toEqual([0]);
    });

    it('should get hits', () => {
      const id = pe.register('p1', ['s1', 's2']);
      pe.visit(id, 's1');
      expect(pe.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      pe.register('p1', ['s1']);
      expect(pe.setActive('pe6-1', false)).toBe(true);
    });

    it('should set name', () => {
      pe.register('p1', ['s1']);
      expect(pe.setName('pe6-1', 'p2')).toBe(true);
    });

    it('should set segments', () => {
      pe.register('p1', ['s1']);
      expect(pe.setSegments('pe6-1', ['x', 'y'])).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pe.setActive('unknown', false)).toBe(false);
      expect(pe.setName('unknown', 'p')).toBe(false);
      expect(pe.setSegments('unknown', [])).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = pe.register('p1', ['s1', 's2']);
      pe.visit(id, 's1');
      pe.setActive(id, false);
      pe.resetAll();
      expect(pe.getCurrentSegmentIndex(id)).toBe(0);
      expect(pe.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      pe.register('p1', ['s1']);
      expect(pe.getByName('p1')).toHaveLength(1);
    });

    it('should get completed', () => {
      const id = pe.register('p1', ['s1']);
      pe.visit(id, 's1');
      expect(pe.getCompletedPaths()).toHaveLength(1);
    });

    it('should get in progress', () => {
      pe.register('p1', ['s1', 's2']);
      expect(pe.getInProgressPaths()).toHaveLength(1);
    });

    it('should get active', () => {
      pe.register('p1', ['s1']);
      expect(pe.getActivePaths()).toHaveLength(1);
    });

    it('should get inactive', () => {
      pe.register('p1', ['s1']);
      pe.setActive('pe6-1', false);
      expect(pe.getInactivePaths()).toHaveLength(1);
    });

    it('should get all names', () => {
      pe.register('p1', ['s1']);
      pe.register('p2', ['s1']);
      expect(pe.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      pe.register('p1', ['s1']);
      expect(pe.getNameCount()).toBe(1);
    });

    it('should get by min segments', () => {
      pe.register('p1', ['s1', 's2', 's3']);
      expect(pe.getByMinSegments(3)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most segments', () => {
      pe.register('p1', ['s1', 's2', 's3']);
      pe.register('p2', ['s1']);
      expect(pe.getMostSegments()?.id).toBe('pe6-1');
    });

    it('should return null for empty most', () => {
      expect(pe.getMostSegments()).toBeNull();
    });

    it('should get newest', () => {
      pe.register('p1', ['s1']);
      expect(pe.getNewest()?.id).toBe('pe6-1');
    });

    it('should return null for empty newest', () => {
      expect(pe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pe.register('p1', ['s1']);
      expect(pe.getOldest()?.id).toBe('pe6-1');
    });

    it('should return null for empty oldest', () => {
      expect(pe.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      pe.register('p1', ['s1']);
      expect(pe.getCreatedAt('pe6-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pe.register('p1', ['s1', 's2']);
      pe.visit(id, 's1');
      expect(pe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // total
  // ============================================================
  describe('total', () => {
    it('should get total visits', () => {
      const id = pe.register('p1', ['s1', 's2']);
      pe.visit(id, 's1');
      expect(pe.getTotalVisits()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many paths', () => {
      for (let i = 0; i < 50; i++) {
        pe.register(`p${i}`, ['s1', 's2']);
      }
      expect(pe.getCount()).toBe(50);
    });
  });
});