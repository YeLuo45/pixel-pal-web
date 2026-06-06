/**
 * SkillEngine Tests
 * generic-agent-design Skill Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SkillEngine } from '../SkillEngine';

describe('SkillEngine', () => {
  let ske: SkillEngine;

  beforeEach(() => {
    ske = new SkillEngine();
  });

  afterEach(() => {
    ske.clearAll();
  });

  // ============================================================
  // add / upgrade / use / remove
  // ============================================================
  describe('add / upgrade / use / remove', () => {
    it('should add', () => {
      expect(ske.add('typescript', 'intermediate', 50)).toBe('ske-1');
    });

    it('should default proficiency to 50', () => {
      const id = ske.add('typescript', 'intermediate');
      expect(ske.getProficiency(id)).toBe(50);
    });

    it('should clamp proficiency', () => {
      const id = ske.add('ts', 'intermediate', 200);
      expect(ske.getProficiency(id)).toBe(100);
    });

    it('should mark as active', () => {
      const id = ske.add('ts', 'intermediate');
      expect(ske.isActive(id)).toBe(true);
    });

    it('should upgrade', () => {
      const id = ske.add('ts', 'intermediate', 50);
      expect(ske.upgrade(id, 10)).toBe(true);
    });

    it('should increment proficiency on upgrade', () => {
      const id = ske.add('ts', 'intermediate', 50);
      ske.upgrade(id, 10);
      expect(ske.getProficiency(id)).toBe(60);
    });

    it('should clamp to 100 on upgrade overflow', () => {
      const id = ske.add('ts', 'intermediate', 95);
      ske.upgrade(id, 10);
      expect(ske.getProficiency(id)).toBe(100);
    });

    it('should change level to expert at 80', () => {
      const id = ske.add('ts', 'intermediate', 75);
      ske.upgrade(id, 10);
      expect(ske.getLevel(id)).toBe('expert');
    });

    it('should not upgrade inactive', () => {
      const id = ske.add('ts', 'intermediate', 50);
      ske.setActive(id, false);
      expect(ske.upgrade(id, 10)).toBe(false);
    });

    it('should return false for unknown upgrade', () => {
      expect(ske.upgrade('unknown', 10)).toBe(false);
    });

    it('should use', () => {
      const id = ske.add('ts', 'intermediate', 50);
      expect(ske.use(id)).toBe(true);
    });

    it('should increment uses on use', () => {
      const id = ske.add('ts', 'intermediate', 50);
      ske.use(id);
      expect(ske.getUses(id)).toBe(1);
    });

    it('should not use inactive', () => {
      const id = ske.add('ts', 'intermediate', 50);
      ske.setActive(id, false);
      expect(ske.use(id)).toBe(false);
    });

    it('should return false for unknown use', () => {
      expect(ske.use('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = ske.add('ts', 'intermediate');
      expect(ske.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      ske.add('ts', 'intermediate');
      const stats = ske.getStats();
      expect(stats.skills).toBe(1);
    });

    it('should count total added', () => {
      ske.add('ts', 'intermediate');
      expect(ske.getStats().totalAdded).toBe(1);
    });

    it('should count total upgrades', () => {
      const id = ske.add('ts', 'intermediate', 50);
      ske.upgrade(id, 5);
      expect(ske.getStats().totalUpgrades).toBe(1);
    });

    it('should count total used', () => {
      const id = ske.add('ts', 'intermediate', 50);
      ske.use(id);
      expect(ske.getStats().totalUsed).toBe(1);
    });

    it('should count active', () => {
      ske.add('ts', 'intermediate');
      expect(ske.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ske.add('ts', 'intermediate');
      ske.setActive(id, false);
      expect(ske.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ske.add('ts', 'intermediate', 50);
      ske.use(id);
      expect(ske.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      ske.add('a', 'intermediate');
      ske.add('a', 'intermediate');
      expect(ske.getStats().uniqueNames).toBe(1);
    });

    it('should count novice', () => {
      ske.add('ts', 'novice', 10);
      expect(ske.getStats().novice).toBe(1);
    });

    it('should count beginner', () => {
      ske.add('ts', 'beginner', 30);
      expect(ske.getStats().beginner).toBe(1);
    });

    it('should count intermediate', () => {
      ske.add('ts', 'intermediate', 50);
      expect(ske.getStats().intermediate).toBe(1);
    });

    it('should count advanced', () => {
      ske.add('ts', 'advanced', 70);
      expect(ske.getStats().advanced).toBe(1);
    });

    it('should count expert', () => {
      ske.add('ts', 'expert', 90);
      expect(ske.getStats().expert).toBe(1);
    });

    it('should compute avg proficiency', () => {
      ske.add('a', 'intermediate', 50);
      ske.add('b', 'intermediate', 70);
      expect(ske.getStats().avgProficiency).toBe(60);
    });

    it('should get max proficiency', () => {
      ske.add('a', 'intermediate', 50);
      ske.add('b', 'intermediate', 70);
      expect(ske.getStats().maxProficiency).toBe(70);
    });

    it('should get min proficiency', () => {
      ske.add('a', 'intermediate', 50);
      ske.add('b', 'intermediate', 70);
      expect(ske.getStats().minProficiency).toBe(50);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get skill', () => {
      ske.add('ts', 'intermediate');
      expect(ske.getSkill('ske-1')?.name).toBe('ts');
    });

    it('should get all', () => {
      ske.add('ts', 'intermediate');
      expect(ske.getAllSkills()).toHaveLength(1);
    });

    it('should check existence', () => {
      ske.add('ts', 'intermediate');
      expect(ske.hasSkill('ske-1')).toBe(true);
    });

    it('should count', () => {
      expect(ske.getCount()).toBe(0);
      ske.add('ts', 'intermediate');
      expect(ske.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      ske.add('ts', 'intermediate');
      expect(ske.getName('ske-1')).toBe('ts');
    });

    it('should get level', () => {
      ske.add('ts', 'expert');
      expect(ske.getLevel('ske-1')).toBe('expert');
    });

    it('should get hits', () => {
      const id = ske.add('ts', 'intermediate', 50);
      ske.use(id);
      expect(ske.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      ske.add('ts', 'intermediate');
      expect(ske.setActive('ske-1', false)).toBe(true);
    });

    it('should set name', () => {
      ske.add('ts', 'intermediate');
      expect(ske.setName('ske-1', 'js')).toBe(true);
    });

    it('should set level', () => {
      ske.add('ts', 'intermediate');
      expect(ske.setLevel('ske-1', 'expert')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ske.setActive('unknown', false)).toBe(false);
      expect(ske.setName('unknown', 'n')).toBe(false);
      expect(ske.setLevel('unknown', 'expert')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = ske.add('ts', 'intermediate', 50);
      ske.use(id);
      ske.setActive(id, false);
      ske.resetAll();
      expect(ske.getUses(id)).toBe(0);
      expect(ske.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by level / name / state
  // ============================================================
  describe('by level / name / state', () => {
    it('should get by level', () => {
      ske.add('ts', 'expert');
      expect(ske.getByLevel('expert')).toHaveLength(1);
    });

    it('should get by name', () => {
      ske.add('ts', 'intermediate');
      expect(ske.getByName('ts')).toHaveLength(1);
    });

    it('should get active', () => {
      ske.add('ts', 'intermediate');
      expect(ske.getActiveSkills()).toHaveLength(1);
    });

    it('should get inactive', () => {
      ske.add('ts', 'intermediate');
      ske.setActive('ske-1', false);
      expect(ske.getInactiveSkills()).toHaveLength(1);
    });

    it('should get all names', () => {
      ske.add('a', 'intermediate');
      ske.add('b', 'intermediate');
      expect(ske.getAllNames()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      ske.add('ts', 'intermediate');
      expect(ske.getNewest()?.id).toBe('ske-1');
    });

    it('should return null for empty newest', () => {
      expect(ske.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ske.add('ts', 'intermediate');
      expect(ske.getOldest()?.id).toBe('ske-1');
    });

    it('should return null for empty oldest', () => {
      expect(ske.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      ske.add('ts', 'intermediate');
      expect(ske.getCreatedAt('ske-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ske.add('ts', 'intermediate', 50);
      ske.use(id);
      expect(ske.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total added', () => {
      ske.add('ts', 'intermediate');
      expect(ske.getTotalAdded()).toBe(1);
    });

    it('should get total upgrades', () => {
      const id = ske.add('ts', 'intermediate', 50);
      ske.upgrade(id, 5);
      expect(ske.getTotalUpgrades()).toBe(1);
    });

    it('should get total used', () => {
      const id = ske.add('ts', 'intermediate', 50);
      ske.use(id);
      expect(ske.getTotalUsed()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many skills', () => {
      for (let i = 0; i < 50; i++) {
        ske.add(`s${i}`, 'intermediate', 50);
      }
      expect(ske.getCount()).toBe(50);
    });
  });
});