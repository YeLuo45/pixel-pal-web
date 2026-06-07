/**
 * ScopeEngine Tests
 * claude-code-design Scope Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ScopeEngine } from '../ScopeEngine';

describe('ScopeEngine', () => {
  let sce: ScopeEngine;

  beforeEach(() => {
    sce = new ScopeEngine();
  });

  afterEach(() => {
    sce.clearAll();
  });

  describe('add / enter / exit / remove', () => {
    it('should add', () => {
      expect(sce.add('s1', 'function')).toMatch(/^sce-scope-/);
    });

    it('should mark as active', () => {
      sce.add('s1', 'function');
      expect(sce.isActive(sce.getAllScopes()[0].id)).toBe(true);
    });

    it('should enter', () => {
      const id = sce.add('s1', 'function');
      expect(sce.enter(id)).toBe(true);
    });

    it('should increment entered', () => {
      const id = sce.add('s1', 'function');
      sce.enter(id);
      expect(sce.getEntered(id)).toBe(1);
    });

    it('should not enter inactive', () => {
      const id = sce.add('s1', 'function');
      sce.setActive(id, false);
      expect(sce.enter(id)).toBe(false);
    });

    it('should return false for unknown enter', () => {
      expect(sce.enter('unknown')).toBe(false);
    });

    it('should exit', () => {
      const id = sce.add('s1', 'function');
      sce.enter(id);
      expect(sce.exit(id)).toBe(true);
    });

    it('should increment exited', () => {
      const id = sce.add('s1', 'function');
      sce.enter(id);
      sce.exit(id);
      expect(sce.getExited(id)).toBe(1);
    });

    it('should not exit when not entered', () => {
      const id = sce.add('s1', 'function');
      expect(sce.exit(id)).toBe(false);
    });

    it('should not exit inactive', () => {
      const id = sce.add('s1', 'function');
      sce.enter(id);
      sce.setActive(id, false);
      expect(sce.exit(id)).toBe(false);
    });

    it('should return false for unknown exit', () => {
      expect(sce.exit('unknown')).toBe(false);
    });

    it('should get depth', () => {
      const id = sce.add('s1', 'function');
      sce.enter(id);
      sce.enter(id);
      sce.exit(id);
      expect(sce.depth(id)).toBe(1);
    });

    it('should remove', () => {
      const id = sce.add('s1', 'function');
      expect(sce.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      sce.add('s1', 'function');
      expect(sce.getStats().scopes).toBe(1);
    });

    it('should count total added', () => {
      sce.add('s1', 'function');
      expect(sce.getStats().totalAdded).toBe(1);
    });

    it('should count total entered', () => {
      const id = sce.add('s1', 'function');
      sce.enter(id);
      expect(sce.getStats().totalEntered).toBe(1);
    });

    it('should count total exited', () => {
      const id = sce.add('s1', 'function');
      sce.enter(id);
      sce.exit(id);
      expect(sce.getStats().totalExited).toBe(1);
    });

    it('should count function', () => {
      sce.add('s1', 'function');
      expect(sce.getStats().function).toBe(1);
    });

    it('should count block', () => {
      sce.add('s1', 'block');
      expect(sce.getStats().block).toBe(1);
    });

    it('should count module', () => {
      sce.add('s1', 'module');
      expect(sce.getStats().module).toBe(1);
    });

    it('should count global', () => {
      sce.add('s1', 'global');
      expect(sce.getStats().global).toBe(1);
    });

    it('should count active', () => {
      sce.add('s1', 'function');
      expect(sce.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sce.add('s1', 'function');
      sce.setActive(id, false);
      expect(sce.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = sce.add('s1', 'function');
      sce.enter(id);
      expect(sce.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      sce.add('a', 'function');
      sce.add('a', 'function');
      expect(sce.getStats().uniqueNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get scope', () => {
      const id = sce.add('s1', 'function');
      expect(sce.getScope(id)?.name).toBe('s1');
    });

    it('should get all', () => {
      sce.add('s1', 'function');
      expect(sce.getAllScopes()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = sce.add('s1', 'function');
      expect(sce.hasScope(id)).toBe(true);
    });

    it('should count', () => {
      expect(sce.getCount()).toBe(0);
      sce.add('s1', 'function');
      expect(sce.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = sce.add('s1', 'function');
      expect(sce.getName(id)).toBe('s1');
    });

    it('should get type', () => {
      const id = sce.add('s1', 'function');
      expect(sce.getType(id)).toBe('function');
    });

    it('should get hits', () => {
      const id = sce.add('s1', 'function');
      sce.enter(id);
      expect(sce.getHits(id)).toBe(1);
    });

    it('should check function', () => {
      sce.add('s1', 'function');
      expect(sce.isFunction(sce.getAllScopes()[0].id)).toBe(true);
    });

    it('should check block', () => {
      sce.add('s1', 'block');
      expect(sce.isBlock(sce.getAllScopes()[0].id)).toBe(true);
    });

    it('should check module', () => {
      sce.add('s1', 'module');
      expect(sce.isModule(sce.getAllScopes()[0].id)).toBe(true);
    });

    it('should check global', () => {
      sce.add('s1', 'global');
      expect(sce.isGlobal(sce.getAllScopes()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = sce.add('s1', 'function');
      expect(sce.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = sce.add('s1', 'function');
      expect(sce.setName(id, 's2')).toBe(true);
    });

    it('should set type', () => {
      const id = sce.add('s1', 'function');
      expect(sce.setType(id, 'block')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sce.setActive('unknown', false)).toBe(false);
      expect(sce.setName('unknown', 's')).toBe(false);
      expect(sce.setType('unknown', 'function')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = sce.add('s1', 'function');
      sce.enter(id);
      sce.setActive(id, false);
      sce.resetAll();
      expect(sce.getEntered(id)).toBe(0);
      expect(sce.isActive(id)).toBe(true);
    });
  });

  describe('by type / state', () => {
    it('should get by type', () => {
      sce.add('s1', 'function');
      expect(sce.getByType('function')).toHaveLength(1);
    });

    it('should get active', () => {
      sce.add('s1', 'function');
      expect(sce.getActiveScopes()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = sce.add('s1', 'function');
      sce.setActive(id, false);
      expect(sce.getInactiveScopes()).toHaveLength(1);
    });

    it('should get all names', () => {
      sce.add('a', 'function');
      sce.add('b', 'function');
      expect(sce.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      sce.add('s1', 'function');
      expect(sce.getNewest()?.name).toBe('s1');
    });

    it('should return null for empty newest', () => {
      expect(sce.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sce.add('s1', 'function');
      expect(sce.getOldest()?.name).toBe('s1');
    });

    it('should return null for empty oldest', () => {
      expect(sce.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = sce.add('s1', 'function');
      expect(sce.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sce.add('s1', 'function');
      sce.enter(id);
      expect(sce.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      sce.add('s1', 'function');
      expect(sce.getTotalAdded()).toBe(1);
    });

    it('should get total entered', () => {
      const id = sce.add('s1', 'function');
      sce.enter(id);
      expect(sce.getTotalEntered()).toBe(1);
    });

    it('should get total exited', () => {
      const id = sce.add('s1', 'function');
      sce.enter(id);
      sce.exit(id);
      expect(sce.getTotalExited()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many scopes', () => {
      for (let i = 0; i < 50; i++) {
        sce.add(`s${i}`, 'function');
      }
      expect(sce.getCount()).toBe(50);
    });
  });
});