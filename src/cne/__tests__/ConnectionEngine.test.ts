/**
 * ConnectionEngine Tests
 * nanobot-design Connection Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConnectionEngine } from '../ConnectionEngine';

describe('ConnectionEngine', () => {
  let cne: ConnectionEngine;

  beforeEach(() => {
    cne = new ConnectionEngine();
  });

  afterEach(() => {
    cne.clearAll();
  });

  describe('connect / send / close / halfOpen / remove', () => {
    it('should connect', () => {
      expect(cne.connect('a', 'b')).toBe('cne-1');
    });

    it('should default status to open', () => {
      cne.connect('a', 'b');
      expect(cne.getStatus('cne-1')).toBe('open');
    });

    it('should mark as active', () => {
      cne.connect('a', 'b');
      expect(cne.isActive('cne-1')).toBe(true);
    });

    it('should send', () => {
      cne.connect('a', 'b');
      expect(cne.send('cne-1', 100)).toBe(true);
    });

    it('should increment bytes on send', () => {
      cne.connect('a', 'b');
      cne.send('cne-1', 100);
      expect(cne.getBytes('cne-1')).toBe(100);
    });

    it('should not send to closed', () => {
      cne.connect('a', 'b');
      cne.close('cne-1');
      expect(cne.send('cne-1', 100)).toBe(false);
    });

    it('should not send to inactive', () => {
      cne.connect('a', 'b');
      cne.setActive('cne-1', false);
      expect(cne.send('cne-1', 100)).toBe(false);
    });

    it('should return false for unknown send', () => {
      expect(cne.send('unknown', 100)).toBe(false);
    });

    it('should close', () => {
      cne.connect('a', 'b');
      expect(cne.close('cne-1')).toBe(true);
    });

    it('should return false for unknown close', () => {
      expect(cne.close('unknown')).toBe(false);
    });

    it('should half open', () => {
      cne.connect('a', 'b');
      expect(cne.halfOpen('cne-1')).toBe(true);
    });

    it('should return false for unknown halfOpen', () => {
      expect(cne.halfOpen('unknown')).toBe(false);
    });

    it('should remove', () => {
      cne.connect('a', 'b');
      expect(cne.remove('cne-1')).toBe(true);
    });
  });

  describe('getStats', () => {
    it('should get stats', () => {
      cne.connect('a', 'b');
      expect(cne.getStats().connections).toBe(1);
    });

    it('should count total opened', () => {
      cne.connect('a', 'b');
      expect(cne.getStats().totalOpened).toBe(1);
    });

    it('should count total closed', () => {
      cne.connect('a', 'b');
      cne.close('cne-1');
      expect(cne.getStats().totalClosed).toBe(1);
    });

    it('should count total bytes', () => {
      cne.connect('a', 'b');
      cne.send('cne-1', 100);
      expect(cne.getStats().totalBytes).toBe(100);
    });

    it('should count open', () => {
      cne.connect('a', 'b');
      expect(cne.getStats().open).toBe(1);
    });

    it('should count closed', () => {
      cne.connect('a', 'b');
      cne.close('cne-1');
      expect(cne.getStats().closed).toBe(1);
    });

    it('should count half open', () => {
      cne.connect('a', 'b');
      cne.halfOpen('cne-1');
      expect(cne.getStats().halfOpen).toBe(1);
    });

    it('should count active', () => {
      cne.connect('a', 'b');
      expect(cne.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      cne.connect('a', 'b');
      cne.setActive('cne-1', false);
      expect(cne.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      cne.connect('a', 'b');
      cne.send('cne-1', 100);
      expect(cne.getStats().totalHits).toBe(1);
    });

    it('should count unique froms', () => {
      cne.connect('a', 'b');
      cne.connect('a', 'c');
      expect(cne.getStats().uniqueFroms).toBe(1);
    });

    it('should count unique tos', () => {
      cne.connect('a', 'b');
      cne.connect('c', 'b');
      expect(cne.getStats().uniqueTos).toBe(1);
    });

    it('should compute avg bytes', () => {
      cne.connect('a', 'b');
      cne.send('cne-1', 100);
      expect(cne.getStats().avgBytes).toBe(100);
    });

    it('should get max bytes', () => {
      cne.connect('a', 'b');
      cne.send('cne-1', 100);
      expect(cne.getStats().maxBytes).toBe(100);
    });

    it('should get min bytes', () => {
      cne.connect('a', 'b');
      expect(cne.getStats().minBytes).toBe(0);
    });
  });

  describe('queries', () => {
    it('should get connection', () => {
      cne.connect('a', 'b');
      expect(cne.getConnection('cne-1')?.from).toBe('a');
    });

    it('should get all', () => {
      cne.connect('a', 'b');
      expect(cne.getAllConnections()).toHaveLength(1);
    });

    it('should check existence', () => {
      cne.connect('a', 'b');
      expect(cne.hasConnection('cne-1')).toBe(true);
    });

    it('should count', () => {
      expect(cne.getCount()).toBe(0);
      cne.connect('a', 'b');
      expect(cne.getCount()).toBe(1);
    });
  });

  describe('accessors', () => {
    it('should get from', () => {
      cne.connect('a', 'b');
      expect(cne.getFrom('cne-1')).toBe('a');
    });

    it('should get to', () => {
      cne.connect('a', 'b');
      expect(cne.getTo('cne-1')).toBe('b');
    });

    it('should get hits', () => {
      cne.connect('a', 'b');
      cne.send('cne-1', 100);
      expect(cne.getHits('cne-1')).toBe(1);
    });

    it('should check open', () => {
      cne.connect('a', 'b');
      expect(cne.isOpen('cne-1')).toBe(true);
    });

    it('should check closed', () => {
      cne.connect('a', 'b');
      cne.close('cne-1');
      expect(cne.isClosed('cne-1')).toBe(true);
    });

    it('should check half open', () => {
      cne.connect('a', 'b');
      cne.halfOpen('cne-1');
      expect(cne.isHalfOpen('cne-1')).toBe(true);
    });
  });

  describe('setters', () => {
    it('should set active', () => {
      cne.connect('a', 'b');
      expect(cne.setActive('cne-1', false)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(cne.setActive('unknown', false)).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all', () => {
      cne.connect('a', 'b');
      cne.send('cne-1', 100);
      cne.close('cne-1');
      cne.setActive('cne-1', false);
      cne.resetAll();
      expect(cne.getStatus('cne-1')).toBe('open');
      expect(cne.getBytes('cne-1')).toBe(0);
    });
  });

  describe('by status / from / to / state', () => {
    it('should get by status', () => {
      cne.connect('a', 'b');
      expect(cne.getByStatus('open')).toHaveLength(1);
    });

    it('should get by from', () => {
      cne.connect('a', 'b');
      expect(cne.getByFrom('a')).toHaveLength(1);
    });

    it('should get by to', () => {
      cne.connect('a', 'b');
      expect(cne.getByTo('b')).toHaveLength(1);
    });

    it('should get active', () => {
      cne.connect('a', 'b');
      expect(cne.getActiveConnections()).toHaveLength(1);
    });

    it('should get inactive', () => {
      cne.connect('a', 'b');
      cne.setActive('cne-1', false);
      expect(cne.getInactiveConnections()).toHaveLength(1);
    });

    it('should get all froms', () => {
      cne.connect('a', 'b');
      cne.connect('c', 'd');
      expect(cne.getAllFroms()).toHaveLength(2);
    });

    it('should get all tos', () => {
      cne.connect('a', 'b');
      cne.connect('c', 'd');
      expect(cne.getAllTos()).toHaveLength(2);
    });
  });

  describe('rankings', () => {
    it('should get newest', () => {
      cne.connect('a', 'b');
      expect(cne.getNewest()?.id).toBe('cne-1');
    });

    it('should return null for empty newest', () => {
      expect(cne.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      cne.connect('a', 'b');
      expect(cne.getOldest()?.id).toBe('cne-1');
    });

    it('should return null for empty oldest', () => {
      expect(cne.getOldest()).toBeNull();
    });
  });

  describe('timestamps', () => {
    it('should get created at', () => {
      cne.connect('a', 'b');
      expect(cne.getCreatedAt('cne-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      cne.connect('a', 'b');
      cne.send('cne-1', 100);
      expect(cne.getUpdatedAt('cne-1')).toBeGreaterThan(0);
    });
  });

  describe('totals', () => {
    it('should get total opened', () => {
      cne.connect('a', 'b');
      expect(cne.getTotalOpened()).toBe(1);
    });

    it('should get total closed', () => {
      cne.connect('a', 'b');
      cne.close('cne-1');
      expect(cne.getTotalClosed()).toBe(1);
    });

    it('should get total bytes', () => {
      cne.connect('a', 'b');
      cne.send('cne-1', 100);
      expect(cne.getTotalBytes()).toBe(100);
    });
  });

  describe('edge cases', () => {
    it('should handle many connections', () => {
      for (let i = 0; i < 50; i++) {
        cne.connect(`a${i}`, `b${i}`);
      }
      expect(cne.getCount()).toBe(50);
    });
  });
});