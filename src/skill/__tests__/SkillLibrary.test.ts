/**
 * SkillLibrary Tests
 * chatdev-design Skill Library
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SkillLibrary, SkillHandler } from '../SkillLibrary';

describe('SkillLibrary', () => {
  let lib: SkillLibrary;

  beforeEach(() => {
    lib = new SkillLibrary();
  });

  afterEach(() => {
    lib.clearAll();
  });

  // ============================================================
  // register
  // ============================================================
  describe('register', () => {
    it('should register', () => {
      expect(lib.register({ id: 's1', name: 'test', description: 'd', handler: () => 1 })).toBe(true);
    });

    it('should reject duplicate', () => {
      lib.register({ id: 's1', name: 'test', description: 'd', handler: () => 1 });
      expect(lib.register({ id: 's1', name: 'test', description: 'd', handler: () => 1 })).toBe(false);
    });
  });

  // ============================================================
  // invoke
  // ============================================================
  describe('invoke', () => {
    it('should invoke', () => {
      lib.register({ id: 's1', name: 'test', description: 'd', handler: () => 42 });
      expect(lib.invoke('s1')).toBe(42);
    });

    it('should pass args', () => {
      lib.register({ id: 's1', name: 'add', description: 'd', handler: ((a: number, b: number) => a + b) as SkillHandler });
      expect(lib.invoke('s1', 2, 3)).toBe(5);
    });

    it('should return undefined for unknown', () => {
      expect(lib.invoke('unknown')).toBeUndefined();
    });

    it('should increment invocations', () => {
      lib.register({ id: 's1', name: 'test', description: 'd', handler: () => 1 });
      lib.invoke('s1');
      expect(lib.getInvocations('s1')).toBe(1);
    });
  });

  // ============================================================
  // update
  // ============================================================
  describe('update', () => {
    it('should update handler', () => {
      lib.register({ id: 's1', name: 'test', description: 'd', handler: () => 1 });
      lib.update('s1', () => 2);
      expect(lib.invoke('s1')).toBe(2);
    });

    it('should return false for unknown', () => {
      expect(lib.update('unknown', () => 1)).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      lib.register({ id: 's1', name: 'test', description: 'd', handler: () => 1 });
      const stats = lib.getStats();
      expect(stats.skills).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get skill', () => {
      lib.register({ id: 's1', name: 'a', description: 'd', handler: () => 1 });
      expect(lib.getSkill('s1')?.name).toBe('a');
    });

    it('should get all', () => {
      lib.register({ id: 's1', name: 'a', description: 'd', handler: () => 1 });
      expect(lib.getAllSkills()).toHaveLength(1);
    });

    it('should remove', () => {
      lib.register({ id: 's1', name: 'a', description: 'd', handler: () => 1 });
      expect(lib.removeSkill('s1')).toBe(true);
    });

    it('should check existence', () => {
      lib.register({ id: 's1', name: 'a', description: 'd', handler: () => 1 });
      expect(lib.hasSkill('s1')).toBe(true);
    });

    it('should count', () => {
      expect(lib.getCount()).toBe(0);
      lib.register({ id: 's1', name: 'a', description: 'd', handler: () => 1 });
      expect(lib.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      lib.register({ id: 's1', name: 'a', description: 'd', handler: () => 1 });
      expect(lib.getName('s1')).toBe('a');
    });

    it('should get description', () => {
      lib.register({ id: 's1', name: 'a', description: 'desc', handler: () => 1 });
      expect(lib.getDescription('s1')).toBe('desc');
    });
  });

  // ============================================================
  // updaters
  // ============================================================
  describe('updaters', () => {
    it('should update name', () => {
      lib.register({ id: 's1', name: 'a', description: 'd', handler: () => 1 });
      expect(lib.updateName('s1', 'b')).toBe(true);
    });

    it('should update description', () => {
      lib.register({ id: 's1', name: 'a', description: 'd', handler: () => 1 });
      expect(lib.updateDescription('s1', 'new')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(lib.updateName('unknown', 'b')).toBe(false);
      expect(lib.updateDescription('unknown', 'd')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset invocations', () => {
      lib.register({ id: 's1', name: 'a', description: 'd', handler: () => 1 });
      lib.invoke('s1');
      expect(lib.resetInvocations('s1')).toBe(true);
    });

    it('should reset all invocations', () => {
      lib.register({ id: 's1', name: 'a', description: 'd', handler: () => 1 });
      lib.invoke('s1');
      lib.resetAllInvocations();
      expect(lib.getInvocations('s1')).toBe(0);
    });

    it('should return false for unknown reset', () => {
      expect(lib.resetInvocations('unknown')).toBe(false);
    });
  });

  // ============================================================
  // most / least
  // ============================================================
  describe('most / least', () => {
    it('should get most invoked', () => {
      lib.register({ id: 's1', name: 'a', description: 'd', handler: () => 1 });
      lib.invoke('s1');
      expect(lib.getMostInvoked()?.id).toBe('s1');
    });

    it('should return null for empty', () => {
      expect(lib.getMostInvoked()).toBeNull();
    });

    it('should get least invoked', () => {
      lib.register({ id: 's1', name: 'a', description: 'd', handler: () => 1 });
      expect(lib.getLeastInvoked()?.id).toBe('s1');
    });

    it('should return null for empty least', () => {
      expect(lib.getLeastInvoked()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      lib.register({ id: 's1', name: 'a', description: 'd', handler: () => 1 });
      expect(lib.getCreatedAt('s1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      lib.register({ id: 's1', name: 'a', description: 'd', handler: () => 1 });
      expect(lib.getUpdatedAt('s1')).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // aggregate
  // ============================================================
  describe('aggregate', () => {
    it('should get avg invocations', () => {
      lib.register({ id: 's1', name: 'a', description: 'd', handler: () => 1 });
      lib.invoke('s1');
      expect(lib.getAvgInvocations()).toBe(1);
    });

    it('should return 0 for empty', () => {
      expect(lib.getAvgInvocations()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many skills', () => {
      for (let i = 0; i < 50; i++) {
        lib.register({ id: `s${i}`, name: `s${i}`, description: 'd', handler: () => 1 });
      }
      expect(lib.getCount()).toBe(50);
    });
  });
});