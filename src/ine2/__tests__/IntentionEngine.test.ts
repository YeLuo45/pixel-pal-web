/**
 * IntentionEngine Tests
 * generic-agent-design Intention Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IntentionEngine } from '../IntentionEngine';

describe('IntentionEngine', () => {
  let ine: IntentionEngine;

  beforeEach(() => {
    ine = new IntentionEngine();
  });

  afterEach(() => {
    ine.clearAll();
  });

  describe('declare / commit / complete / abandon / remove', () => {
    it('should declare', () => {
      expect(ine.declare('g', 'm')).toBe('ine-1');
    });

    it('should default status to declared', () => {
      ine.declare('g', 'm');
      expect(ine.getStatus('ine-1')).toBe('declared');
    });

    it('should mark as active', () => {
      ine.declare('g', 'm');
      expect(ine.isActive('ine-1')).toBe(true);
    });

    it('should commit', () => {
      ine.declare('g', 'm');
      expect(ine.commit('ine-1')).toBe(true);
    });

    it('should not double commit', () => {
      ine.declare('g', 'm');
      ine.commit('ine-1');
      expect(ine.commit('ine-1')).toBe(false);
    });

    it('should return false for unknown commit', () => {
      expect(ine.commit('unknown')).toBe(false);
    });

    it('should complete after commit', () => {
      ine.declare('g', 'm');
      ine.commit('ine-1');
      expect(ine.complete('ine-1')).toBe(true);
    });

    it('should not complete without commit', () => {
      ine.declare('g', 'm');
      expect(ine.complete('ine-1')).toBe(false);
    });

    it('should return false for unknown complete', () => {
      expect(ine.complete('unknown')).toBe(false);
    });

    it('should abandon', () => {
      ine.declare('g', 'm');
      expect(ine.abandon('ine-1')).toBe(true);
    });

    it('should return false for unknown abandon', () => {
      expect(ine.abandon('unknown')).toBe(false);
    });

    it('should remove', () => {
      ine.declare('g', 'm');
      expect(ine.remove('ine-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      ine.declare('g', 'm');
      expect(ine.getStats().intentions).toBe(1);
    });

    it('should count total declared', () => {
      ine.declare('g', 'm');
      expect(ine.getStats().totalDeclared).toBe(1);
    });

    it('should count total committed', () => {
      ine.declare('g', 'm');
      ine.commit('ine-1');
      expect(ine.getStats().totalCommitted).toBe(1);
    });

    it('should count total completed', () => {
      ine.declare('g', 'm');
      ine.commit('ine-1');
      ine.complete('ine-1');
      expect(ine.getStats().totalCompleted).toBe(1);
    });

    it('should count total abandoned', () => {
      ine.declare('g', 'm');
      ine.abandon('ine-1');
      expect(ine.getStats().totalAbandoned).toBe(1);
    });

    it('should count declared', () => {
      ine.declare('g', 'm');
      expect(ine.getStats().declared).toBe(1);
    });

    it('should count committed', () => {
      ine.declare('g', 'm');
      ine.commit('ine-1');
      expect(ine.getStats().committed).toBe(1);
    });

    it('should count completed', () => {
      ine.declare('g', 'm');
      ine.commit('ine-1');
      ine.complete('ine-1');
      expect(ine.getStats().completed).toBe(1);
    });

    it('should count abandoned', () => {
      ine.declare('g', 'm');
      ine.abandon('ine-1');
      expect(ine.getStats().abandoned).toBe(1);
    });

    it('should count active', () => {
      ine.declare('g', 'm');
      expect(ine.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      ine.declare('g', 'm');
      ine.setActive('ine-1', false);
      expect(ine.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      ine.declare('g', 'm');
      ine.commit('ine-1');
      expect(ine.getStats().totalHits).toBe(1);
    });

    it('should count unique goals', () => {
      ine.declare('a', 'm1');
      ine.declare('a', 'm2');
      expect(ine.getStats().uniqueGoals).toBe(1);
    });

    it('should count unique motivations', () => {
      ine.declare('g1', 'a');
      ine.declare('g2', 'a');
      expect(ine.getStats().uniqueMotivations).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get intention', () => {
      ine.declare('g', 'm');
      expect(ine.getIntention('ine-1')?.goal).toBe('g');
    });

    it('should get all', () => {
      ine.declare('g', 'm');
      expect(ine.getAllIntentions()).toHaveLength(1);
    });

    it('should check existence', () => {
      ine.declare('g', 'm');
      expect(ine.hasIntention('ine-1')).toBe(true);
    });

    it('should count', () => {
      expect(ine.getCount()).toBe(0);
      ine.declare('g', 'm');
      expect(ine.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get goal', () => {
      ine.declare('g', 'm');
      expect(ine.getGoal('ine-1')).toBe('g');
    });

    it('should get motivation', () => {
      ine.declare('g', 'm');
      expect(ine.getMotivation('ine-1')).toBe('m');
    });

    it('should get hits', () => {
      ine.declare('g', 'm');
      ine.commit('ine-1');
      expect(ine.getHits('ine-1')).toBe(1);
    });

    it('should check declared', () => {
      ine.declare('g', 'm');
      expect(ine.isDeclared('ine-1')).toBe(true);
    });

    it('should check committed', () => {
      ine.declare('g', 'm');
      ine.commit('ine-1');
      expect(ine.isCommitted('ine-1')).toBe(true);
    });

    it('should check completed', () => {
      ine.declare('g', 'm');
      ine.commit('ine-1');
      ine.complete('ine-1');
      expect(ine.isCompleted('ine-1')).toBe(true);
    });

    it('should check abandoned', () => {
      ine.declare('g', 'm');
      ine.abandon('ine-1');
      expect(ine.isAbandoned('ine-1')).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      ine.declare('g', 'm');
      expect(ine.setActive('ine-1', false)).toBe(true);
    });

    it('should set goal', () => {
      ine.declare('g', 'm');
      expect(ine.setGoal('ine-1', 'g2')).toBe(true);
    });

    it('should set motivation', () => {
      ine.declare('g', 'm');
      expect(ine.setMotivation('ine-1', 'm2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ine.setActive('unknown', false)).toBe(false);
      expect(ine.setGoal('unknown', 'g')).toBe(false);
      expect(ine.setMotivation('unknown', 'm')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      ine.declare('g', 'm');
      ine.commit('ine-1');
      ine.setActive('ine-1', false);
      ine.resetAll();
      expect(ine.getStatus('ine-1')).toBe('declared');
      expect(ine.isActive('ine-1')).toBe(true);
    });
  });

  describe('by status / state', () => {
    it('should get by status', () => {
      ine.declare('g', 'm');
      expect(ine.getByStatus('declared')).toHaveLength(1);
    });

    it('should get active', () => {
      ine.declare('g', 'm');
      expect(ine.getActiveIntentions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ine.declare('g', 'm');
      ine.setActive('ine-1', false);
      expect(ine.getInactiveIntentions()).toHaveLength(1);
    });

    it('should get all goals', () => {
      ine.declare('a', 'm');
      ine.declare('b', 'm');
      expect(ine.getAllGoals()).toHaveLength(2);
    });

    it('should get all motivations', () => {
      ine.declare('g', 'a');
      ine.declare('g', 'b');
      expect(ine.getAllMotivations()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      ine.declare('g', 'm');
      expect(ine.getNewest()?.id).toBe('ine-1');
    });

    it('should return null for empty newest', () => {
      expect(ine.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ine.declare('g', 'm');
      expect(ine.getOldest()?.id).toBe('ine-1');
    });

    it('should return null for empty oldest', () => {
      expect(ine.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      ine.declare('g', 'm');
      expect(ine.getCreatedAt('ine-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      ine.declare('g', 'm');
      ine.commit('ine-1');
      expect(ine.getUpdatedAt('ine-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total declared', () => {
      ine.declare('g', 'm');
      expect(ine.getTotalDeclared()).toBe(1);
    });

    it('should get total committed', () => {
      ine.declare('g', 'm');
      ine.commit('ine-1');
      expect(ine.getTotalCommitted()).toBe(1);
    });

    it('should get total completed', () => {
      ine.declare('g', 'm');
      ine.commit('ine-1');
      ine.complete('ine-1');
      expect(ine.getTotalCompleted()).toBe(1);
    });

    it('should get total abandoned', () => {
      ine.declare('g', 'm');
      ine.abandon('ine-1');
      expect(ine.getTotalAbandoned()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many intentions', () => {
      for (let i = 0; i < 50; i++) {
        ine.declare(`g${i}`, `m${i}`);
      }
      expect(ine.getCount()).toBe(50);
    });
  });
});