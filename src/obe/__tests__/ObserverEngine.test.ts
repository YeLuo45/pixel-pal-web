/**
 * ObserverEngine Tests
 * generic-agent-design Observer Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ObserverEngine } from '../ObserverEngine';

describe('ObserverEngine', () => {
  let obe: ObserverEngine;

  beforeEach(() => {
    obe = new ObserverEngine();
  });

  afterEach(() => {
    obe.clearAll();
  });

  describe('watch / notify / unsubscribe / remove', () => {
    it('should watch', () => {
      expect(obe.watch('t1', 'create', 'data')).toMatch(/^obe-/);
    });

    it('should mark as active', () => {
      obe.watch('t1', 'create', 'data');
      expect(obe.isActive(obe.getAllObservations()[0].id)).toBe(true);
    });

    it('should notify', () => {
      const id = obe.watch('t1', 'create', 'data');
      expect(obe.notify(id)).toBe(true);
    });

    it('should not notify inactive', () => {
      const id = obe.watch('t1', 'create', 'data');
      obe.setActive(id, false);
      expect(obe.notify(id)).toBe(false);
    });

    it('should return false for unknown notify', () => {
      expect(obe.notify('unknown')).toBe(false);
    });

    it('should unsubscribe', () => {
      const id = obe.watch('t1', 'create', 'data');
      expect(obe.unsubscribe(id)).toBe(true);
    });

    it('should mark as inactive after unsubscribe', () => {
      const id = obe.watch('t1', 'create', 'data');
      obe.unsubscribe(id);
      expect(obe.isActive(id)).toBe(false);
    });

    it('should return false for unknown unsubscribe', () => {
      expect(obe.unsubscribe('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = obe.watch('t1', 'create', 'data');
      expect(obe.remove(id)).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      obe.watch('t1', 'create', 'data');
      expect(obe.getStats().observations).toBe(1);
    });

    it('should count total watched', () => {
      obe.watch('t1', 'create', 'data');
      expect(obe.getStats().totalWatched).toBe(1);
    });

    it('should count total notified', () => {
      const id = obe.watch('t1', 'create', 'data');
      obe.notify(id);
      expect(obe.getStats().totalNotified).toBe(1);
    });

    it('should count total unsubscribed', () => {
      const id = obe.watch('t1', 'create', 'data');
      obe.unsubscribe(id);
      expect(obe.getStats().totalUnsubscribed).toBe(1);
    });

    it('should count create', () => {
      obe.watch('t1', 'create', 'data');
      expect(obe.getStats().create).toBe(1);
    });

    it('should count update', () => {
      obe.watch('t1', 'update', 'data');
      expect(obe.getStats().update).toBe(1);
    });

    it('should count delete', () => {
      obe.watch('t1', 'delete', 'data');
      expect(obe.getStats().delete).toBe(1);
    });

    it('should count read', () => {
      obe.watch('t1', 'read', 'data');
      expect(obe.getStats().read).toBe(1);
    });

    it('should count active', () => {
      obe.watch('t1', 'create', 'data');
      expect(obe.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = obe.watch('t1', 'create', 'data');
      obe.setActive(id, false);
      expect(obe.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = obe.watch('t1', 'create', 'data');
      obe.notify(id);
      expect(obe.getStats().totalHits).toBe(1);
    });

    it('should count unique targets', () => {
      obe.watch('a', 'create', 'd');
      obe.watch('a', 'create', 'd');
      expect(obe.getStats().uniqueTargets).toBe(1);
    });

    it('should count total data len', () => {
      obe.watch('t1', 'create', 'hi');
      expect(obe.getStats().totalDataLen).toBe(2);
    });
  });

  describe('queries', () => {
    it('should get observation', () => {
      const id = obe.watch('t1', 'create', 'data');
      expect(obe.getObservation(id)?.target).toBe('t1');
    });

    it('should get all', () => {
      obe.watch('t1', 'create', 'data');
      expect(obe.getAllObservations()).toHaveLength(1);
    });

    it('should check existence', () => {
      const id = obe.watch('t1', 'create', 'data');
      expect(obe.hasObservation(id)).toBe(true);
    });

    it('should count', () => {
      expect(obe.getCount()).toBe(0);
      obe.watch('t1', 'create', 'data');
      expect(obe.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get target', () => {
      const id = obe.watch('t1', 'create', 'data');
      expect(obe.getTarget(id)).toBe('t1');
    });

    it('should get data', () => {
      const id = obe.watch('t1', 'create', 'data');
      expect(obe.getData(id)).toBe('data');
    });

    it('should get hits', () => {
      const id = obe.watch('t1', 'create', 'data');
      obe.notify(id);
      expect(obe.getHits(id)).toBe(1);
    });

    it('should check create', () => {
      obe.watch('t1', 'create', 'data');
      expect(obe.isCreate(obe.getAllObservations()[0].id)).toBe(true);
    });

    it('should check update', () => {
      obe.watch('t1', 'update', 'data');
      expect(obe.isUpdate(obe.getAllObservations()[0].id)).toBe(true);
    });

    it('should check delete', () => {
      obe.watch('t1', 'delete', 'data');
      expect(obe.isDelete(obe.getAllObservations()[0].id)).toBe(true);
    });

    it('should check read', () => {
      obe.watch('t1', 'read', 'data');
      expect(obe.isRead(obe.getAllObservations()[0].id)).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      const id = obe.watch('t1', 'create', 'data');
      expect(obe.setActive(id, false)).toBe(true);
    });

    it('should set target', () => {
      const id = obe.watch('t1', 'create', 'data');
      expect(obe.setTarget(id, 't2')).toBe(true);
    });

    it('should set data', () => {
      const id = obe.watch('t1', 'create', 'data');
      expect(obe.setData(id, 'new')).toBe(true);
    });

    it('should set event', () => {
      const id = obe.watch('t1', 'create', 'data');
      expect(obe.setEvent(id, 'update')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(obe.setActive('unknown', false)).toBe(false);
      expect(obe.setTarget('unknown', 't')).toBe(false);
      expect(obe.setData('unknown', 'd')).toBe(false);
      expect(obe.setEvent('unknown', 'create')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      const id = obe.watch('t1', 'create', 'data');
      obe.unsubscribe(id);
      obe.resetAll();
      expect(obe.isActive(id)).toBe(true);
    });
  });

  describe('by event / state', () => {
    it('should get by event', () => {
      obe.watch('t1', 'create', 'data');
      expect(obe.getByEvent('create')).toHaveLength(1);
    });

    it('should get by target', () => {
      obe.watch('t1', 'create', 'data');
      expect(obe.getByTarget('t1')).toHaveLength(1);
    });

    it('should get active', () => {
      obe.watch('t1', 'create', 'data');
      expect(obe.getActiveObservations()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = obe.watch('t1', 'create', 'data');
      obe.setActive(id, false);
      expect(obe.getInactiveObservations()).toHaveLength(1);
    });

    it('should get all targets', () => {
      obe.watch('a', 'create', 'd');
      obe.watch('b', 'create', 'd');
      expect(obe.getAllTargets()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      obe.watch('t1', 'create', 'data');
      expect(obe.getNewest()?.target).toBe('t1');
    });

    it('should return null for empty newest', () => {
      expect(obe.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      obe.watch('t1', 'create', 'data');
      expect(obe.getOldest()?.target).toBe('t1');
    });

    it('should return null for empty oldest', () => {
      expect(obe.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      const id = obe.watch('t1', 'create', 'data');
      expect(obe.getCreatedAt(id)).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = obe.watch('t1', 'create', 'data');
      obe.notify(id);
      expect(obe.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total watched', () => {
      obe.watch('t1', 'create', 'data');
      expect(obe.getTotalWatched()).toBe(1);
    });

    it('should get total notified', () => {
      const id = obe.watch('t1', 'create', 'data');
      obe.notify(id);
      expect(obe.getTotalNotified()).toBe(1);
    });

    it('should get total unsubscribed', () => {
      const id = obe.watch('t1', 'create', 'data');
      obe.unsubscribe(id);
      expect(obe.getTotalUnsubscribed()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle many observations', () => {
      for (let i = 0; i < 50; i++) {
        obe.watch(`t${i}`, 'create', 'data');
      }
      expect(obe.getCount()).toBe(50);
    });
  });
});