/**
 * AliasEngine Tests
 * claude-code-design Alias Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AliasEngine } from '../AliasEngine';

describe('AliasEngine', () => {
  let ale: AliasEngine;

  beforeEach(() => {
    ale = new AliasEngine();
  });

  afterEach(() => {
    ale.clearAll();
  });

  describe('define / resolve / remove', () => {
    it('should define', () => {
      expect(ale.define('a1', 'target1', 'shortcut')).toMatch(/^ale-/);
    });

    it('should mark as active', () => {
      ale.define('a1', 'target1', 'shortcut');
      expect(ale.isActive(ale.getAllAliases()[0].id)).toBe(true);
    });

    it('should resolve', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      expect(ale.resolve(id)).toBe('target1');
    });

    it('should increment resolved', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      ale.resolve(id);
      expect(ale.getResolved(id)).toBe(1);
    });

    it('should not resolve inactive', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      ale.setActive(id, false);
      expect(ale.resolve(id)).toBeNull();
    });

    it('should return null for unknown resolve', () => {
      expect(ale.resolve('unknown')).toBeNull();
    });

    it('should remove', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      expect(ale.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      ale.define('a1', 'target1', 'shortcut');
      expect(ale.getStats().aliases).toBe(1);
    });

    it('should count total added', () => {
      ale.define('a1', 'target1', 'shortcut');
      expect(ale.getStats().totalAdded).toBe(1);
    });

    it('should count total resolved', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      ale.resolve(id);
      expect(ale.getStats().totalResolved).toBe(1);
    });
    it('should count total removed', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      ale.remove(id);
      expect(ale.getStats().totalRemoved).toBe(1);
    });

    it('should count shortcut', () => {
      ale.define('a1', 'target1', 'shortcut');
      expect(ale.getStats().shortcut).toBe(1);
    });

    it('should count macro', () => {
      ale.define('a1', 'target1', 'macro');
      expect(ale.getStats().macro).toBe(1);
    });

    it('should count redirect', () => {
      ale.define('a1', 'target1', 'redirect');
      expect(ale.getStats().redirect).toBe(1);
    });

    it('should count symlink', () => {
      ale.define('a1', 'target1', 'symlink');
      expect(ale.getStats().symlink).toBe(1);
    });

    it('should count active', () => {
      ale.define('a1', 'target1', 'shortcut');
      expect(ale.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      ale.setActive(id, false);
      expect(ale.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      ale.resolve(id);
      expect(ale.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      ale.define('a', 't1', 'shortcut');
      ale.define('a', 't2', 'shortcut');
      expect(ale.getStats().uniqueNames).toBe(1);
    });

    it('should count unique targets', () => {
      ale.define('a1', 't', 'shortcut');
      ale.define('a2', 't', 'shortcut');
      expect(ale.getStats().uniqueTargets).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get alias', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      expect(ale.getAlias(id)?.name).toBe('a1');
    });

    it('should get all', () => {
      ale.define('a1', 'target1', 'shortcut');
      expect(ale.getAllAliases()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      expect(ale.hasAlias(id)).toBe(true);
    });

    it('should count', () => {
      expect(ale.getCount()).toBe(0);
      ale.define('a1', 'target1', 'shortcut');
      expect(ale.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      expect(ale.getName(id)).toBe('a1');
    });

    it('should get target', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      expect(ale.getTarget(id)).toBe('target1');
    });

    it('should get type', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      expect(ale.getType(id)).toBe('shortcut');
    });

    it('should get hits', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      ale.resolve(id);
      expect(ale.getHits(id)).toBe(1);
    });

    it('should check shortcut', () => {
      ale.define('a1', 'target1', 'shortcut');
      expect(ale.isShortcut(ale.getAllAliases()[0].id)).toBe(true);
    });

    it('should check macro', () => {
      ale.define('a1', 'target1', 'macro');
      expect(ale.isMacro(ale.getAllAliases()[0].id)).toBe(true);
    });

    it('should check redirect', () => {
      ale.define('a1', 'target1', 'redirect');
      expect(ale.isRedirect(ale.getAllAliases()[0].id)).toBe(true);
    });

    it('should check symlink', () => {
      ale.define('a1', 'target1', 'symlink');
      expect(ale.isSymlink(ale.getAllAliases()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      expect(ale.setActive(id, false)).toBe(true);
    });

    it('should set name', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      expect(ale.setName(id, 'a2')).toBe(true);
    });

    it('should set target', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      expect(ale.setTarget(id, 'target2')).toBe(true);
    });

    it('should set type', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      expect(ale.setType(id, 'macro')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(ale.setActive('unknown', false)).toBe(false);
      expect(ale.setName('unknown', 'a')).toBe(false);
      expect(ale.setTarget('unknown', 't')).toBe(false);
      expect(ale.setType('unknown', 'shortcut')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      ale.resolve(id);
      ale.setActive(id, false);
      ale.resetAll();
      expect(ale.getResolved(id)).toBe(0);
      expect(ale.isActive(id)).toBe(true);
    });
  });

  describe('by type / state', () => {
    it('should get by type', () => {
      ale.define('a1', 'target1', 'shortcut');
      expect(ale.getByType('shortcut')).toHaveLength(1);
    });

    it('should get active', () => {
      ale.define('a1', 'target1', 'shortcut');
      expect(ale.getActiveAliases()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      ale.setActive(id, false);
      expect(ale.getInactiveAliases()).toHaveLength(1);
    });

    it('should get all names', () => {
      ale.define('a', 't1', 'shortcut');
      ale.define('b', 't2', 'shortcut');
      expect(ale.getAllNames()).toHaveLength(2);
    });

    it('should get all targets', () => {
      ale.define('a1', 't1', 'shortcut');
      ale.define('a2', 't2', 'shortcut');
      expect(ale.getAllTargets()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      ale.define('a1', 'target1', 'shortcut');
      expect(ale.getNewest()?.name).toBe('a1');
    });

    it('should return null for empty newest', () => {
      expect(ale.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      ale.define('a1', 'target1', 'shortcut');
      expect(ale.getOldest()?.name).toBe('a1');
    });

    it('should return null for empty oldest', () => {
      expect(ale.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      expect(ale.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      ale.resolve(id);
      expect(ale.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total added', () => {
      ale.define('a1', 'target1', 'shortcut');
      expect(ale.getTotalAdded()).toBe(1);
    });

    it('should get total resolved', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      ale.resolve(id);
      expect(ale.getTotalResolved()).toBe(1);
    });

    it('should get total removed', () => {
      const id = ale.define('a1', 'target1', 'shortcut');
      ale.remove(id);
      expect(ale.getTotalRemoved()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many aliases', () => {
      for (let i = 0; i < 50; i++) {
        ale.define(`a${i}`, `t${i}`, 'shortcut');
      }
      expect(ale.getCount()).toBe(50);
    });
  });
});