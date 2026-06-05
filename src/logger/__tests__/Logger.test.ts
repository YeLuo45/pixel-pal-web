/**
 * Logger Tests
 * claude-code-design Logger
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Logger } from '../Logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
  });

  afterEach(() => {
    logger.clearAll();
  });

  // ============================================================
  // log
  // ============================================================
  describe('log', () => {
    it('should log entry', () => {
      logger.log({ level: 'info', message: 'hello' });
      expect(logger.getCount()).toBe(1);
    });

    it('should filter by level', () => {
      logger.setLevel('warn');
      logger.log({ level: 'info', message: 'ignored' });
      logger.log({ level: 'warn', message: 'kept' });
      expect(logger.getCount()).toBe(1);
    });
  });

  // ============================================================
  // setLevel / getLevel
  // ============================================================
  describe('setLevel / getLevel', () => {
    it('should set level', () => {
      logger.setLevel('debug');
      expect(logger.getLevel()).toBe('debug');
    });

    it('should default to info', () => {
      expect(logger.getLevel()).toBe('info');
    });
  });

  // ============================================================
  // filter
  // ============================================================
  describe('filter', () => {
    it('should filter by level', () => {
      logger.log({ level: 'info', message: 'i' });
      logger.log({ level: 'error', message: 'e' });
      expect(logger.filter('error')).toHaveLength(1);
    });
  });

  // ============================================================
  // export
  // ============================================================
  describe('export', () => {
    it('should export as json', () => {
      logger.log({ level: 'info', message: 'hello' });
      const result = logger.export('json');
      expect(result).toContain('hello');
    });

    it('should export as text', () => {
      logger.log({ level: 'info', message: 'hello' });
      const result = logger.export('text');
      expect(result).toContain('INFO');
    });
  });

  // ============================================================
  // convenience methods
  // ============================================================
  describe('convenience methods', () => {
    it('should log debug', () => {
      logger.setLevel('debug');
      logger.debug('d');
      expect(logger.getDebugCount()).toBe(1);
    });

    it('should log info', () => {
      logger.info('i');
      expect(logger.getInfoCount()).toBe(1);
    });

    it('should log warn', () => {
      logger.warn('w');
      expect(logger.getWarnCount()).toBe(1);
    });

    it('should log error', () => {
      logger.error('e');
      expect(logger.getErrorCount()).toBe(1);
    });
  });

  // ============================================================
  // entries
  // ============================================================
  describe('entries', () => {
    it('should get entries', () => {
      logger.log({ level: 'info', message: 'i' });
      expect(logger.getEntries()).toHaveLength(1);
    });

    it('should not expose internal array', () => {
      logger.log({ level: 'info', message: 'i' });
      const entries = logger.getEntries();
      entries.push({ level: 'info', message: 'fake', timestamp: 0 });
      expect(logger.getCount()).toBe(1);
    });
  });

  // ============================================================
  // clear
  // ============================================================
  describe('clear', () => {
    it('should clear entries', () => {
      logger.log({ level: 'info', message: 'i' });
      logger.clear();
      expect(logger.getCount()).toBe(0);
    });

    it('should clear all', () => {
      logger.log({ level: 'info', message: 'i' });
      logger.setLevel('debug');
      logger.clearAll();
      expect(logger.getCount()).toBe(0);
      expect(logger.getLevel()).toBe('info');
    });
  });

  // ============================================================
  // recent / first / last
  // ============================================================
  describe('recent / first / last', () => {
    it('should get recent', () => {
      logger.log({ level: 'info', message: 'a' });
      logger.log({ level: 'info', message: 'b' });
      logger.log({ level: 'info', message: 'c' });
      expect(logger.getRecent(2)).toHaveLength(2);
    });

    it('should get first', () => {
      logger.log({ level: 'info', message: 'a' });
      logger.log({ level: 'info', message: 'b' });
      expect(logger.getFirst()?.message).toBe('a');
    });

    it('should get last', () => {
      logger.log({ level: 'info', message: 'a' });
      logger.log({ level: 'info', message: 'b' });
      expect(logger.getLast()?.message).toBe('b');
    });
  });

  // ============================================================
  // queries
  // ============================================================
  describe('queries', () => {
    it('should get by level', () => {
      logger.log({ level: 'info', message: 'a' });
      logger.log({ level: 'error', message: 'b' });
      expect(logger.getByLevel('error')).toHaveLength(1);
    });

    it('should get by level and above', () => {
      logger.log({ level: 'debug', message: 'd' });
      logger.log({ level: 'info', message: 'i' });
      logger.log({ level: 'warn', message: 'w' });
      logger.log({ level: 'error', message: 'e' });
      expect(logger.getByLevelAndAbove('warn')).toHaveLength(2);
    });

    it('should get by message', () => {
      logger.log({ level: 'info', message: 'hello world' });
      logger.log({ level: 'info', message: 'goodbye' });
      expect(logger.getByMessage('hello')).toHaveLength(1);
    });

    it('should get by context', () => {
      logger.log({ level: 'info', message: 'a', context: { user: 'u1' } });
      logger.log({ level: 'info', message: 'b', context: { user: 'u2' } });
      expect(logger.getByContext('user', 'u1')).toHaveLength(1);
    });

    it('should check hasLevel', () => {
      logger.log({ level: 'error', message: 'e' });
      expect(logger.hasLevel('error')).toBe(true);
    });
  });

  // ============================================================
  // counts
  // ============================================================
  describe('counts', () => {
    it('should count error', () => {
      logger.error('e1');
      logger.error('e2');
      expect(logger.getErrorCount()).toBe(2);
    });

    it('should count warn', () => {
      logger.warn('w');
      expect(logger.getWarnCount()).toBe(1);
    });

    it('should count info', () => {
      logger.info('i');
      expect(logger.getInfoCount()).toBe(1);
    });

    it('should count debug', () => {
      logger.setLevel('debug');
      logger.debug('d');
      expect(logger.getDebugCount()).toBe(1);
    });

    it('should count', () => {
      logger.log({ level: 'info', message: 'i' });
      expect(logger.getCount()).toBe(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many entries', () => {
      for (let i = 0; i < 100; i++) {
        logger.info(`m${i}`);
      }
      expect(logger.getCount()).toBe(100);
    });
  });
});