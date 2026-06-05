/**
 * BeliefEngine Tests
 * generic-agent-design Belief Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BeliefEngine } from '../BeliefEngine';

describe('BeliefEngine', () => {
  let be: BeliefEngine;

  beforeEach(() => {
    be = new BeliefEngine();
  });

  afterEach(() => {
    be.clearAll();
  });

  // ============================================================
  // define / update / query
  // ============================================================
  describe('define / update / query', () => {
    it('should define', () => {
      expect(be.define('b1', 'val')).toBe('bel-1');
    });

    it('should define with parent', () => {
      const id = be.define('b1', 'val');
      expect(be.define('b2', 'val2', id)).toBe('bel-2');
    });

    it('should update', () => {
      const id = be.define('b1', 'val');
      expect(be.update(id, 'new', 0.8)).toBe(true);
    });

    it('should return false for unknown update', () => {
      expect(be.update('unknown', 'val', 0.5)).toBe(false);
    });

    it('should clamp confidence', () => {
      const id = be.define('b1', 'val');
      be.update(id, 'val', 2);
      expect(be.getConfidence(id)).toBe(1);
    });

    it('should query', () => {
      be.define('b1', 'val');
      expect(be.query('b1')).toHaveLength(1);
    });

    it('should return empty for unknown query', () => {
      expect(be.query('unknown')).toHaveLength(0);
    });

    it('should increment access on query', () => {
      be.define('b1', 'val');
      be.query('b1');
      expect(be.getAccessCount('bel-1')).toBe(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      be.define('b1', 'val');
      const stats = be.getStats();
      expect(stats.beliefs).toBe(1);
    });

    it('should compute avg confidence', () => {
      be.define('b1', 'val');
      expect(be.getStats().avgConfidence).toBe(1);
    });

    it('should count roots', () => {
      be.define('b1', 'val');
      expect(be.getStats().rootCount).toBe(1);
    });

    it('should count children', () => {
      const id = be.define('b1', 'val');
      be.define('b2', 'val2', id);
      expect(be.getStats().childCount).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get belief', () => {
      be.define('b1', 'val');
      expect(be.getBelief('bel-1')?.name).toBe('b1');
    });

    it('should get all', () => {
      be.define('b1', 'val');
      expect(be.getAllBeliefs()).toHaveLength(1);
    });

    it('should remove', () => {
      be.define('b1', 'val');
      expect(be.removeBelief('bel-1')).toBe(true);
    });

    it('should re-parent on remove', () => {
      const id = be.define('b1', 'val');
      const childId = be.define('b2', 'val2', id);
      be.removeBelief(id);
      expect(be.getParent(childId)).toBeNull();
    });

    it('should check existence', () => {
      be.define('b1', 'val');
      expect(be.hasBelief('bel-1')).toBe(true);
    });

    it('should count', () => {
      expect(be.getCount()).toBe(0);
      be.define('b1', 'val');
      expect(be.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      be.define('b1', 'val');
      expect(be.getName('bel-1')).toBe('b1');
    });

    it('should get value', () => {
      be.define('b1', 'hello');
      expect(be.getValue('bel-1')).toBe('hello');
    });

    it('should get confidence', () => {
      be.define('b1', 'val');
      expect(be.getConfidence('bel-1')).toBe(1);
    });

    it('should get parent', () => {
      const id = be.define('b1', 'val');
      be.define('b2', 'val2', id);
      expect(be.getParent('bel-2')).toBe('bel-1');
    });
  });

  // ============================================================
  // parent
  // ============================================================
  describe('parent', () => {
    it('should set parent', () => {
      const id = be.define('b1', 'val');
      const child = be.define('b2', 'val2');
      expect(be.setParent(child, id)).toBe(true);
    });

    it('should set null parent', () => {
      const id = be.define('b1', 'val');
      be.define('b2', 'val2', id);
      expect(be.setParent('bel-2', null)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(be.setParent('unknown', null)).toBe(false);
    });

    it('should return false for invalid parent', () => {
      be.define('b1', 'val');
      expect(be.setParent('bel-1', 'unknown')).toBe(false);
    });
  });

  // ============================================================
  // children
  // ============================================================
  describe('children', () => {
    it('should get children', () => {
      const id = be.define('b1', 'val');
      be.define('b2', 'val2', id);
      expect(be.getChildren(id)).toHaveLength(1);
    });

    it('should count children', () => {
      const id = be.define('b1', 'val');
      be.define('b2', 'val2', id);
      expect(be.getChildrenCount(id)).toBe(1);
    });

    it('should check hasChildren', () => {
      const id = be.define('b1', 'val');
      be.define('b2', 'val2', id);
      expect(be.hasChildren(id)).toBe(true);
    });

    it('should return false for no children', () => {
      be.define('b1', 'val');
      expect(be.hasChildren('bel-1')).toBe(false);
    });
  });

  // ============================================================
  // root / leaf
  // ============================================================
  describe('root / leaf', () => {
    it('should check isRoot', () => {
      be.define('b1', 'val');
      expect(be.isRoot('bel-1')).toBe(true);
    });

    it('should check isLeaf', () => {
      const id = be.define('b1', 'val');
      be.define('b2', 'val2', id);
      expect(be.isLeaf('bel-1')).toBe(false);
    });

    it('should get root', () => {
      be.define('b1', 'val');
      expect(be.getRoot()).toHaveLength(1);
    });

    it('should get roots count', () => {
      be.define('b1', 'val');
      expect(be.getRootsCount()).toBe(1);
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      be.define('b1', 'val');
      expect(be.getCreatedAt('bel-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = be.define('b1', 'val');
      be.update(id, 'val2', 0.5);
      expect(be.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // by name
  // ============================================================
  describe('by name', () => {
    it('should get by name', () => {
      be.define('b1', 'val');
      expect(be.getByName('b1')).toHaveLength(1);
    });

    it('should get all names', () => {
      be.define('b1', 'val');
      expect(be.getAllNames()).toHaveLength(1);
    });

    it('should get name count', () => {
      be.define('b1', 'val');
      expect(be.getNameCount()).toBe(1);
    });
  });

  // ============================================================
  // confidence
  // ============================================================
  describe('confidence', () => {
    it('should get high confidence', () => {
      be.define('b1', 'val');
      expect(be.getHighConfidence(0.5)).toHaveLength(1);
    });

    it('should get low confidence', () => {
      be.define('b1', 'val');
      expect(be.getLowConfidence(0.5)).toHaveLength(0);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get most confident', () => {
      be.define('b1', 'val');
      expect(be.getMostConfident()?.id).toBe('bel-1');
    });

    it('should return null for empty', () => {
      expect(be.getMostConfident()).toBeNull();
    });

    it('should get least confident', () => {
      be.define('b1', 'val');
      expect(be.getLeastConfident()?.id).toBe('bel-1');
    });

    it('should return null for empty least', () => {
      expect(be.getLeastConfident()).toBeNull();
    });

    it('should get most accessed', () => {
      be.define('b1', 'val');
      be.query('b1');
      expect(be.getMostAccessed()?.id).toBe('bel-1');
    });

    it('should return null for empty most', () => {
      expect(be.getMostAccessed()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many beliefs', () => {
      for (let i = 0; i < 50; i++) {
        be.define(`b${i}`, i);
      }
      expect(be.getCount()).toBe(50);
    });
  });
});