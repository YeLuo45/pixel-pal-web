/**
 * NotificationManager Tests
 * chatdev-design Notification Manager
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NotificationManager } from '../NotificationManager';

describe('NotificationManager', () => {
  let nm: NotificationManager;

  beforeEach(() => {
    nm = new NotificationManager();
  });

  afterEach(() => {
    nm.clearAll();
  });

  // ============================================================
  // send / markRead / getUnread
  // ============================================================
  describe('send / markRead / getUnread', () => {
    it('should send', () => {
      expect(nm.send('user1', 'hello')).toBe('nm-1');
    });

    it('should mark as unread initially', () => {
      const id = nm.send('user1', 'hello');
      expect(nm.isRead(id)).toBe(false);
    });

    it('should mark as active', () => {
      const id = nm.send('user1', 'hello');
      expect(nm.isActive(id)).toBe(true);
    });

    it('should mark read', () => {
      const id = nm.send('user1', 'hello');
      expect(nm.markRead(id)).toBe(true);
    });

    it('should mark as read', () => {
      const id = nm.send('user1', 'hello');
      nm.markRead(id);
      expect(nm.isRead(id)).toBe(true);
    });

    it('should not mark read inactive', () => {
      const id = nm.send('user1', 'hello');
      nm.setActive(id, false);
      expect(nm.markRead(id)).toBe(false);
    });

    it('should return false for unknown markRead', () => {
      expect(nm.markRead('unknown')).toBe(false);
    });

    it('should mark unread', () => {
      const id = nm.send('user1', 'hello');
      nm.markRead(id);
      expect(nm.markUnread(id)).toBe(true);
    });

    it('should get unread', () => {
      nm.send('user1', 'hello');
      expect(nm.getUnread('user1')).toHaveLength(1);
    });

    it('should not include read in unread', () => {
      const id = nm.send('user1', 'hello');
      nm.markRead(id);
      expect(nm.getUnread('user1')).toHaveLength(0);
    });

    it('should sort unread by priority', () => {
      nm.send('user1', 'low', 1);
      nm.send('user1', 'high', 10);
      const unread = nm.getUnread('user1');
      expect(unread[0].message).toBe('high');
    });

    it('should get all for recipient', () => {
      nm.send('user1', 'a');
      nm.send('user1', 'b');
      expect(nm.getAll('user1')).toHaveLength(2);
    });

    it('should get read for recipient', () => {
      const id = nm.send('user1', 'a');
      nm.markRead(id);
      expect(nm.getRead('user1')).toHaveLength(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      nm.send('user1', 'hello');
      const stats = nm.getStats();
      expect(stats.notifications).toBe(1);
    });

    it('should count read', () => {
      const id = nm.send('user1', 'hello');
      nm.markRead(id);
      expect(nm.getStats().read).toBe(1);
    });

    it('should count unread', () => {
      nm.send('user1', 'hello');
      expect(nm.getStats().unread).toBe(1);
    });

    it('should count active', () => {
      nm.send('user1', 'hello');
      expect(nm.getStats().active).toBe(1);
    });

    it('should count inactive', () => {
      const id = nm.send('user1', 'hello');
      nm.setActive(id, false);
      expect(nm.getStats().inactive).toBe(1);
    });

    it('should count recipients', () => {
      nm.send('user1', 'a');
      nm.send('user2', 'b');
      expect(nm.getStats().recipients).toBe(2);
    });

    it('should compute avg priority', () => {
      nm.send('user1', 'a', 5);
      nm.send('user1', 'b', 10);
      expect(nm.getStats().avgPriority).toBe(7.5);
    });

    it('should compute read rate', () => {
      const id = nm.send('user1', 'a');
      nm.markRead(id);
      expect(nm.getStats().readRate).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get notification', () => {
      nm.send('user1', 'hello');
      expect(nm.getNotification('nm-1')?.message).toBe('hello');
    });

    it('should get all', () => {
      nm.send('user1', 'hello');
      expect(nm.getAllNotifications()).toHaveLength(1);
    });

    it('should remove', () => {
      nm.send('user1', 'hello');
      expect(nm.removeNotification('nm-1')).toBe(true);
    });

    it('should check existence', () => {
      nm.send('user1', 'hello');
      expect(nm.hasNotification('nm-1')).toBe(true);
    });

    it('should count', () => {
      expect(nm.getCount()).toBe(0);
      nm.send('user1', 'hello');
      expect(nm.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get recipient', () => {
      nm.send('user1', 'hello');
      expect(nm.getRecipient('nm-1')).toBe('user1');
    });

    it('should get message', () => {
      nm.send('user1', 'hello');
      expect(nm.getMessage('nm-1')).toBe('hello');
    });

    it('should get priority', () => {
      nm.send('user1', 'hello', 5);
      expect(nm.getPriority('nm-1')).toBe(5);
    });

    it('should get sent at', () => {
      nm.send('user1', 'hello');
      expect(nm.getSentAt('nm-1')).toBeGreaterThan(0);
    });

    it('should get history', () => {
      nm.send('user1', 'hello');
      expect(nm.getHistory('nm-1').length).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // setters
  // ============================================================
  describe('setters', () => {
    it('should set active', () => {
      const id = nm.send('user1', 'hello');
      expect(nm.setActive(id, false)).toBe(true);
    });

    it('should set recipient', () => {
      const id = nm.send('user1', 'hello');
      expect(nm.setRecipient(id, 'user2')).toBe(true);
    });

    it('should set message', () => {
      const id = nm.send('user1', 'hello');
      expect(nm.setMessage(id, 'world')).toBe(true);
    });

    it('should set priority', () => {
      const id = nm.send('user1', 'hello');
      expect(nm.setPriority(id, 10)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(nm.setActive('unknown', false)).toBe(false);
      expect(nm.setRecipient('unknown', 'u')).toBe(false);
      expect(nm.setMessage('unknown', 'm')).toBe(false);
      expect(nm.setPriority('unknown', 5)).toBe(false);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset all', () => {
      const id = nm.send('user1', 'hello');
      nm.markRead(id);
      nm.setActive(id, false);
      nm.resetAll();
      expect(nm.isRead(id)).toBe(false);
      expect(nm.isActive(id)).toBe(true);
    });
  });

  // ============================================================
  // by recipient / state
  // ============================================================
  describe('by recipient / state', () => {
    it('should get by recipient', () => {
      nm.send('user1', 'a');
      expect(nm.getByRecipient('user1')).toHaveLength(1);
    });

    it('should get read', () => {
      const id = nm.send('user1', 'a');
      nm.markRead(id);
      expect(nm.getReadNotifications()).toHaveLength(1);
    });

    it('should get unread', () => {
      nm.send('user1', 'a');
      expect(nm.getUnreadNotifications()).toHaveLength(1);
    });

    it('should get active', () => {
      nm.send('user1', 'a');
      expect(nm.getActiveNotifications()).toHaveLength(1);
    });

    it('should get inactive', () => {
      const id = nm.send('user1', 'a');
      nm.setActive(id, false);
      expect(nm.getInactiveNotifications()).toHaveLength(1);
    });

    it('should get all recipients', () => {
      nm.send('user1', 'a');
      nm.send('user2', 'b');
      expect(nm.getAllRecipients()).toHaveLength(2);
    });

    it('should get recipient count', () => {
      nm.send('user1', 'a');
      expect(nm.getRecipientCount()).toBe(1);
    });
  });

  // ============================================================
  // counts
  // ============================================================
  describe('counts', () => {
    it('should get unread count', () => {
      nm.send('user1', 'a');
      expect(nm.getUnreadCount('user1')).toBe(1);
    });

    it('should get read count', () => {
      const id = nm.send('user1', 'a');
      nm.markRead(id);
      expect(nm.getReadCount('user1')).toBe(1);
    });

    it('should get total for recipient', () => {
      nm.send('user1', 'a');
      nm.send('user1', 'b');
      expect(nm.getTotalForRecipient('user1')).toBe(2);
    });
  });

  // ============================================================
  // bulk
  // ============================================================
  describe('bulk', () => {
    it('should mark all read', () => {
      nm.send('user1', 'a');
      nm.send('user1', 'b');
      expect(nm.markAllRead('user1')).toBe(2);
    });

    it('should delete all for recipient', () => {
      nm.send('user1', 'a');
      nm.send('user1', 'b');
      expect(nm.deleteAllForRecipient('user1')).toBe(2);
    });
  });

  // ============================================================
  // rankings
  // ============================================================
  describe('rankings', () => {
    it('should get newest', () => {
      nm.send('user1', 'a');
      expect(nm.getNewest()?.id).toBe('nm-1');
    });

    it('should return null for empty newest', () => {
      expect(nm.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      nm.send('user1', 'a');
      expect(nm.getOldest()?.id).toBe('nm-1');
    });

    it('should return null for empty oldest', () => {
      expect(nm.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // timestamps
  // ============================================================
  describe('timestamps', () => {
    it('should get created at', () => {
      nm.send('user1', 'a');
      expect(nm.getCreatedAt('nm-1')).toBeGreaterThan(0);
    });

    it('should get updated at', () => {
      const id = nm.send('user1', 'a');
      nm.markRead(id);
      expect(nm.getUpdatedAt(id)).toBeGreaterThan(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many notifications', () => {
      for (let i = 0; i < 50; i++) {
        nm.send('user1', `msg${i}`);
      }
      expect(nm.getCount()).toBe(50);
    });
  });
});