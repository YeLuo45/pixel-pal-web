/**
 * ComposerEngine Tests
 * claude-code-design Composer Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComposerEngine } from '../ComposerEngine';

describe('ComposerEngine', () => {
  let cpe: ComposerEngine;

  beforeEach(() => {
    cpe = new ComposerEngine();
  });

  afterEach(() => {
    cpe.clearAll();
  });

  describe('compose / build / remove', () => {
    it('should compose', () => {
      expect(cpe.compose('c1', 'sequence', 3)).toBe('cpe-1');
    });

    it('should default built to false', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.isBuilt('cpe-1')).toBe(false);
    });

    it('should mark as active', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.isActive('cpe-1')).toBe(true);
    });

    it('should build', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.build('cpe-1')).toBe(true);
    });

    it('should not build inactive', () => {
      cpe.compose('c1', 'sequence', 3);
      cpe.setActive('cpe-1', false);
      expect(cpe.build('cpe-1')).toBe(false);
    });

    it('should return false for unknown build', () => {
      expect(cpe.build('unknown')).toBe(false);
    });

    it('should remove', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.remove('cpe-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getStats().compositions).toBe(1);
    });

    it('should count total composed', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getStats().totalComposed).toBe(1);
    });

    it('should count total built', () => {
      cpe.compose('c1', 'sequence', 3);
      cpe.build('cpe-1');
      expect(cpe.getStats().totalBuilt).toBe(1);
    });

    it('should count sequence', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getStats().sequence).toBe(1);
    });

    it('should count parallel', () => {
      cpe.compose('c1', 'parallel', 3);
      expect(cpe.getStats().parallel).toBe(1);
    });

    it('should count conditional', () => {
      cpe.compose('c1', 'conditional', 3);
      expect(cpe.getStats().conditional).toBe(1);
    });

    it('should count built', () => {
      cpe.compose('c1', 'sequence', 3);
      cpe.build('cpe-1');
      expect(cpe.getStats().built).toBe(1);
    });

    it('should count unbuilt', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getStats().unbuilt).toBe(1);
    });

    it('should count active', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      cpe.compose('c1', 'sequence', 3);
      cpe.setActive('cpe-1', false);
      expect(cpe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      cpe.compose('c1', 'sequence', 3);
      cpe.build('cpe-1');
      expect(cpe.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      cpe.compose('a', 'sequence', 1);
      cpe.compose('a', 'sequence', 1);
      expect(cpe.getStats().uniqueNames).toBe(1);
    });

    it('should count total parts', () => {
      cpe.compose('c1', 'sequence', 3);
      cpe.compose('c2', 'sequence', 5);
      expect(cpe.getStats().totalParts).toBe(8);
    });

    it('should compute avg parts', () => {
      cpe.compose('c1', 'sequence', 3);
      cpe.compose('c2', 'sequence', 5);
      expect(cpe.getStats().avgParts).toBe(4);
    });

    it('should get max parts', () => {
      cpe.compose('c1', 'sequence', 3);
      cpe.compose('c2', 'sequence', 5);
      expect(cpe.getStats().maxParts).toBe(5);
    });

    it('should get min parts', () => {
      cpe.compose('c1', 'sequence', 3);
      cpe.compose('c2', 'sequence', 5);
      expect(cpe.getStats().minParts).toBe(3);
    });
  });

  describe('queries', () => {
    it('should get composition', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getComposition('cpe-1')?.name).toBe('c1');
    });

    it('should get all', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getAllCompositions()).toHaveLength(1);
    });

    it('should check existence', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.hasComposition('cpe-1')).toBe(true);
    });

    it('should count', () => {
      expect(cpe.getCount()).toBe(0);
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getName('cpe-1')).toBe('c1');
    });

    it('should get type', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getType('cpe-1')).toBe('sequence');
    });

    it('should get parts', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getParts('cpe-1')).toBe(3);
    });

    it('should get hits', () => {
      cpe.compose('c1', 'sequence', 3);
      cpe.build('cpe-1');
      expect(cpe.getHits('cpe-1')).toBe(1);
    });

    it('should check sequence', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.isSequence('cpe-1')).toBe(true);
    });

    it('should check parallel', () => {
      cpe.compose('c1', 'parallel', 3);
      expect(cpe.isParallel('cpe-1')).toBe(true);
    });

    it('should check conditional', () => {
      cpe.compose('c1', 'conditional', 3);
      expect(cpe.isConditional('cpe-1')).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.setActive('cpe-1', false)).toBe(true);
    });

    it('should set name', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.setName('cpe-1', 'c2')).toBe(true);
    });

    it('should set type', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.setType('cpe-1', 'parallel')).toBe(true);
    });

    it('should set parts', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.setParts('cpe-1', 5)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cpe.setActive('unknown', false)).toBe(false);
      expect(cpe.setName('unknown', 'c')).toBe(false);
      expect(cpe.setType('unknown', 'parallel')).toBe(false);
      expect(cpe.setParts('unknown', 1)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      cpe.compose('c1', 'sequence', 3);
      cpe.build('cpe-1');
      cpe.setActive('cpe-1', false);
      cpe.resetAll();
      expect(cpe.isBuilt('cpe-1')).toBe(false);
      expect(cpe.isActive('cpe-1')).toBe(true);
    });
  });

  describe('by type / built / state', () => {
    it('should get by type', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getByType('sequence')).toHaveLength(1);
    });

    it('should get built', () => {
      cpe.compose('c1', 'sequence', 3);
      cpe.build('cpe-1');
      expect(cpe.getBuiltCompositions()).toHaveLength(1);
    });

    it('should get unbuilt', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getUnbuiltCompositions()).toHaveLength(1);
    });

    it('should get active', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getActiveCompositions()).toHaveLength(1);
    });

    it('should get inactive', () => {
      cpe.compose('c1', 'sequence', 3);
      cpe.setActive('cpe-1', false);
      expect(cpe.getInactiveCompositions()).toHaveLength(1);
    });

    it('should get all names', () => {
      cpe.compose('a', 'sequence', 1);
      cpe.compose('b', 'sequence', 1);
      expect(cpe.getAllNames()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getNewest()?.id).toBe('cpe-1');
    });

    it('should return null for empty newest', () => {
      expect(cpe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getOldest()?.id).toBe('cpe-1');
    });

    it('should return null for empty oldest', () => {
      expect(cpe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getCreatedAt('cpe-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      cpe.compose('c1', 'sequence', 3);
      cpe.build('cpe-1');
      expect(cpe.getUpdatedAt('cpe-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total composed', () => {
      cpe.compose('c1', 'sequence', 3);
      expect(cpe.getTotalComposed()).toBe(1);
    });

    it('should get total built', () => {
      cpe.compose('c1', 'sequence', 3);
      cpe.build('cpe-1');
      expect(cpe.getTotalBuilt()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many compositions', () => {
      for (let i = 0; i < 50; i++) {
        cpe.compose(`c${i}`, 'sequence', 1);
      }
      expect(cpe.getCount()).toBe(50);
    });
  });
});