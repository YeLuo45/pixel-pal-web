/**
 * WorldModelEngine Tests
 * generic-agent-design World Model Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorldModelEngine } from '../WorldModelEngine';

describe('WorldModelEngine', () => {
  let wme: WorldModelEngine;

  beforeEach(() => {
    wme = new WorldModelEngine();
  });

  afterEach(() => {
    wme.clearAll();
  });

  describe('addObject / addRelation / query / remove', () => {
    it('should add object', () => {
      expect(wme.addObject('o1', 'person')).toMatch(/^wme-o-/);
    });

    it('should mark as active', () => {
      const id = wme.addObject('o1', 'person');
      expect(wme.isActive(id)).toBe(true);
    });

    it('should add relation', () => {
      const a = wme.addObject('a', 'person');
      const b = wme.addObject('b', 'person');
      expect(wme.addRelation(a, b, 'knows')).toMatch(/^wme-r-/);
    });

    it('should query', () => {
      const a = wme.addObject('a', 'person');
      const b = wme.addObject('b', 'person');
      wme.addRelation(a, b, 'knows');
      const q = wme.query(a);
      expect(q.object).toBeDefined();
      expect(q.relations).toHaveLength(1);
    });

    it('should query empty for no relations', () => {
      const a = wme.addObject('a', 'person');
      const q = wme.query(a);
      expect(q.relations).toHaveLength(0);
    });

    it('should remove object', () => {
      const id = wme.addObject('o1', 'person');
      expect(wme.removeObject(id)).toBe(true);
    });

    it('should remove relation', () => {
      const a = wme.addObject('a', 'person');
      const b = wme.addObject('b', 'person');
      const rid = wme.addRelation(a, b, 'knows');
      expect(wme.removeRelation(rid)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      wme.addObject('a', 'person');
      expect(wme.getStats().objects).toBe(1);
    });

    it('should count relations', () => {
      const a = wme.addObject('a', 'person');
      const b = wme.addObject('b', 'person');
      wme.addRelation(a, b, 'knows');
      expect(wme.getStats().relations).toBe(1);
    });

    it('should count total objects', () => {
      wme.addObject('a', 'person');
      expect(wme.getStats().totalObjects).toBe(1);
    });

    it('should count total relations', () => {
      const a = wme.addObject('a', 'person');
      const b = wme.addObject('b', 'person');
      wme.addRelation(a, b, 'knows');
      expect(wme.getStats().totalRelations).toBe(1);
    });

    it('should count active objects', () => {
      wme.addObject('a', 'person');
      expect(wme.getStats().activeObjects).toBe(1);
    });

    it('should count inactive objects', () => {
      const id = wme.addObject('a', 'person');
      wme.setActiveObject(id, false);
      expect(wme.getStats().inactiveObjects).toBe(1);
    });

    it('should count active relations', () => {
      const a = wme.addObject('a', 'person');
      const b = wme.addObject('b', 'person');
      wme.addRelation(a, b, 'knows');
      expect(wme.getStats().activeRelations).toBe(1);
    });

    it('should count inactive relations', () => {
      const a = wme.addObject('a', 'person');
      const b = wme.addObject('b', 'person');
      const rid = wme.addRelation(a, b, 'knows');
      wme.setActiveRelation(rid, false);
      expect(wme.getStats().inactiveRelations).toBe(1);
    });

    it('should count total hits', () => {
      const id = wme.addObject('a', 'person');
      wme.query(id);
      expect(wme.getStats().totalHits).toBe(0);
    });

    it('should count unique object types', () => {
      wme.addObject('a', 'person');
      wme.addObject('b', 'person');
      expect(wme.getStats().uniqueObjectTypes).toBe(1);
    });

    it('should count unique relation types', () => {
      const a = wme.addObject('a', 'p');
      const b = wme.addObject('b', 'p');
      wme.addRelation(a, b, 'knows');
      wme.addRelation(b, a, 'knows');
      expect(wme.getStats().uniqueRelationTypes).toBe(1);
    });

    it('should count unique object names', () => {
      wme.addObject('a', 'p');
      wme.addObject('a', 'p');
      expect(wme.getStats().uniqueObjectNames).toBe(1);
    });
  });

  describe('queries', () => {
    it('should get object', () => {
      const id = wme.addObject('a', 'p');
      expect(wme.getObject(id)?.name).toBe('a');
    });

    it('should get relation', () => {
      const a = wme.addObject('a', 'p');
      const b = wme.addObject('b', 'p');
      const rid = wme.addRelation(a, b, 'knows');
      expect(wme.getRelation(rid)?.fromId).toBe(a);
    });

    it('should get all objects', () => {
      wme.addObject('a', 'p');
      expect(wme.getAllObjects()).toHaveLength(1);
    });

    it('should get all relations', () => {
      const a = wme.addObject('a', 'p');
      const b = wme.addObject('b', 'p');
      wme.addRelation(a, b, 'knows');
      expect(wme.getAllRelations()).toHaveLength(1);
    });

    it('should check object existence', () => {
      const id = wme.addObject('a', 'p');
      expect(wme.hasObject(id)).toBe(true);
    });

    it('should check relation existence', () => {
      const a = wme.addObject('a', 'p');
      const b = wme.addObject('b', 'p');
      const rid = wme.addRelation(a, b, 'knows');
      expect(wme.hasRelation(rid)).toBe(true);
    });

    it('should count objects', () => {
      expect(wme.getObjectCount()).toBe(0);
      wme.addObject('a', 'p');
      expect(wme.getObjectCount()).toBe(1);
    });

    it('should count relations', () => {
      expect(wme.getRelationCount()).toBe(0);
    });
  });

  describe('accessors', () => {
    it('should get name', () => {
      const id = wme.addObject('a', 'p');
      expect(wme.getObjectName(id)).toBe('a');
    });

    it('should get type', () => {
      const id = wme.addObject('a', 'p');
      expect(wme.getObjectType(id)).toBe('p');
    });

    it('should get hits', () => {
      const id = wme.addObject('a', 'p');
      expect(wme.getHits(id)).toBe(0);
    });
  });

  describe('setters', () => {
    it('should set active object', () => {
      const id = wme.addObject('a', 'p');
      expect(wme.setActiveObject(id, false)).toBe(true);
    });

    it('should set active relation', () => {
      const a = wme.addObject('a', 'p');
      const b = wme.addObject('b', 'p');
      const rid = wme.addRelation(a, b, 'knows');
      expect(wme.setActiveRelation(rid, false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(wme.setActiveObject('unknown', false)).toBe(false);
      expect(wme.setActiveRelation('unknown', false)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = wme.addObject('a', 'p');
      wme.setActiveObject(id, false);
      wme.resetAll();
      expect(wme.isActive(id)).toBe(true);
    });
  });

  describe('by type / state', () => {
    it('should get by type', () => {
      wme.addObject('a', 'p');
      expect(wme.getByType('p')).toHaveLength(1);
    });

    it('should get relations by type', () => {
      const a = wme.addObject('a', 'p');
      const b = wme.addObject('b', 'p');
      wme.addRelation(a, b, 'knows');
      expect(wme.getRelationsByType('knows')).toHaveLength(1);
    });

    it('should get active objects', () => {
      wme.addObject('a', 'p');
      expect(wme.getActiveObjects()).toHaveLength(1);
    });

    it('should get inactive objects', () => {
      const id = wme.addObject('a', 'p');
      wme.setActiveObject(id, false);
      expect(wme.getInactiveObjects()).toHaveLength(1);
    });

    it('should get active relations', () => {
      const a = wme.addObject('a', 'p');
      const b = wme.addObject('b', 'p');
      wme.addRelation(a, b, 'knows');
      expect(wme.getActiveRelations()).toHaveLength(1);
    });

    it('should get inactive relations', () => {
      const a = wme.addObject('a', 'p');
      const b = wme.addObject('b', 'p');
      const rid = wme.addRelation(a, b, 'knows');
      wme.setActiveRelation(rid, false);
      expect(wme.getInactiveRelations()).toHaveLength(1);
    });

    it('should get all object names', () => {
      wme.addObject('a', 'p');
      wme.addObject('b', 'p');
      expect(wme.getAllObjectNames()).toHaveLength(2);
    });

    it('should get all object types', () => {
      wme.addObject('a', 'p');
      wme.addObject('b', 'q');
      expect(wme.getAllObjectTypes()).toHaveLength(2);
    });

    it('should get all relation types', () => {
      const a = wme.addObject('a', 'p');
      const b = wme.addObject('b', 'p');
      wme.addRelation(a, b, 'knows');
      expect(wme.getAllRelationTypes()).toHaveLength(1);
    });
  });

  describe('rankings', () => {
    it('should get newest object', () => {
      wme.addObject('a', 'p');
      expect(wme.getNewestObject()?.name).toBe('a');
    });

    it('should return null for empty newest', () => {
      expect(wme.getNewestObject()).toBeNull();
    });

    it('should get newest relation', () => {
      const a = wme.addObject('a', 'p');
      const b = wme.addObject('b', 'p');
      wme.addRelation(a, b, 'knows');
      expect(wme.getNewestRelation()?.type).toBe('knows');
    });

    it('should return null for empty newest relation', () => {
      expect(wme.getNewestRelation()).toBeNull();
    });
  });

  describe('totals', () => {
    it('should get total objects', () => {
      wme.addObject('a', 'p');
      expect(wme.getTotalObjects()).toBe(1);
    });

    it('should get total relations', () => {
      const a = wme.addObject('a', 'p');
      const b = wme.addObject('b', 'p');
      wme.addRelation(a, b, 'knows');
      expect(wme.getTotalRelations()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many objects', () => {
      for (let i = 0; i < 50; i++) {
        wme.addObject(`o${i}`, 'person');
      }
      expect(wme.getObjectCount()).toBe(50);
    });
  });
});