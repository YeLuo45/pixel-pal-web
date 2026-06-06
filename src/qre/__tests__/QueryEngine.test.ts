/**
 * QueryEngine Tests
 * generic-agent-design Query Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { QueryEngine } from '../QueryEngine';

describe('QueryEngine', () => {
  let qre: QueryEngine;

  beforeEach(() => {
    qre = new QueryEngine();
  });

  afterEach(() => {
    qre.clearAll();
  });

  // ============================================================
  // register / execute / reset / remove
  // ============================================================
  describe('register / execute / reset / remove', () => {
    it('should register', () => {
      expect(qre.register('select', 'users')).toBe('qre-1');
    });

    it('should mark as active', () => {
      const id = qre.register('select', 'users');
      expect(qre.isActive(id)).toBe(true);
    });

    it('should mark as pending', () => {
      const id = qre.register('select', 'users');
      expect(qre.isPending(id)).toBe(true);
    });

    it('should mark as select', () => {
      const id = qre.register('select', 'users');
      expect(qre.isSelect(id)).toBe(true);
    });

    it('should mark as insert', () => {
      const id = qre.register('insert', 'users');
      expect(qre.isInsert(id)).toBe(true);
    });

    it('should mark as update', () => {
      const id = qre.register('update', 'users');
      expect(qre.isUpdate(id)).toBe(true);
    });

    it('should mark as delete', () => {
      const id = qre.register('delete', 'users');
      expect(qre.isDelete(id)).toBe(true);
    });

    it('should execute', () => {
      const id = qre.register('select', 'users');
      expect(qre.execute(id, 5)).toBe(true);
    });

    it('should mark as executed on execute', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      expect(qre.isExecuted(id)).toBe(true);
    });

    it('should set result count on execute', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      expect(qre.getResultCount(id)).toBe(5);
    });

    it('should not execute inactive', () => {
      const id = qre.register('select', 'users');
      qre.setActive(id, false);
      expect(qre.execute(id, 5)).toBe(false);
    });

    it('should return false for unknown execute', () => {
      expect(qre.execute('unknown', 5)).toBe(false);
    });

    it('should reset', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      expect(qre.reset(id)).toBe(true);
    });

    it('should mark as pending on reset', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      qre.reset(id);
      expect(qre.isPending(id)).toBe(true);
    });

    it('should return false for unknown reset', () => {
      expect(qre.reset('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = qre.register('select', 'users');
      expect(qre.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      qre.register('select', 'users');
      const stats = qre.getStats();
      expect(stats.queries).toBe(1);
    });

    it('should count executed', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      expect(qre.getStats().executed).toBe(1);
    });

    it('should count pending', () => {
      qre.register('select', 'users');
      expect(qre.getStats().pending).toBe(1);
    });

    it('should count total executions', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      expect(qre.getStats().totalExecutions).toBe(1);
    });

    it('should count total result count', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      expect(qre.getStats().totalResultCount).toBe(5);
    });

    it('should count active', () => {
      qre.register('select', 'users');
      expect(qre.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = qre.register('select', 'users');
      qre.setActive(id, false);
      expect(qre.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      expect(qre.getStats().totalHits).toBe(1);
    });

    it('should count unique tables', () => {
      qre.register('select', 'users');
      qre.register('select', 'orders');
      expect(qre.getStats().uniqueTables).toBe(2);
    });

    it('should compute avg result count', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      expect(qre.getStats().avgResultCount).toBe(5);
    });

    it('should get max result count', () => {
      const id1 = qre.register('select', 'a');
      const id2 = qre.register('select', 'b');
      qre.execute(id1, 5);
      qre.execute(id2, 10);
      expect(qre.getStats().maxResultCount).toBe(10);
    });

    it('should get min result count', () => {
      const id1 = qre.register('select', 'a');
      const id2 = qre.register('select', 'b');
      qre.execute(id1, 5);
      qre.execute(id2, 10);
      expect(qre.getStats().minResultCount).toBe(5);
    });

    it('should count select', () => {
      qre.register('select', 'users');
      expect(qre.getStats().selectCount).toBe(1);
    });

    it('should count insert', () => {
      qre.register('insert', 'users');
      expect(qre.getStats().insertCount).toBe(1);
    });

    it('should count update', () => {
      qre.register('update', 'users');
      expect(qre.getStats().updateCount).toBe(1);
    });

    it('should count delete', () => {
      qre.register('delete', 'users');
      expect(qre.getStats().deleteCount).toBe(1);
    });

    it('should compute execution rate', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      expect(qre.getStats().executionRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get query', () => {
      qre.register('select', 'users');
      expect(qre.getQuery('qre-1')?.table).toBe('users');
    });

    it('should get all', () => {
      qre.register('select', 'users');
      expect(qre.getAllQueries()).toHaveLength(1);
    });

    it('should check existence', () => {
      qre.register('select', 'users');
      expect(qre.hasQuery('qre-1')).toBe(true);
    });

    it('should count', () => {
      expect(qre.getCount()).toBe(0);
      qre.register('select', 'users');
      expect(qre.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get table', () => {
      qre.register('select', 'users');
      expect(qre.getTable('qre-1')).toBe('users');
    });

    it('should get conditions', () => {
      qre.register('select', 'users', 'id=1');
      expect(qre.getConditions('qre-1')).toBe('id=1');
    });

    it('should get history', () => {
      qre.register('select', 'users');
      expect(qre.getHistory('qre-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      expect(qre.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      qre.register('select', 'users');
      expect(qre.setActive('qre-1', false)).toBe(true);
    });

    it('should set conditions', () => {
      qre.register('select', 'users');
      expect(qre.setConditions('qre-1', 'id=1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(qre.setActive('unknown', false)).toBe(false);
      expect(qre.setConditions('unknown', 'c')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      qre.setActive(id, false);
      qre.resetAll();
      expect(qre.isPending(id)).toBe(true);
      expect(qre.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by type / table / state
  // ============================================================
  describe('by type / table / state', () => {
    it('should get by type', () => {
      qre.register('select', 'users');
      expect(qre.getByType('select')).toHaveLength(1);
    });

    it('should get by table', () => {
      qre.register('select', 'users');
      expect(qre.getByTable('users')).toHaveLength(1);
    });

    it('should get executed', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      expect(qre.getExecutedQueries()).toHaveLength(1);
    });

    it('should get pending', () => {
      qre.register('select', 'users');
      expect(qre.getPendingQueries()).toHaveLength(1);
    });

    it('should get active', () => {
      qre.register('select', 'users');
      expect(qre.getActiveQueries()).toHaveLength(1);
    });

    it('should get inactive', () => {
      qre.register('select', 'users');
      qre.setActive('qre-1', false);
      expect(qre.getInactiveQueries()).toHaveLength(1);
    });

    it('should get all tables', () => {
      qre.register('select', 'users');
      qre.register('select', 'orders');
      expect(qre.getAllTables()).toHaveLength(2);
    });

    it('should get table count', () => {
      qre.register('select', 'users');
      expect(qre.getTableCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      qre.register('select', 'users');
      expect(qre.getNewest()?.id).toBe('qre-1');
    });

    it('should return null for empty newest', () => {
      expect(qre.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      qre.register('select', 'users');
      expect(qre.getOldest()?.id).toBe('qre-1');
    });

    it('should return null for empty oldest', () => {
      expect(qre.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      qre.register('select', 'users');
      expect(qre.getCreatedAt('qre-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      expect(qre.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total executions', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      expect(qre.getTotalExecutions()).toBe(1);
    });

    it('should get total result count', () => {
      const id = qre.register('select', 'users');
      qre.execute(id, 5);
      expect(qre.getTotalResultCount()).toBe(5);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many queries', () => {
      for (let i = 0; i < 50; i++) {
        qre.register('select', `t${i}`);
      }
      expect(qre.getCount()).toBe(50);
    });
  });
});