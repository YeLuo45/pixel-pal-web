/**
 * SkillManager Tests
 * generic-agent-design Skill Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SkillManager } from '../SkillManager';

describe('SkillManager', () => {
  let sm: SkillManager;

  beforeEach(() => {
    sm = new SkillManager();
  });

  afterEach(() => {
    sm.clearAll();
  });

  // ============================================================
  // register / execute / learn
  // ============================================================
  describe('register / execute / learn', () => {
    it('should register', () => {
      expect(sm.register('s1', 5)).toBe('sm-1');
    });

    it('should mark as active', () => {
      const id = sm.register('s1', 5);
      expect(sm.isActive(id)).toBe(true);
    });

    it('should execute', () => {
      const id = sm.register('s1', 5);
      expect(sm.execute(id, true)).toBe(true);
    });

    it('should increment used on execute', () => {
      const id = sm.register('s1', 5);
      sm.execute(id, true);
      expect(sm.getUsed(id)).toBe(1);
    });

    it('should increment success on successful execute', () => {
      const id = sm.register('s1', 5);
      sm.execute(id, true);
      expect(sm.getSuccess(id)).toBe(1);
    });

    it('should not increment success on failed execute', () => {
      const id = sm.register('s1', 5);
      sm.execute(id, false);
      expect(sm.getSuccess(id)).toBe(0);
    });

    it('should not execute inactive', () => {
      const id = sm.register('s1', 5);
      sm.setActive(id, false);
      expect(sm.execute(id, true)).toBe(false);
    });

    it('should return false for unknown execute', () => {
      expect(sm.execute('unknown', true)).toBe(false);
    });

    it('should learn', () => {
      const id = sm.register('s1', 5);
      expect(sm.learn(id, 1)).toBe(true);
    });

    it('should increment level on learn', () => {
      const id = sm.register('s1', 5);
      sm.learn(id, 1);
      expect(sm.getLevel(id)).toBe(6);
    });

    it('should not learn with negative amount', () => {
      const id = sm.register('s1', 5);
      expect(sm.learn(id, -1)).toBe(false);
    });

    it('should not learn inactive', () => {
      const id = sm.register('s1', 5);
      sm.setActive(id, false);
      expect(sm.learn(id, 1)).toBe(false);
    });

    it('should return false for unknown learn', () => {
      expect(sm.learn('unknown', 1)).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      sm.register('s1', 5);
      const stats = sm.getStats();
      expect(stats.skills).toBe(1);
    });

    it('should count total uses', () => {
      const id = sm.register('s1', 5);
      sm.execute(id, true);
      expect(sm.getStats().totalUses).toBe(1);
    });

    it('should count total success', () => {
      const id = sm.register('s1', 5);
      sm.execute(id, true);
      expect(sm.getStats().totalSuccess).toBe(1);
    });

    it('should compute avg level', () => {
      sm.register('s1', 5);
      sm.register('s2', 10);
      expect(sm.getStats().avgLevel).toBe(7.5);
    });

    it('should compute success rate', () => {
      const id = sm.register('s1', 5);
      sm.execute(id, true);
      sm.execute(id, false);
      expect(sm.getStats().successRate).toBe(0.5);
    });

    it('should count total learned', () => {
      const id = sm.register('s1', 5);
      sm.learn(id, 2);
      expect(sm.getStats().totalLearned).toBe(2);
    });

    it('should count active', () => {
      sm.register('s1', 5);
      expect(sm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sm.register('s1', 5);
      sm.setActive(id, false);
      expect(sm.getStats().inactive).toBe(1);
    });

    it('should get max level', () => {
      sm.register('s1', 5);
      sm.register('s2', 10);
      expect(sm.getStats().maxLevel).toBe(10);
    });

    it('should get min level', () => {
      sm.register('s1', 5);
      sm.register('s2', 10);
      expect(sm.getStats().minLevel).toBe(5);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get skill', () => {
      sm.register('s1', 5);
      expect(sm.getSkill('sm-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      sm.register('s1', 5);
      expect(sm.getAllSkills()).toHaveLength(1);
    });

    it('should remove', () => {
      sm.register('s1', 5);
      expect(sm.removeSkill('sm-1')).toBe(true);
    });

    it('should check existence', () => {
      sm.register('s1', 5);
      expect(sm.hasSkill('sm-1')).toBe(true);
    });

    it('should count', () => {
      expect(sm.getCount()).toBe(0);
      sm.register('s1', 5);
      expect(sm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      sm.register('s1', 5);
      expect(sm.getName('sm-1')).toBe('s1');
    });

    it('should get level', () => {
      sm.register('s1', 5);
      expect(sm.getLevel('sm-1')).toBe(5);
    });

    it('should get used', () => {
      sm.register('s1', 5);
      expect(sm.getUsed('sm-1')).toBe(0);
    });

    it('should get success', () => {
      sm.register('s1', 5);
      expect(sm.getSuccess('sm-1')).toBe(0);
    });

    it('should get total learned', () => {
      sm.register('s1', 5);
      expect(sm.getTotalLearned('sm-1')).toBe(0);
    });

    it('should get history', () => {
      sm.register('s1', 5);
      expect(sm.getHistory('sm-1')).toEqual([5]);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = sm.register('s1', 5);
      expect(sm.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = sm.register('s1', 5);
      expect(sm.setName(id, 's2')).toBe(true);
    });

    it('should set level', () => {
      const id = sm.register('s1', 5);
      expect(sm.setLevel(id, 10)).toBe(true);
    });

    it('should not set negative level', () => {
      const id = sm.register('s1', 5);
      expect(sm.setLevel(id, -1)).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(sm.setActive('unknown', false)).toBe(false);
      expect(sm.setName('unknown', 's')).toBe(false);
      expect(sm.setLevel('unknown', 5)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = sm.register('s1', 5);
      sm.execute(id, true);
      sm.learn(id, 2);
      sm.setActive(id, false);
      sm.resetAll();
      expect(sm.getUsed(id)).toBe(0);
      expect(sm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / state
  // ============================================================
  describe('by name / state', () => {
    it('should get by name', () => {
      sm.register('s1', 5);
      expect(sm.getByName('s1')).toHaveLength(1);
    });

    it('should get active', () => {
      sm.register('s1', 5);
      expect(sm.getActiveSkills()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = sm.register('s1', 5);
      sm.setActive(id, false);
      expect(sm.getInactiveSkills()).toHaveLength(1);
    });

    it('should get all names', () => {
      sm.register('s1', 5);
      sm.register('s2', 5);
      expect(sm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      sm.register('s1', 5);
      expect(sm.getNameCount()).toBe(1);
    });

    it('should get by min level', () => {
      sm.register('s1', 5);
      sm.register('s2', 10);
      expect(sm.getByMinLevel(7)).toHaveLength(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get highest level', () => {
      const id = sm.register('s1', 10);
      expect(sm.getHighestLevel()?.id).toBe(id);
    });

    it('should return null for empty highest', () => {
      expect(sm.getHighestLevel()).toBeNull();
    });

    it('should get most used', () => {
      const id = sm.register('s1', 5);
      sm.execute(id, true);
      expect(sm.getMostUsed()?.id).toBe(id);
    });

    it('should return null for empty most', () => {
      expect(sm.getMostUsed()).toBeNull();
    });

    it('should get newest', () => {
      sm.register('s1', 5);
      expect(sm.getNewest()?.id).toBe('sm-1');
    });

    it('should return null for empty newest', () => {
      expect(sm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sm.register('s1', 5);
      expect(sm.getOldest()?.id).toBe('sm-1');
    });

    it('should return null for empty oldest', () => {
      expect(sm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      sm.register('s1', 5);
      expect(sm.getCreatedAt('sm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sm.register('s1', 5);
      sm.execute(id, true);
      expect(sm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many skills', () => {
      for (let i = 0; i < 50; i++) {
        sm.register(`s${i}`, i);
      }
      expect(sm.getCount()).toBe(50);
    });
  });
});