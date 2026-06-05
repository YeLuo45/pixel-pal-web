/**
 * ConversationBuffer Tests
 * chatdev-design Conversation Buffer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConversationBuffer } from '../ConversationBuffer';

describe('ConversationBuffer', () => {
  let buf: ConversationBuffer;

  beforeEach(() => {
    buf = new ConversationBuffer(100);
  });

  afterEach(() => {
    buf.clearAll();
  });

  // ============================================================
  // push
  // ============================================================
  describe('push', () => {
    it('should push', () => {
      const id = buf.push('alice', 'hello');
      expect(id).toBe('msg-1');
    });

    it('should return null when full', () => {
      const small = new ConversationBuffer(2);
      small.push('a', '1');
      small.push('a', '2');
      expect(small.push('a', '3')).toBeNull();
    });

    it('should increment total', () => {
      buf.push('a', '1');
      buf.push('a', '2');
      expect(buf.getTotalPushed()).toBe(2);
    });
  });

  // ============================================================
  // flush
  // ============================================================
  describe('flush', () => {
    it('should flush', () => {
      buf.push('a', '1');
      const flushed = buf.flush();
      expect(flushed).toHaveLength(1);
    });

    it('should clear buffer', () => {
      buf.push('a', '1');
      buf.flush();
      expect(buf.isEmpty()).toBe(true);
    });

    it('should increment flush count', () => {
      buf.flush();
      expect(buf.getFlushCount()).toBe(1);
    });
  });

  // ============================================================
  // retrieve
  // ============================================================
  describe('retrieve', () => {
    it('should retrieve since', () => {
      const now = Date.now();
      buf.push('a', '1');
      expect(buf.retrieve(now - 1000)).toHaveLength(1);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      buf.push('a', '1');
      const stats = buf.getStats();
      expect(stats.total).toBe(1);
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get all', () => {
      buf.push('a', '1');
      expect(buf.getAll()).toHaveLength(1);
    });

    it('should get size', () => {
      expect(buf.getSize()).toBe(0);
    });

    it('should get capacity', () => {
      expect(buf.getCapacity()).toBe(100);
    });

    it('should check isEmpty', () => {
      expect(buf.isEmpty()).toBe(true);
    });

    it('should check isFull', () => {
      expect(buf.isFull()).toBe(false);
    });

    it('should get message by id', () => {
      const id = buf.push('a', 'hi');
      expect(buf.getMessage(id!)?.content).toBe('hi');
    });

    it('should remove message', () => {
      const id = buf.push('a', 'hi');
      expect(buf.removeMessage(id!)).toBe(true);
    });

    it('should return false for unknown remove', () => {
      expect(buf.removeMessage('unknown')).toBe(false);
    });
  });

  // ============================================================
  // by sender
  // ============================================================
  describe('by sender', () => {
    it('should get by sender', () => {
      buf.push('alice', 'hi');
      expect(buf.getBySender('alice')).toHaveLength(1);
    });

    it('should get senders', () => {
      buf.push('alice', 'hi');
      buf.push('bob', 'hey');
      expect(buf.getSenders()).toHaveLength(2);
    });

    it('should count senders', () => {
      buf.push('alice', 'hi');
      expect(buf.getSenderCount()).toBe(1);
    });

    it('should count by sender', () => {
      buf.push('alice', 'hi');
      buf.push('alice', 'hey');
      expect(buf.countBySender('alice')).toBe(2);
    });

    it('should get stats for sender', () => {
      buf.push('alice', 'hi');
      const stats = buf.getStatsForSender('alice');
      expect(stats.count).toBe(1);
    });
  });

  // ============================================================
  // first / last
  // ============================================================
  describe('first / last', () => {
    it('should get first', () => {
      buf.push('a', '1');
      expect(buf.getFirst()?.content).toBe('1');
    });

    it('should get last', () => {
      buf.push('a', '1');
      buf.push('a', '2');
      expect(buf.getLast()?.content).toBe('2');
    });

    it('should get oldest', () => {
      buf.push('a', '1');
      expect(buf.getOldest()?.content).toBe('1');
    });

    it('should get newest', () => {
      buf.push('a', '1');
      buf.push('a', '2');
      expect(buf.getNewest()?.content).toBe('2');
    });
  });

  // ============================================================
  // capacity
  // ============================================================
  describe('capacity', () => {
    it('should get remaining capacity', () => {
      expect(buf.getRemainingCapacity()).toBe(100);
    });

    it('should set capacity', () => {
      buf.setCapacity(50);
      expect(buf.getCapacity()).toBe(50);
    });
  });

  // ============================================================
  // content
  // ============================================================
  describe('content', () => {
    it('should get content', () => {
      const id = buf.push('a', 'hello');
      expect(buf.getContent(id!)).toBe('hello');
    });

    it('should get timestamp', () => {
      const id = buf.push('a', 'hi');
      expect(buf.getTimestamp(id!)).toBeGreaterThan(0);
    });

    it('should get range', () => {
      buf.push('a', 'hi');
      const now = Date.now();
      expect(buf.getRange(now - 1000, now + 1000)).toHaveLength(1);
    });

    it('should check contains', () => {
      buf.push('a', 'hello');
      expect(buf.containsContent('hello')).toBe(true);
    });

    it('should search', () => {
      buf.push('a', 'hello world');
      expect(buf.searchByContent('hello')).toHaveLength(1);
    });
  });

  // ============================================================
  // reset
  // ============================================================
  describe('reset', () => {
    it('should reset stats', () => {
      buf.push('a', '1');
      buf.resetStats();
      expect(buf.getTotalPushed()).toBe(0);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many messages', () => {
      for (let i = 0; i < 50; i++) {
        buf.push('a', `m${i}`);
      }
      expect(buf.getSize()).toBe(50);
    });
  });
});