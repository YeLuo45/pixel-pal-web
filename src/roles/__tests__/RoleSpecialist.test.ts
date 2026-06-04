/**
 * RoleSpecialist Tests
 * chatdev-design Role Specialization v2
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RoleSpecialist } from '../RoleSpecialist';

describe('RoleSpecialist', () => {
  let specialist: RoleSpecialist;

  beforeEach(() => {
    specialist = new RoleSpecialist();
  });

  afterEach(() => {
    specialist.clearAll();
  });

  // ============================================================
  // register
  // ============================================================
  describe('register', () => {
    it('should register an agent', () => {
      specialist.register({ id: 'a1', role: 'coder', skills: ['js', 'ts'], score: 50 });
      expect(specialist.getAgent('a1')).toBeDefined();
    });

    it('should register many agents', () => {
      for (let i = 0; i < 100; i++) {
        specialist.register({ id: `a${i}`, role: 'dev', skills: ['js'], score: 50 });
      }
      expect(specialist.getAllAgents()).toHaveLength(100);
    });

    it('should not affect original on mutation', () => {
      const agent = { id: 'a1', role: 'coder', skills: ['js'], score: 50 };
      specialist.register(agent);
      agent.score = 100;
      expect(specialist.getAgent('a1')!.score).toBe(50);
    });
  });

  // ============================================================
  // matchRole
  // ============================================================
  describe('matchRole', () => {
    it('should match by skill keyword', () => {
      specialist.register({ id: 'a1', role: 'coder', skills: ['javascript', 'typescript'], score: 50 });
      const matches = specialist.matchRole('a1', 'build javascript project');
      expect(matches).toContain('javascript');
    });

    it('should return all skills when no match', () => {
      specialist.register({ id: 'a1', role: 'coder', skills: ['js', 'ts'], score: 50 });
      const matches = specialist.matchRole('a1', 'random task xyz');
      expect(matches).toHaveLength(2);
    });

    it('should return empty for unknown agent', () => {
      expect(specialist.matchRole('unknown', 'task')).toHaveLength(0);
    });

    it('should track task history', () => {
      specialist.register({ id: 'a1', role: 'coder', skills: ['js'], score: 50 });
      specialist.matchRole('a1', 'build js app');
      specialist.matchRole('a1', 'deploy app');
      expect(specialist.getTaskCount('a1')).toBe(2);
    });
  });

  // ============================================================
  // scoreCollaboration
  // ============================================================
  describe('scoreCollaboration', () => {
    it('should score two agents', () => {
      specialist.register({ id: 'a1', role: 'frontend', skills: ['js', 'css'], score: 50 });
      specialist.register({ id: 'a2', role: 'backend', skills: ['js', 'sql'], score: 60 });
      const score = specialist.scoreCollaboration(['a1', 'a2']);
      expect(score).toBeGreaterThan(0);
    });

    it('should return 0 for single agent', () => {
      specialist.register({ id: 'a1', role: 'coder', skills: ['js'], score: 50 });
      expect(specialist.scoreCollaboration(['a1'])).toBe(0);
    });

    it('should return 0 for unknown agents', () => {
      expect(specialist.scoreCollaboration(['unknown'])).toBe(0);
    });

    it('should factor in role diversity', () => {
      specialist.register({ id: 'a1', role: 'frontend', skills: ['js', 'css', 'html'], score: 50 });
      specialist.register({ id: 'a2', role: 'backend', skills: ['js', 'sql', 'api'], score: 60 });
      const score = specialist.scoreCollaboration(['a1', 'a2']);
      expect(score).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // evolveRole
  // ============================================================
  describe('evolveRole', () => {
    it('should increase score', () => {
      specialist.register({ id: 'a1', role: 'coder', skills: ['js'], score: 50 });
      specialist.matchRole('a1', 'build app');
      specialist.evolveRole('a1');
      expect(specialist.getAgent('a1')!.score).toBe(55);
    });

    it('should cap score at 100', () => {
      specialist.register({ id: 'a1', role: 'coder', skills: ['js'], score: 98 });
      specialist.matchRole('a1', 'task word');
      specialist.evolveRole('a1');
      expect(specialist.getAgent('a1')!.score).toBe(100);
    });

    it('should add skill from task history', () => {
      specialist.register({ id: 'a1', role: 'coder', skills: ['js'], score: 50 });
      specialist.matchRole('a1', 'deployment pipeline task');
      specialist.evolveRole('a1');
      const specs = specialist.getSpecializations('a1');
      expect(specs).toContain('deployment');
    });

    it('should return false for unknown agent', () => {
      expect(specialist.evolveRole('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getSpecializations
  // ============================================================
  describe('getSpecializations', () => {
    it('should return agent skills', () => {
      specialist.register({ id: 'a1', role: 'coder', skills: ['js', 'ts', 'css'], score: 50 });
      expect(specialist.getSpecializations('a1')).toHaveLength(3);
    });

    it('should return empty for unknown agent', () => {
      expect(specialist.getSpecializations('unknown')).toHaveLength(0);
    });

    it('should not expose internal array', () => {
      specialist.register({ id: 'a1', role: 'coder', skills: ['js'], score: 50 });
      specialist.getSpecializations('a1').push('fake');
      expect(specialist.getSpecializations('a1')).toHaveLength(1);
    });
  });

  // ============================================================
  // getAgentsByRole
  // ============================================================
  describe('getAgentsByRole', () => {
    it('should filter by role', () => {
      specialist.register({ id: 'a1', role: 'frontend', skills: ['js'], score: 50 });
      specialist.register({ id: 'a2', role: 'backend', skills: ['js'], score: 60 });
      specialist.register({ id: 'a3', role: 'frontend', skills: ['css'], score: 40 });
      expect(specialist.getAgentsByRole('frontend')).toHaveLength(2);
    });

    it('should return empty for unknown role', () => {
      specialist.register({ id: 'a1', role: 'coder', skills: ['js'], score: 50 });
      expect(specialist.getAgentsByRole('unknown')).toHaveLength(0);
    });
  });

  // ============================================================
  // updateScore
  // ============================================================
  describe('updateScore', () => {
    it('should update score', () => {
      specialist.register({ id: 'a1', role: 'coder', skills: ['js'], score: 50 });
      specialist.updateScore('a1', 20);
      expect(specialist.getAgent('a1')!.score).toBe(70);
    });

    it('should clamp to 0-100', () => {
      specialist.register({ id: 'a1', role: 'coder', skills: ['js'], score: 50 });
      specialist.updateScore('a1', 100);
      expect(specialist.getAgent('a1')!.score).toBe(100);
      specialist.updateScore('a1', -100);
      expect(specialist.getAgent('a1')!.score).toBe(0);
    });

    it('should return false for unknown agent', () => {
      expect(specialist.updateScore('unknown', 10)).toBe(false);
    });
  });

  // ============================================================
  // getTopAgents
  // ============================================================
  describe('getTopAgents', () => {
    it('should return top agents by score', () => {
      specialist.register({ id: 'a1', role: 'c', skills: ['js'], score: 30 });
      specialist.register({ id: 'a2', role: 'c', skills: ['js'], score: 80 });
      specialist.register({ id: 'a3', role: 'c', skills: ['js'], score: 50 });
      const top = specialist.getTopAgents(2);
      expect(top).toHaveLength(2);
      expect(top[0].score).toBe(80);
    });

    it('should return all if count exceeds', () => {
      specialist.register({ id: 'a1', role: 'c', skills: ['js'], score: 50 });
      expect(specialist.getTopAgents(10)).toHaveLength(1);
    });
  });

  // ============================================================
  // getAverageScore
  // ============================================================
  describe('getAverageScore', () => {
    it('should calculate average', () => {
      specialist.register({ id: 'a1', role: 'c', skills: ['js'], score: 40 });
      specialist.register({ id: 'a2', role: 'c', skills: ['js'], score: 60 });
      expect(specialist.getAverageScore()).toBe(50);
    });

    it('should return 0 for empty', () => {
      expect(specialist.getAverageScore()).toBe(0);
    });
  });

  // ============================================================
  // removeAgent
  // ============================================================
  describe('removeAgent', () => {
    it('should remove agent', () => {
      specialist.register({ id: 'a1', role: 'c', skills: ['js'], score: 50 });
      specialist.matchRole('a1', 'task');
      specialist.removeAgent('a1');
      expect(specialist.getAgent('a1')).toBeUndefined();
    });

    it('should clear task history', () => {
      specialist.register({ id: 'a1', role: 'c', skills: ['js'], score: 50 });
      specialist.matchRole('a1', 'task');
      specialist.removeAgent('a1');
      expect(specialist.getTaskCount('a1')).toBe(0);
    });

    it('should return false for unknown', () => {
      expect(specialist.removeAgent('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getBestCollaborator
  // ============================================================
  describe('getBestCollaborator', () => {
    it('should return best collaborator', () => {
      specialist.register({ id: 'a1', role: 'frontend', skills: ['js', 'css'], score: 50 });
      specialist.register({ id: 'a2', role: 'backend', skills: ['js', 'sql'], score: 60 });
      specialist.register({ id: 'a3', role: 'tester', skills: ['python'], score: 70 });
      const best = specialist.getBestCollaborator('a1');
      expect(best).not.toBeNull();
      expect(best!.id).toBe('a2');
    });

    it('should return null for unknown agent', () => {
      expect(specialist.getBestCollaborator('unknown')).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many evolutions', () => {
      specialist.register({ id: 'a1', role: 'c', skills: ['js'], score: 50 });
      for (let i = 0; i < 20; i++) {
        specialist.matchRole('a1', 'complex task word');
        specialist.evolveRole('a1');
      }
      expect(specialist.getAgent('a1')!.score).toBe(100);
    });

    it('should handle empty skills', () => {
      specialist.register({ id: 'a1', role: 'c', skills: [], score: 50 });
      const matches = specialist.matchRole('a1', 'task');
      expect(matches).toHaveLength(0);
    });

    it('should handle duplicate skills', () => {
      specialist.register({ id: 'a1', role: 'c', skills: ['js', 'js', 'ts'], score: 50 });
      expect(specialist.getSpecializations('a1')).toHaveLength(3);
    });

    it('should handle many agents', () => {
      for (let i = 0; i < 50; i++) {
        specialist.register({ id: `a${i}`, role: 'dev', skills: ['js'], score: 50 });
      }
      expect(specialist.getAverageScore()).toBe(50);
    });
  });
});