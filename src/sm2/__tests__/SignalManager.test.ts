/**
 * SignalManager Tests
 * thunderbolt-design Signal Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SignalManager } from '../SignalManager';

describe('SignalManager', () => {
  let sm: SignalManager;

  beforeEach(() => {
    sm = new SignalManager();
  });

  afterEach(() => {
    sm.clearAll();
  });

  // ============================================================
  // send / deliver
  // ============================================================
  describe('send / deliver', () => {
    it('should send', () => {
      expect(sm.send('s1', 'alice', 'bob')).toBe('sm2-1');
    });

    it('should mark as active', () => {
      const id = sm.send('s1', 'alice', 'bob');
      expect(sm.isActive(id)).toBe(true);
    });

    it('should mark as pending initially', () => {
      const id = sm.send('s1', 'alice', 'bob');
      expect(sm.isPending(id)).toBe(true);
    });

    it('should deliver', () => {
      const id = sm.send('s1', 'alice', 'bob');
      expect(sm.deliver(id)).toBe(true);
    });

    it('should mark as delivered', () => {
      const id = sm.send('s1', 'alice', 'bob');
      sm.deliver(id);
      expect(sm.isDelivered(id)).toBe(true);
    });

    it('should log history on deliver', () => {
      const id = sm.send('s1', 'alice', 'bob');
      sm.deliver(id);
      expect(sm.getHistory(id)).toEqual([true]);
    });

    it('should not deliver inactive', () => {
      const id = sm.send('s1', 'alice', 'bob');
      sm.setActive(id, false);
      expect(sm.deliver(id)).toBe(false);
    });

    it('should return false for unknown deliver', () => {
      expect(sm.deliver('unknown')).toBe(false);
    });

    it('should undeliver', () => {
      const id = sm.send('s1', 'alice', 'bob');
      sm.deliver(id);
      expect(sm.undeliver(id)).toBe(true);
    });

    it('should mark as not delivered on undeliver', () => {
      const id = sm.send('s1', 'alice', 'bob');
      sm.deliver(id);
      sm.undeliver(id);
      expect(sm.isDelivered(id)).toBe(false);
    });

    it('should not undeliver not delivered', () => {
      const id = sm.send('s1', 'alice', 'bob');
      expect(sm.undeliver(id)).toBe(false);
    });

    it('should return false for unknown undeliver', () => {
      expect(sm.undeliver('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      sm.send('s1', 'alice', 'bob');
      const stats = sm.getStats();
      expect(stats.signals).toBe(1);
    });

    it('should count delivered', () => {
      const id = sm.send('s1', 'alice', 'bob');
      sm.deliver(id);
      expect(sm.getStats().delivered).toBe(1);
    });

    it('should count pending', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getStats().pending).toBe(1);
    });

    it('should count active', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = sm.send('s1', 'alice', 'bob');
      sm.setActive(id, false);
      expect(sm.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = sm.send('s1', 'alice', 'bob');
      sm.deliver(id);
      expect(sm.getStats().totalHits).toBe(1);
    });

    it('should count unique names', () => {
      sm.send('s1', 'alice', 'bob');
      sm.send('s2', 'alice', 'bob');
      expect(sm.getStats().uniqueNames).toBe(2);
    });

    it('should count unique senders', () => {
      sm.send('s1', 'alice', 'bob');
      sm.send('s1', 'bob', 'alice');
      expect(sm.getStats().uniqueSenders).toBe(2);
    });

    it('should count unique receivers', () => {
      sm.send('s1', 'alice', 'bob');
      sm.send('s1', 'alice', 'charlie');
      expect(sm.getStats().uniqueReceivers).toBe(2);
    });

    it('should compute deliver rate', () => {
      const id = sm.send('s1', 'alice', 'bob');
      sm.deliver(id);
      expect(sm.getStats().deliverRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get signal', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getSignal('sm2-1')?.name).toBe('s1');
    });

    it('should get all', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getAllSignals()).toHaveLength(1);
    });

    it('should remove', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.removeSignal('sm2-1')).toBe(true);
    });

    it('should check existence', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.hasSignal('sm2-1')).toBe(true);
    });

    it('should count', () => {
      expect(sm.getCount()).toBe(0);
      sm.send('s1', 'alice', 'bob');
      expect(sm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get name', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getName('sm2-1')).toBe('s1');
    });

    it('should get sender', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getSender('sm2-1')).toBe('alice');
    });

    it('should get receiver', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getReceiver('sm2-1')).toBe('bob');
    });

    it('should get history', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getHistory('sm2-1')).toEqual([]);
    });

    it('should get hits', () => {
      const id = sm.send('s1', 'alice', 'bob');
      sm.deliver(id);
      expect(sm.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.setActive('sm2-1', false)).toBe(true);
    });

    it('should set name', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.setName('sm2-1', 's2')).toBe(true);
    });

    it('should set sender', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.setSender('sm2-1', 'charlie')).toBe(true);
    });

    it('should set receiver', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.setReceiver('sm2-1', 'charlie')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(sm.setActive('unknown', false)).toBe(false);
      expect(sm.setName('unknown', 's')).toBe(false);
      expect(sm.setSender('unknown', 'a')).toBe(false);
      expect(sm.setReceiver('unknown', 'b')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = sm.send('s1', 'alice', 'bob');
      sm.deliver(id);
      sm.setActive(id, false);
      sm.resetAll();
      expect(sm.isDelivered(id)).toBe(false);
      expect(sm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by name / sender / receiver
  // ============================================================
  describe('by name / sender / receiver', () => {
    it('should get by name', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getByName('s1')).toHaveLength(1);
    });

    it('should get by sender', () => {
      sm.send('s1', 'alice', 'bob');
      sm.send('s2', 'alice', 'charlie');
      expect(sm.getBySender('alice')).toHaveLength(2);
    });

    it('should get by receiver', () => {
      sm.send('s1', 'alice', 'bob');
      sm.send('s2', 'charlie', 'bob');
      expect(sm.getByReceiver('bob')).toHaveLength(2);
    });

    it('should get delivered', () => {
      const id = sm.send('s1', 'alice', 'bob');
      sm.deliver(id);
      expect(sm.getDeliveredSignals()).toHaveLength(1);
    });

    it('should get pending', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getPendingSignals()).toHaveLength(1);
    });

    it('should get active', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getActiveSignals()).toHaveLength(1);
    });

    it('should get inactive', () => {
      sm.send('s1', 'alice', 'bob');
      sm.setActive('sm2-1', false);
      expect(sm.getInactiveSignals()).toHaveLength(1);
    });

    it('should get all names', () => {
      sm.send('s1', 'alice', 'bob');
      sm.send('s2', 'alice', 'bob');
      expect(sm.getAllNames()).toHaveLength(2);
    });

    it('should get name count', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getNameCount()).toBe(1);
    });

    it('should get all senders', () => {
      sm.send('s1', 'alice', 'bob');
      sm.send('s1', 'charlie', 'alice');
      expect(sm.getAllSenders()).toHaveLength(2);
    });

    it('should get sender count', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getSenderCount()).toBe(1);
    });

    it('should get all receivers', () => {
      sm.send('s1', 'alice', 'bob');
      sm.send('s1', 'alice', 'charlie');
      expect(sm.getAllReceivers()).toHaveLength(2);
    });

    it('should get receiver count', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getReceiverCount()).toBe(1);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getNewest()?.id).toBe('sm2-1');
    });

    it('should return null for empty newest', () => {
      expect(sm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getOldest()?.id).toBe('sm2-1');
    });

    it('should return null for empty oldest', () => {
      expect(sm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      sm.send('s1', 'alice', 'bob');
      expect(sm.getCreatedAt('sm2-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = sm.send('s1', 'alice', 'bob');
      sm.deliver(id);
      expect(sm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many signals', () => {
      for (let i = 0; i < 50; i++) {
        sm.send(`s${i}`, 'alice', 'bob');
      }
      expect(sm.getCount()).toBe(50);
    });
  });
});