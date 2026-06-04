/**
 * RoleDiscoverer Tests
 * chatdev-design Role Discoverer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RoleDiscoverer } from '../RoleDiscoverer';

describe('RoleDiscoverer', () => {
  let discoverer: RoleDiscoverer;

  beforeEach(() => {
    discoverer = new RoleDiscoverer();
  });

  afterEach(() => {
    discoverer.clearAll();
  });

  // ============================================================
  // registerRole
  // ============================================================
  describe('registerRole', () => {
    it('should register role', () => {
      discoverer.registerRole({ name: 'developer', skills: ['js'], description: 'develops' });
      expect(discoverer.getRoleCount()).toBe(1);
    });

    it('should not mutate input', () => {
      const skills = ['a'];
      discoverer.registerRole({ name: 'r1', skills, description: 'd' });
      skills.push('b');
      expect(discoverer.getSkillsOfRole('r1')).toEqual(['a']);
    });
  });

  // ============================================================
  // matchBySkill
  // ============================================================
  describe('matchBySkill', () => {
    it('should match by skill', () => {
      discoverer.registerRole({ name: 'r1', skills: ['js'], description: 'd' });
      discoverer.registerRole({ name: 'r2', skills: ['py'], description: 'd' });
      const matched = discoverer.matchBySkill('js');
      expect(matched).toHaveLength(1);
    });

    it('should return empty for unknown skill', () => {
      expect(discoverer.matchBySkill('unknown')).toHaveLength(0);
    });

    it('should return multiple', () => {
      discoverer.registerRole({ name: 'r1', skills: ['js'], description: 'd' });
      discoverer.registerRole({ name: 'r2', skills: ['js'], description: 'd' });
      expect(discoverer.matchBySkill('js')).toHaveLength(2);
    });
  });

  // ============================================================
  // recommend
  // ============================================================
  describe('recommend', () => {
    it('should recommend based on task', () => {
      discoverer.registerRole({ name: 'developer', skills: ['js'], description: 'develops software' });
      const recs = discoverer.recommend('develops');
      expect(recs).toHaveLength(1);
    });

    it('should return empty for no match', () => {
      discoverer.registerRole({ name: 'developer', skills: ['js'], description: 'd' });
      expect(discoverer.recommend('zzzzz')).toHaveLength(0);
    });
  });

  // ============================================================
  // analyze
  // ============================================================
  describe('analyze', () => {
    it('should analyze role', () => {
      const role = { name: 'r1', skills: ['a', 'b', 'c'], description: 'd' };
      const analysis = discoverer.analyze(role);
      expect(analysis.skillCount).toBe(3);
    });

    it('should return rarity 5 for no roles', () => {
      const analysis = discoverer.analyze({ name: 'r1', skills: ['a', 'b'], description: 'd' });
      expect(analysis.rarity).toBe(5);
    });
  });

  // ============================================================
  // getRole / getAllRoles / removeRole
  // ============================================================
  describe('role queries', () => {
    it('should get role', () => {
      discoverer.registerRole({ name: 'r1', skills: ['a'], description: 'd' });
      expect(discoverer.getRole('r1')?.description).toBe('d');
    });

    it('should get all', () => {
      discoverer.registerRole({ name: 'r1', skills: ['a'], description: 'd' });
      discoverer.registerRole({ name: 'r2', skills: ['b'], description: 'd' });
      expect(discoverer.getAllRoles()).toHaveLength(2);
    });

    it('should remove role', () => {
      discoverer.registerRole({ name: 'r1', skills: ['a'], description: 'd' });
      expect(discoverer.removeRole('r1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(discoverer.removeRole('unknown')).toBe(false);
    });
  });

  // ============================================================
  // has / count
  // ============================================================
  describe('has / count', () => {
    it('should check existence', () => {
      discoverer.registerRole({ name: 'r1', skills: ['a'], description: 'd' });
      expect(discoverer.hasRole('r1')).toBe(true);
    });

    it('should count', () => {
      expect(discoverer.getRoleCount()).toBe(0);
      discoverer.registerRole({ name: 'r1', skills: ['a'], description: 'd' });
      expect(discoverer.getRoleCount()).toBe(1);
    });
  });

  // ============================================================
  // skills
  // ============================================================
  describe('skills', () => {
    it('should get all skills', () => {
      discoverer.registerRole({ name: 'r1', skills: ['a', 'b'], description: 'd' });
      discoverer.registerRole({ name: 'r2', skills: ['c'], description: 'd' });
      expect(discoverer.getAllSkills()).toHaveLength(3);
    });

    it('should count skills', () => {
      discoverer.registerRole({ name: 'r1', skills: ['a', 'b'], description: 'd' });
      expect(discoverer.getSkillCount()).toBe(2);
    });
  });

  // ============================================================
  // searchRoles
  // ============================================================
  describe('searchRoles', () => {
    it('should search by name', () => {
      discoverer.registerRole({ name: 'developer', skills: ['js'], description: 'd' });
      expect(discoverer.searchRoles('dev')).toHaveLength(1);
    });

    it('should search by description', () => {
      discoverer.registerRole({ name: 'r1', skills: ['a'], description: 'develops' });
      expect(discoverer.searchRoles('dev')).toHaveLength(1);
    });
  });

  // ============================================================
  // getRolesBySkillCount
  // ============================================================
  describe('getRolesBySkillCount', () => {
    it('should filter by skill count', () => {
      discoverer.registerRole({ name: 'r1', skills: ['a'], description: 'd' });
      discoverer.registerRole({ name: 'r2', skills: ['a', 'b'], description: 'd' });
      discoverer.registerRole({ name: 'r3', skills: ['a', 'b', 'c'], description: 'd' });
      expect(discoverer.getRolesBySkillCount(2, 3)).toHaveLength(2);
    });
  });

  // ============================================================
  // addSkill / removeSkill
  // ============================================================
  describe('addSkill / removeSkill', () => {
    it('should add skill', () => {
      discoverer.registerRole({ name: 'r1', skills: ['a'], description: 'd' });
      expect(discoverer.addSkillToRole('r1', 'b')).toBe(true);
      expect(discoverer.getSkillsOfRole('r1')).toContain('b');
    });

    it('should not add duplicate', () => {
      discoverer.registerRole({ name: 'r1', skills: ['a'], description: 'd' });
      discoverer.addSkillToRole('r1', 'a');
      expect(discoverer.getSkillsOfRole('r1')).toHaveLength(1);
    });

    it('should remove skill', () => {
      discoverer.registerRole({ name: 'r1', skills: ['a', 'b'], description: 'd' });
      expect(discoverer.removeSkillFromRole('r1', 'a')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(discoverer.addSkillToRole('unknown', 'a')).toBe(false);
      expect(discoverer.removeSkillFromRole('unknown', 'a')).toBe(false);
    });
  });

  // ============================================================
  // getMostSkilledRole / getRareSkills
  // ============================================================
  describe('getMostSkilledRole / getRareSkills', () => {
    it('should return null for no roles', () => {
      expect(discoverer.getMostSkilledRole()).toBeNull();
    });

    it('should get most skilled', () => {
      discoverer.registerRole({ name: 'r1', skills: ['a'], description: 'd' });
      discoverer.registerRole({ name: 'r2', skills: ['a', 'b', 'c'], description: 'd' });
      expect(discoverer.getMostSkilledRole()?.name).toBe('r2');
    });

    it('should get rare skills', () => {
      discoverer.registerRole({ name: 'r1', skills: ['a'], description: 'd' });
      discoverer.registerRole({ name: 'r2', skills: ['b'], description: 'd' });
      expect(discoverer.getRareSkills()).toHaveLength(2);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many roles', () => {
      for (let i = 0; i < 50; i++) {
        discoverer.registerRole({ name: `r${i}`, skills: [`s${i}`], description: 'd' });
      }
      expect(discoverer.getRoleCount()).toBe(50);
    });
  });
});