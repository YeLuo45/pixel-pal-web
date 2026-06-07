/**
 * PathEngine Tests
 * generic-agent-design Path Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PathEngine } from '../PathEngine';

describe('PathEngine', () => {
  let pte: PathEngine;

  beforeEach(() => {
    pte = new PathEngine();
  });

  afterEach(() => {
    pte.clearAll();
  });

  describe('add / step / complete / block / remove', () => {
    it('should add', () => {
      expect(pte.add('s1', 1)).toMatch(/^pte-/);
    });

    it('should default status to open', () => {
      pte.add('s1', 1);
      expect(pte.getStatus(pte.getAllSteps()[0].id)).toBe('open');
    });

    it('should mark as active', () => {
      pte.add('s1', 1);
      expect(pte.isActive(pte.getAllSteps()[0].id)).toBe(true);
    });

    it('should step', () => {
      const id = pte.add('s1', 1);
      expect(pte.step(id)).toBe(true);
    });

    it('should set in-progress on step', () => {
      const id = pte.add('s1', 1);
      pte.step(id);
      expect(pte.isInProgress(id)).toBe(true);
    });

    it('should not step inactive', () => {
      const id = pte.add('s1', 1);
      pte.setActive(id, false);
      expect(pte.step(id)).toBe(false);
    });

    it('should return false for unknown step', () => {
      expect(pte.step('unknown')).toBe(false);
    });

    it('should complete', () => {
      const id = pte.add('s1', 1);
      expect(pte.complete(id)).toBe(true);
    });

    it('should set completed', () => {
      const id = pte.add('s1', 1);
      pte.complete(id);
      expect(pte.isCompleted(id)).toBe(true);
    });

    it('should return false for unknown complete', () => {
      expect(pte.complete('unknown')).toBe(false);
    });

    it('should block', () => {
      const id = pte.add('s1', 1);
      expect(pte.block(id)).toBe(true);
    });

    it('should set blocked', () => {
      const id = pte.add('s1', 1);
      pte.block(id);
      expect(pte.isBlocked(id)).toBe(true);
    });

    it('should return false for unknown block', () => {
      expect(pte.block('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = pte.add('s1', 1);
      expect(pte.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      pte.add('s1', 1);
      expect(pte.getStats().steps).toBe(1);
    });

    it('should count total added', () => {
      pte.add('s1', 1);
      expect(pte.getStats().totalAdded).toBe(1);
    });

    it('should count total stepped', () => {
      const id = pte.add('s1', 1);
      pte.step(id);
      expect(pte.getStats().totalStepped).toBe(1);
    });

    it('should count total completed', () => {
      const id = pte.add('s1', 1);
      pte.complete(id);
      expect(pte.getStats().totalCompleted).toBe(1);
    });

    it('should count open', () => {
      pte.add('s1', 1);
      expect(pte.getStats().open).toBe(1);
    });

    it('should count in-progress', () => {
      const id = pte.add('s1', 1);
      pte.step(id);
      expect(pte.getStats().inProgress).toBe(1);
    });

    it('should count completed', () => {
      const id = pte.add('s1', 1);
      pte.complete(id);
      expect(pte.getStats().completed).toBe(1);
    });

    it('should count blocked', () => {
      const id = pte.add('s1', 1);
      pte.block(id);
      expect(pte.getStats().blocked).toBe(1);
    });

    it('should count active', () => {
      pte.add('s1', 1);
      expect(pte.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = pte.add('s1', 1);
      pte.setActive(id, false);
      expect(pte.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = pte.add('s1', 1);
      pte.step(id);
      expect(pte.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      pte.add('a', 1);
      pte.add('a', 1);
      expect(pte.getStats().uniqueNames).toBe(1);
    });

    it('should count avg index', () => {
      pte.add('s1', 2);
      pte.add('s2', 4);
      expect(pte.getStats().avgIndex).toBe(3);
    });

    it('should count max index', () => {
      pte.add('s1', 1);
      pte.add('s2', 5);
      expect(pte.getStats().maxIndex).toBe(5);
    });
  });

  describe('queries', () => {
    it('should get step', () => {
      const id = pte.add('s1', 1);
      expect(pte.getStep(id)?.name).toBe('s1');
    });

    it('should get all', () => {
      pte.add('s1', 1);
      expect(pte.getAllSteps()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = pte.add('s1', 1);
      expect(pte.hasStep(id)).toBe(true);
    });

    it('should count', () => {
      expect(pte.getCount()).toBe(0);
      pte.add('s1', 1);
      expect(pte.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = pte.add('s1', 1);
      expect(pte.getName(id)).toBe('s1');
    });

    it('should get index', () => {
      const id = pte.add('s1', 3);
      expect(pte.getIndex(id)).toBe(3);
    });

    it('should get hits', () => {
      const id = pte.add('s1', 1);
      pte.step(id);
      expect(pte.getHits(id)).toBe(1);
    });

    it('should check open', () => {
      pte.add('s1', 1);
      expect(pte.isOpen(pte.getAllSteps()[0].id)).toBe(true);
    });

    it('should check in-progress', () => {
      const id = pte.add('s1', 1);
      pte.step(id);
      expect(pte.isInProgress(id)).toBe(true);
    });

    it('should check completed', () => {
      const id = pte.add('s1', 1);
      pte.complete(id);
      expect(pte.isCompleted(id)).toBe(true);
    });

    it('should check blocked', () => {
      const id = pte.add('s1', 1);
      pte.block(id);
      expect(pte.isBlocked(id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = pte.add('s1', 1);
      expect(pte.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = pte.add('s1', 1);
      expect(pte.setName(id, 's2')).toBe(true);
    });

    it('should set index', () => {
      const id = pte.add('s1', 1);
      expect(pte.setIndex(id, 5)).toBe(true);
    });

    it('should set status', () => {
      const id = pte.add('s1', 1);
      expect(pte.setStatus(id, 'in-progress')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(pte.setActive('unknown', false)).toBe(false);
      expect(pte.setName('unknown', 's')).toBe(false);
      expect(pte.setIndex('unknown', 1)).toBe(false);
      expect(pte.setStatus('unknown', 'open')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = pte.add('s1', 1);
      pte.step(id);
      pte.setActive(id, false);
      pte.resetAll();
      expect(pte.isOpen(id)).toBe(true);
      expect(pte.isActive(id)).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      pte.add('s1', 1);
      expect(pte.getByStatus('open')).toHaveLength(1);
    });

    it('should get active', () => {
      pte.add('s1', 1);
      expect(pte.getActiveSteps()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = pte.add('s1', 1);
      pte.setActive(id, false);
      expect(pte.getInactiveSteps()).toHaveLength(1);
    });

    it('should get ordered', () => {
      pte.add('b', 2);
      pte.add('a', 1);
      const ordered = pte.getOrderedSteps();
      expect(ordered[0].name).toBe('a');
    });

    it('should get all names', () => {
      pte.add('a', 1);
      pte.add('b', 2);
      expect(pte.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      pte.add('s1', 1);
      expect(pte.getNewest()?.name).toBe('s1');
    });

    it('should return null for empty newest', () => {
      expect(pte.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      pte.add('s1', 1);
      expect(pte.getOldest()?.name).toBe('s1');
    });

    it('should return null for empty oldest', () => {
      expect(pte.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = pte.add('s1', 1);
      expect(pte.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = pte.add('s1', 1);
      pte.step(id);
      expect(pte.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      pte.add('s1', 1);
      expect(pte.getTotalAdded()).toBe(1);
    });

    it('should get total stepped', () => {
      const id = pte.add('s1', 1);
      pte.step(id);
      expect(pte.getTotalStepped()).toBe(1);
    });

    it('should get total completed', () => {
      const id = pte.add('s1', 1);
      pte.complete(id);
      expect(pte.getTotalCompleted()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many steps', () => {
      for (let i = 0; i < 50; i++) {
        pte.add(`s${i}`, i);
      }
      expect(pte.getCount()).toBe(50);
    });
  });
});