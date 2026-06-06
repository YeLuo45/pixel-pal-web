/**
 * NotificationEngine Tests
 * chatdev-design Notification Engine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NotificationEngine } from '../NotificationEngine';

describe('NotificationEngine', () => {
  let nte: NotificationEngine;

  beforeEach(() => {
    nte = new NotificationEngine();
  });

  afterEach(() => {
    nte.clearAll();
  });

  // ============================================================
  // send / read / dismiss / remove
  // ============================================================
  describe('send / read / dismiss / remove', () => {
    it('should send', () => {
      expect(nte.send('info', 'alice', 'hello')).toBe('nte-1');
    });

    it('should default read to false', () => {
      const id = nte.send('info', 'alice', 'hello');
      expect(nte.isRead(id)).toBe(false);
    });

    it('should default dismissed to false', () => {
      const id = nte.send('info', 'alice', 'hello');
      expect(nte.isDismissed(id)).toBe(false);
    });

    it('should mark as active', () => {
      const id = nte.send('info', 'alice', 'hello');
      expect(nte.isActive(id)).toBe(true);
    });

    it('should read', () => {
      const id = nte.send('info', 'alice', 'hello');
      expect(nte.read(id)).toBe(true);
    });

    it('should not double read', () => {
      const id = nte.send('info', 'alice', 'hello');
      nte.read(id);
      expect(nte.read(id)).toBe(false);
    });

    it('should return false for unknown read', () => {
      expect(nte.read('unknown')).toBe(false);
    });

    it('should dismiss', () => {
      const id = nte.send('info', 'alice', 'hello');
      expect(nte.dismiss(id)).toBe(true);
    });

    it('should return false for unknown dismiss', () => {
      expect(nte.dismiss('unknown')).toBe(false);
    });

    it('should remove', () => {
      const id = nte.send('info', 'alice', 'hello');
      expect(nte.remove(id)).toBe(true);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      nte.send('info', 'alice', 'hello');
      const stats = nte.getStats();
      expect(stats.notifications).toBe(1);
    });

    it('should count total sent', () => {
      nte.send('info', 'alice', 'hello');
      expect(nte.getStats().totalSent).toBe(1);
    });

    it('should count total read', () => {
      const id = nte.send('info', 'alice', 'hello');
      nte.read(id);
      expect(nte.getStats().totalRead).toBe(1);
    });

    it('should count total dismissed', () => {
      const id = nte.send('info', 'alice', 'hello');
      nte.dismiss(id);
      expect(nte.getStats().totalDismissed).toBe(1);
    });

    it('should count active', () => {
      nte.send('info', 'alice', 'hello');
      expect(nte.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = nte.send('info', 'alice', 'hello');
      nte.setActive(id, false);
      expect(nte.getStats().inactive).toBe(1);
    });

    it('should count total hits', () => {
      const id = nte.send('info', 'alice', 'hello');
      nte.read(id);
      expect(nte.getStats().totalHits).toBe(1);
    });

    it('should count unique recipients', () => {
      nte.send('info', 'alice', 'a');
      nte.send('info', 'bob', 'b');
      expect(nte.getStats().uniqueRecipients).toBe(2);
    });

    it('should count alert', () => {
      nte.send('alert', 'a', 'm');
      expect(nte.getStats().alert).toBe(1);
    });

    it('should count info', () => {
      nte.send('info', 'a', 'm');
      expect(nte.getStats().info).toBe(1);
    });

    it('should count reminder', () => {
      nte.send('reminder', 'a', 'm');
      expect(nte.getStats().reminder).toBe(1);
    });

    it('should count system', () => {
      nte.send('system', 'a', 'm');
      expect(nte.getStats().system).toBe(1);
    });

    it('should count read', () => {
      const id = nte.send('info', 'a', 'm');
      nte.read(id);
      expect(nte.getStats().read).toBe(1);
    });

    it('should count unread', () => {
      nte.send('info', 'a', 'm');
      expect(nte.getStats().unread).toBe(1);
    });

    it('should count dismissed', () => {
      const id = nte.send('info', 'a', 'm');
      nte.dismiss(id);
      expect(nte.getStats().dismissed).toBe(1);
    });

    it('should count pending', () => {
      nte.send('info', 'a', 'm');
      expect(nte.getStats().pending).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get notification', () => {
      nte.send('info', 'a', 'm');
      expect(nte.getNotification('nte-1')?.message).toBe('m');
    });

    it('should get all', () => {
      nte.send('info', 'a', 'm');
      expect(nte.getAllNotifications()).toHaveLength(1);
    });

    it('should check existence', () => {
      nte.send('info', 'a', 'm');
      expect(nte.hasNotification('nte-1')).toBe(true);
    });

    it('should count', () => {
      expect(nte.getCount()).toBe(0);
      nte.send('info', 'a', 'm');
      expect(nte.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get type', () => {
      nte.send('alert', 'a', 'm');
      expect(nte.getType('nte-1')).toBe('alert');
    });

    it('should get recipient', () => {
      nte.send('info', 'a', 'm');
      expect(nte.getRecipient('nte-1')).toBe('a');
    });

    it('should get message', () => {
      nte.send('info', 'a', 'm');
      expect(nte.getMessage('nte-1')).toBe('m');
    });

    it('should get hits', () => {
      const id = nte.send('info', 'a', 'm');
      nte.read(id);
      expect(nte.getHits(id)).toBe(1);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      nte.send('info', 'a', 'm');
      expect(nte.setActive('nte-1', false)).toBe(true);
    });

    it('should set message', () => {
      nte.send('info', 'a', 'm');
      expect(nte.setMessage('nte-1', 'new')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(nte.setActive('unknown', false)).toBe(false);
      expect(nte.setMessage('unknown', 'm')).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = nte.send('info', 'a', 'm');
      nte.read(id);
      nte.dismiss(id);
      nte.setActive(id, false);
      nte.resetAll();
      expect(nte.isRead(id)).toBe(false);
      expect(nte.isDismissed(id)).toBe(false);
    });
  });

  // ============================================================
  // by type / recipient / state
  // ============================================================
  describe('by type / recipient / state', () => {
    it('should get by type', () => {
      nte.send('alert', 'a', 'm');
      expect(nte.getByType('alert')).toHaveLength(1);
    });

    it('should get by recipient', () => {
      nte.send('info', 'alice', 'm');
      expect(nte.getByRecipient('alice')).toHaveLength(1);
    });

    it('should get read', () => {
      const id = nte.send('info', 'a', 'm');
      nte.read(id);
      expect(nte.getReadNotifications()).toHaveLength(1);
    });

    it('should get unread', () => {
      nte.send('info', 'a', 'm');
      expect(nte.getUnreadNotifications()).toHaveLength(1);
    });

    it('should get dismissed', () => {
      const id = nte.send('info', 'a', 'm');
      nte.dismiss(id);
      expect(nte.getDismissedNotifications()).toHaveLength(1);
    });

    it('should get active', () => {
      nte.send('info', 'a', 'm');
      expect(nte.getActiveNotifications()).toHaveLength(1);
    });

    it('should get inactive', () => {
      nte.send('info', 'a', 'm');
      nte.setActive('nte-1', false);
      expect(nte.getInactiveNotifications()).toHaveLength(1);
    });

    it('should get all recipients', () => {
      nte.send('info', 'alice', 'a');
      nte.send('info', 'bob', 'b');
      expect(nte.getAllRecipients()).toHaveLength(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      nte.send('info', 'a', 'm');
      expect(nte.getNewest()?.id).toBe('nte-1');
    });

    it('should return null for empty newest', () => {
      expect(nte.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      nte.send('info', 'a', 'm');
      expect(nte.getOldest()?.id).toBe('nte-1');
    });

    it('should return null for empty oldest', () => {
      expect(nte.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      nte.send('info', 'a', 'm');
      expect(nte.getCreatedAt('nte-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = nte.send('info', 'a', 'm');
      nte.read(id);
      expect(nte.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // totals
  // ============================================================
  describe('totals', () => {
    it('should get total sent', () => {
      nte.send('info', 'a', 'm');
      expect(nte.getTotalSent()).toBe(1);
    });

    it('should get total read', () => {
      const id = nte.send('info', 'a', 'm');
      nte.read(id);
      expect(nte.getTotalRead()).toBe(1);
    });

    it('should get total dismissed', () => {
      const id = nte.send('info', 'a', 'm');
      nte.dismiss(id);
      expect(nte.getTotalDismissed()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many notifications', () => {
      for (let i = 0; i < 50; i++) {
        nte.send('info', `u${i}`, `m${i}`);
      }
      expect(nte.getCount()).toBe(50);
    });
  });
});