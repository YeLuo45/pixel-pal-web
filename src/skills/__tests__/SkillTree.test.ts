/**
 * SkillTree Tests
 * generic-agent-design Skill Tree
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SkillTree } from '../SkillTree';

describe('SkillTree', () => {
  let tree: SkillTree;

  beforeEach(() => {
    tree = new SkillTree();
  });

  afterEach(() => {
    tree.clearAll();
  });

  // ============================================================
  // addSkill
  // ============================================================
  describe('addSkill', () => {
    it('should add skill', () => {
      tree.addSkill({ id: 's1', name: 'Fire', level: 0, maxLevel: 3, dependencies: [] });
      expect(tree.getSkillCount()).toBe(1);
    });
  });

  // ============================================================
  // unlock
  // ============================================================
  describe('unlock', () => {
    it('should unlock skill without deps', () => {
      tree.addSkill({ id: 's1', name: 'Fire', level: 0, maxLevel: 3, dependencies: [] });
      expect(tree.unlock('s1')).toBe(true);
    });

    it('should fail unlock with unmet deps', () => {
      tree.addSkill({ id: 's2', name: 'Meteor', level: 0, maxLevel: 3, dependencies: ['s1'] });
      expect(tree.unlock('s2')).toBe(false);
    });

    it('should unlock with met deps', () => {
      tree.addSkill({ id: 's1', name: 'Fire', level: 0, maxLevel: 3, dependencies: [] });
      tree.addSkill({ id: 's2', name: 'Meteor', level: 0, maxLevel: 3, dependencies: ['s1'] });
      tree.unlock('s1');
      expect(tree.unlock('s2')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tree.unlock('unknown')).toBe(false);
    });

    it('should set level to 1 on unlock', () => {
      tree.addSkill({ id: 's1', name: 'Fire', level: 0, maxLevel: 3, dependencies: [] });
      tree.unlock('s1');
      expect(tree.getCurrentLevel('s1')).toBe(1);
    });
  });

  // ============================================================
  // upgrade
  // ============================================================
  describe('upgrade', () => {
    it('should upgrade unlocked skill', () => {
      tree.addSkill({ id: 's1', name: 'Fire', level: 0, maxLevel: 3, dependencies: [] });
      tree.unlock('s1');
      expect(tree.upgrade('s1')).toBe(true);
      expect(tree.getCurrentLevel('s1')).toBe(2);
    });

    it('should fail upgrade on max level', () => {
      tree.addSkill({ id: 's1', name: 'Fire', level: 0, maxLevel: 1, dependencies: [] });
      tree.unlock('s1');
      expect(tree.upgrade('s1')).toBe(false);
    });

    it('should fail upgrade on locked', () => {
      tree.addSkill({ id: 's1', name: 'Fire', level: 0, maxLevel: 3, dependencies: [] });
      expect(tree.upgrade('s1')).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(tree.upgrade('unknown')).toBe(false);
    });
  });

  // ============================================================
  // isUnlocked / getPrerequisites
  // ============================================================
  describe('isUnlocked / getPrerequisites', () => {
    it('should check isUnlocked', () => {
      tree.addSkill({ id: 's1', name: 'Fire', level: 0, maxLevel: 3, dependencies: [] });
      tree.unlock('s1');
      expect(tree.isUnlocked('s1')).toBe(true);
    });

    it('should return false for not unlocked', () => {
      tree.addSkill({ id: 's1', name: 'Fire', level: 0, maxLevel: 3, dependencies: [] });
      expect(tree.isUnlocked('s1')).toBe(false);
    });

    it('should get prereqs', () => {
      tree.addSkill({ id: 's2', name: 'Meteor', level: 0, maxLevel: 3, dependencies: ['s1', 's3'] });
      expect(tree.getPrerequisites('s2')).toHaveLength(2);
    });
  });

  // ============================================================
  // getSkill / getAllSkills / removeSkill
  // ============================================================
  describe('skill queries', () => {
    it('should get skill', () => {
      tree.addSkill({ id: 's1', name: 'Fire', level: 0, maxLevel: 3, dependencies: [] });
      expect(tree.getSkill('s1')?.name).toBe('Fire');
    });

    it('should get all', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 1, dependencies: [] });
      tree.addSkill({ id: 's2', name: 'b', level: 0, maxLevel: 1, dependencies: [] });
      expect(tree.getAllSkills()).toHaveLength(2);
    });

    it('should remove skill', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 1, dependencies: [] });
      expect(tree.removeSkill('s1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(tree.removeSkill('unknown')).toBe(false);
    });
  });

  // ============================================================
  // has / count
  // ============================================================
  describe('has / count', () => {
    it('should check existence', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 1, dependencies: [] });
      expect(tree.hasSkill('s1')).toBe(true);
    });

    it('should count', () => {
      expect(tree.getSkillCount()).toBe(0);
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 1, dependencies: [] });
      expect(tree.getSkillCount()).toBe(1);
    });
  });

  // ============================================================
  // unlocked / locked
  // ============================================================
  describe('unlocked / locked', () => {
    it('should get unlocked skills', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 1, dependencies: [] });
      tree.unlock('s1');
      expect(tree.getUnlockedSkills()).toHaveLength(1);
    });

    it('should get locked skills', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 1, dependencies: [] });
      tree.addSkill({ id: 's2', name: 'b', level: 0, maxLevel: 1, dependencies: ['s1'] });
      expect(tree.getLockedSkills()).toHaveLength(2);
    });

    it('should get unlocked count', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 1, dependencies: [] });
      tree.unlock('s1');
      expect(tree.getUnlockedCount()).toBe(1);
    });
  });

  // ============================================================
  // canUnlock / getMissingPrerequisites
  // ============================================================
  describe('canUnlock / getMissingPrerequisites', () => {
    it('should check canUnlock', () => {
      tree.addSkill({ id: 's2', name: 'b', level: 0, maxLevel: 1, dependencies: ['s1'] });
      expect(tree.canUnlock('s2')).toBe(false);
    });

    it('should return true when deps met', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 1, dependencies: [] });
      tree.addSkill({ id: 's2', name: 'b', level: 0, maxLevel: 1, dependencies: ['s1'] });
      tree.unlock('s1');
      expect(tree.canUnlock('s2')).toBe(true);
    });

    it('should return false for already unlocked', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 1, dependencies: [] });
      tree.unlock('s1');
      expect(tree.canUnlock('s1')).toBe(false);
    });

    it('should get missing prereqs', () => {
      tree.addSkill({ id: 's2', name: 'b', level: 0, maxLevel: 1, dependencies: ['s1'] });
      expect(tree.getMissingPrerequisites('s2')).toContain('s1');
    });
  });

  // ============================================================
  // maxLevel / currentLevel
  // ============================================================
  describe('maxLevel / currentLevel', () => {
    it('should get max level', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 5, dependencies: [] });
      expect(tree.getMaxLevel('s1')).toBe(5);
    });

    it('should get current level', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 5, dependencies: [] });
      tree.unlock('s1');
      expect(tree.getCurrentLevel('s1')).toBe(1);
    });

    it('should return 0 for unknown', () => {
      expect(tree.getMaxLevel('unknown')).toBe(0);
      expect(tree.getCurrentLevel('unknown')).toBe(0);
    });
  });

  // ============================================================
  // reset / availableToUnlock
  // ============================================================
  describe('reset / availableToUnlock', () => {
    it('should reset', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 3, dependencies: [] });
      tree.unlock('s1');
      tree.reset();
      expect(tree.isUnlocked('s1')).toBe(false);
    });

    it('should get available', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 1, dependencies: [] });
      tree.addSkill({ id: 's2', name: 'b', level: 0, maxLevel: 1, dependencies: ['s1'] });
      expect(tree.getAvailableToUnlock()).toHaveLength(1);
    });
  });

  // ============================================================
  // isMaxLevel / getProgress
  // ============================================================
  describe('isMaxLevel / getProgress', () => {
    it('should check isMaxLevel', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 1, dependencies: [] });
      tree.unlock('s1');
      expect(tree.isMaxLevel('s1')).toBe(true);
    });

    it('should return false for not max', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 3, dependencies: [] });
      tree.unlock('s1');
      expect(tree.isMaxLevel('s1')).toBe(false);
    });

    it('should return false for unknown', () => {
      expect(tree.isMaxLevel('unknown')).toBe(false);
    });

    it('should get progress', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 2, dependencies: [] });
      tree.unlock('s1');
      expect(tree.getProgress('s1')).toBe(0.5);
    });

    it('should get overall progress', () => {
      tree.addSkill({ id: 's1', name: 'a', level: 0, maxLevel: 2, dependencies: [] });
      tree.unlock('s1');
      expect(tree.getOverallProgress()).toBe(0.5);
    });

    it('should return 0 for empty', () => {
      expect(tree.getOverallProgress()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many skills', () => {
      for (let i = 0; i < 50; i++) {
        tree.addSkill({ id: `s${i}`, name: `Skill ${i}`, level: 0, maxLevel: 3, dependencies: [] });
      }
      expect(tree.getSkillCount()).toBe(50);
    });
  });
});