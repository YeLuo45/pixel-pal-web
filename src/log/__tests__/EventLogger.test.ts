/**
 * EventLogger Tests
 * thunderbolt-design Event Logger
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EventLogger } from '../EventLogger';

describe('EventLogger', () => {
  let logger: EventLogger;

  beforeEach(() => {
    logger = new EventLogger();
  });

  afterEach(() => {
    logger.clearAll();
  });

  // ============================================================
  // log / filter
  // ============================================================
  describe('log / filter', () => {
    it('should log', () => {
      expect(logger.log('info', 'msg', 'src')).toBe('log-1');
    });

    it('should filter info', () => {
      logger.log('info', 'msg', 'src');
      expect(logger.filter('info')).toHaveLength(1);
    });

    it('should filter error', () => {
      logger.log('error', 'oops', 'src');
      expect(logger.filter('error')).toHaveLength(1);
    });

    it('should filter warn', () => {
      logger.log('warn', 'warn', 'src');
      expect(logger.filter('warn')).toHaveLength(1);
    });

    it('should filter debug', () => {
      logger.log('debug', 'debug', 'src');
      expect(logger.filter('debug')).toHaveLength(1);
    });

    it('should return empty for no match', () => {
      expect(logger.filter('error')).toHaveLength(0);
    });
  });

  // ============================================================
  // getStats
  // ============================================================
  describe('getStats', () => {
    it('should get stats', () => {
      logger.log('info', 'msg', 'src');
      const stats = logger.getStats();
      expect(stats.entries).toBe(1);
    });

    it('should count errors', () => {
      logger.log('error', 'oops', 'src');
      expect(logger.getStats().errors).toBe(1);
    });

    it('should count warnings', () => {
      logger.log('warn', 'w', 'src');
      expect(logger.getStats().warnings).toBe(1);
    });

    it('should count info', () => {
      logger.log('info', 'm', 'src');
      expect(logger.getStats().info).toBe(1);
    });

    it('should count debug', () => {
      logger.log('debug', 'd', 'src');
      expect(logger.getStats().debug).toBe(1);
    });
  });

  // ============================================================
  // level methods
  // ============================================================
  describe('level methods', () => {
    it('should info', () => {
      expect(logger.info('m')).toBe('log-1');
    });

    it('should warn', () => {
      expect(logger.warn('m')).toBe('log-1');
    });

    it('should error', () => {
      expect(logger.error('m')).toBe('log-1');
    });

    it('should debug', () => {
      expect(logger.debug('m')).toBe('log-1');
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get entry', () => {
      logger.log('info', 'msg', 'src');
      expect(logger.getEntry('log-1')?.message).toBe('msg');
    });

    it('should get all', () => {
      logger.log('info', 'msg', 'src');
      expect(logger.getAllEntries()).toHaveLength(1);
    });

    it('should remove', () => {
      logger.log('info', 'msg', 'src');
      expect(logger.removeEntry('log-1')).toBe(true);
    });

    it('should check existence', () => {
      logger.log('info', 'msg', 'src');
      expect(logger.hasEntry('log-1')).toBe(true);
    });

    it('should count', () => {
      expect(logger.getCount()).toBe(0);
      logger.log('info', 'm', 's');
      expect(logger.getCount()).toBe(1);
    });
  });

  // ============================================================
  // accessors
  // ============================================================
  describe('accessors', () => {
    it('should get message', () => {
      logger.log('info', 'hello', 'src');
      expect(logger.getMessage('log-1')).toBe('hello');
    });

    it('should get level', () => {
      logger.log('error', 'm', 'src');
      expect(logger.getLevel('log-1')).toBe('error');
    });

    it('should get source', () => {
      logger.log('info', 'm', 'api');
      expect(logger.getSource('log-1')).toBe('api');
    });

    it('should get timestamp', () => {
      logger.log('info', 'm', 'src');
      expect(logger.getTimestamp('log-1')).toBeGreaterThan(0);
    });

    it('should get tag', () => {
      logger.log('info', 'm', 'src');
      expect(logger.getTag('log-1')).toBe('');
    });

    it('should set tag', () => {
      logger.log('info', 'm', 'src');
      expect(logger.setTag('log-1', 'auth')).toBe(true);
    });

    it('should return false for unknown setTag', () => {
      expect(logger.setTag('unknown', 'a')).toBe(false);
    });

    it('should get context', () => {
      logger.log('info', 'm', 'src');
      expect(logger.getContext('log-1')).toBe('');
    });

    it('should set context', () => {
      logger.log('info', 'm', 'src');
      expect(logger.setContext('log-1', 'user1')).toBe(true);
    });

    it('should return false for unknown setContext', () => {
      expect(logger.setContext('unknown', 'a')).toBe(false);
    });
  });

  // ============================================================
  // level control
  // ============================================================
  describe('level control', () => {
    it('should set min level', () => {
      logger.setMinLevel('error');
      expect(logger.getMinLevel()).toBe('error');
    });
  });

  // ============================================================
  // by level
  // ============================================================
  describe('by level', () => {
    it('should get by level', () => {
      logger.log('info', 'm', 's');
      expect(logger.getByLevel('info')).toHaveLength(1);
    });

    it('should get info', () => {
      logger.log('info', 'm', 's');
      expect(logger.getInfo()).toHaveLength(1);
    });

    it('should get warnings', () => {
      logger.log('warn', 'm', 's');
      expect(logger.getWarnings()).toHaveLength(1);
    });

    it('should get errors', () => {
      logger.log('error', 'm', 's');
      expect(logger.getErrors()).toHaveLength(1);
    });

    it('should get debugs', () => {
      logger.log('debug', 'm', 's');
      expect(logger.getDebugs()).toHaveLength(1);
    });
  });

  // ============================================================
  // by source / message
  // ============================================================
  describe('by source / message', () => {
    it('should get by source', () => {
      logger.log('info', 'm', 'api');
      expect(logger.getBySource('api')).toHaveLength(1);
    });

    it('should get by message', () => {
      logger.log('info', 'hello world', 'src');
      expect(logger.getByMessage('hello')).toHaveLength(1);
    });
  });

  // ============================================================
  // by tag
  // ============================================================
  describe('by tag', () => {
    it('should get by tag', () => {
      logger.log('info', 'm', 'src');
      logger.setTag('log-1', 'auth');
      expect(logger.getByTag('auth')).toHaveLength(1);
    });

    it('should get all tags', () => {
      logger.log('info', 'm', 'src');
      logger.setTag('log-1', 'auth');
      expect(logger.getAllTags()).toEqual(['auth']);
    });

    it('should get tag count', () => {
      logger.log('info', 'm', 'src');
      logger.setTag('log-1', 'auth');
      expect(logger.getTagCount()).toBe(1);
    });
  });

  // ============================================================
  // sources
  // ============================================================
  describe('sources', () => {
    it('should get all sources', () => {
      logger.log('info', 'm', 'api');
      expect(logger.getAllSources()).toEqual(['api']);
    });

    it('should get source count', () => {
      logger.log('info', 'm', 'api');
      expect(logger.getSourceCount()).toBe(1);
    });
  });

  // ============================================================
  // time range
  // ============================================================
  describe('time range', () => {
    it('should get in time range', () => {
      const now = Date.now();
      logger.log('info', 'm', 'src');
      expect(logger.getInTimeRange(now - 1000, now + 1000)).toHaveLength(1);
    });
  });

  // ============================================================
  // order
  // ============================================================
  describe('order', () => {
    it('should get newest', () => {
      logger.log('info', 'm', 'src');
      expect(logger.getNewest()?.id).toBe('log-1');
    });

    it('should return null for empty newest', () => {
      expect(logger.getNewest()).toBeNull();
    });

    it('should get oldest', () => {
      logger.log('info', 'm', 'src');
      expect(logger.getOldest()?.id).toBe('log-1');
    });

    it('should return null for empty oldest', () => {
      expect(logger.getOldest()).toBeNull();
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many entries', () => {
      for (let i = 0; i < 50; i++) {
        logger.log('info', `m${i}`, 'src');
      }
      expect(logger.getCount()).toBe(50);
    });
  });
});