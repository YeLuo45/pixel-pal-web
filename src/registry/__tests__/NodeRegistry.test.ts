/**
 * NodeRegistry Tests
 * nanobot-design Node Registry
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NodeRegistry } from '../NodeRegistry';

describe('NodeRegistry', () => {
  let registry: NodeRegistry;

  beforeEach(() => {
    registry = new NodeRegistry();
  });

  afterEach(() => {
    registry.clearAll();
  });

  // ============================================================
  // register
  // ============================================================
  describe('register', () => {
    it('should register node', () => {
      registry.register({ id: 'n1', host: 'localhost', port: 8080, status: 'online', tags: [], lastSeen: 0 });
      expect(registry.getCount()).toBe(1);
    });

    it('should not mutate input', () => {
      const tags = ['a'];
      registry.register({ id: 'n1', host: 'localhost', port: 8080, status: 'online', tags, lastSeen: 0 });
      tags.push('b');
      const n = registry.find('n1');
      expect(n?.tags).toEqual(['a']);
    });
  });

  // ============================================================
  // find
  // ============================================================
  describe('find', () => {
    it('should find node', () => {
      registry.register({ id: 'n1', host: 'localhost', port: 8080, status: 'online', tags: [], lastSeen: 0 });
      expect(registry.find('n1')?.host).toBe('localhost');
    });

    it('should return null for unknown', () => {
      expect(registry.find('unknown')).toBeNull();
    });
  });

  // ============================================================
  // findByTag
  // ============================================================
  describe('findByTag', () => {
    it('should find by tag', () => {
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'online', tags: ['web'], lastSeen: 0 });
      registry.register({ id: 'n2', host: 'b', port: 80, status: 'online', tags: ['db'], lastSeen: 0 });
      expect(registry.findByTag('web')).toHaveLength(1);
    });

    it('should return empty for unknown tag', () => {
      expect(registry.findByTag('unknown')).toHaveLength(0);
    });
  });

  // ============================================================
  // status queries
  // ============================================================
  describe('status queries', () => {
    it('should get healthy', () => {
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'online', tags: [], lastSeen: 0 });
      registry.register({ id: 'n2', host: 'b', port: 80, status: 'offline', tags: [], lastSeen: 0 });
      expect(registry.getHealthy()).toHaveLength(1);
    });

    it('should get busy', () => {
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'busy', tags: [], lastSeen: 0 });
      expect(registry.getBusy()).toHaveLength(1);
    });

    it('should get offline', () => {
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'offline', tags: [], lastSeen: 0 });
      expect(registry.getOffline()).toHaveLength(1);
    });

    it('should get by status', () => {
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'online', tags: [], lastSeen: 0 });
      expect(registry.getNodesByStatus('online')).toHaveLength(1);
    });
  });

  // ============================================================
  // deregister
  // ============================================================
  describe('deregister', () => {
    it('should deregister', () => {
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'online', tags: [], lastSeen: 0 });
      expect(registry.deregister('n1')).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(registry.deregister('unknown')).toBe(false);
    });

    it('should remove from tag index', () => {
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'online', tags: ['web'], lastSeen: 0 });
      registry.deregister('n1');
      expect(registry.findByTag('web')).toHaveLength(0);
    });
  });

  // ============================================================
  // getAll / has / count
  // ============================================================
  describe('queries', () => {
    it('should get all', () => {
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'online', tags: [], lastSeen: 0 });
      expect(registry.getAll()).toHaveLength(1);
    });

    it('should check existence', () => {
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'online', tags: [], lastSeen: 0 });
      expect(registry.hasNode('n1')).toBe(true);
    });

    it('should count', () => {
      expect(registry.getCount()).toBe(0);
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'online', tags: [], lastSeen: 0 });
      expect(registry.getCount()).toBe(1);
    });
  });

  // ============================================================
  // setStatus / heartbeat
  // ============================================================
  describe('setStatus / heartbeat', () => {
    it('should set status', () => {
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'online', tags: [], lastSeen: 0 });
      expect(registry.setStatus('n1', 'busy')).toBe(true);
      expect(registry.find('n1')?.status).toBe('busy');
    });

    it('should return false for unknown', () => {
      expect(registry.setStatus('unknown', 'busy')).toBe(false);
    });

    it('should heartbeat', () => {
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'online', tags: [], lastSeen: 0 });
      expect(registry.heartbeat('n1')).toBe(true);
      expect(registry.getLastSeen('n1')).toBeGreaterThan(0);
    });

    it('should return false for unknown heartbeat', () => {
      expect(registry.heartbeat('unknown')).toBe(false);
    });
  });

  // ============================================================
  // getByHost / getByPort
  // ============================================================
  describe('host/port queries', () => {
    it('should get by host', () => {
      registry.register({ id: 'n1', host: 'a.com', port: 80, status: 'online', tags: [], lastSeen: 0 });
      registry.register({ id: 'n2', host: 'b.com', port: 80, status: 'online', tags: [], lastSeen: 0 });
      expect(registry.getByHost('a.com')).toHaveLength(1);
    });

    it('should get by port', () => {
      registry.register({ id: 'n1', host: 'a.com', port: 80, status: 'online', tags: [], lastSeen: 0 });
      registry.register({ id: 'n2', host: 'b.com', port: 90, status: 'online', tags: [], lastSeen: 0 });
      expect(registry.getByPort(80)).toHaveLength(1);
    });

    it('should get all hosts', () => {
      registry.register({ id: 'n1', host: 'a.com', port: 80, status: 'online', tags: [], lastSeen: 0 });
      registry.register({ id: 'n2', host: 'a.com', port: 90, status: 'online', tags: [], lastSeen: 0 });
      expect(registry.getAllHosts()).toHaveLength(1);
    });
  });

  // ============================================================
  // tags
  // ============================================================
  describe('tags', () => {
    it('should get all tags', () => {
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'online', tags: ['web', 'api'], lastSeen: 0 });
      expect(registry.getAllTags()).toHaveLength(2);
    });

    it('should get tag count', () => {
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'online', tags: ['web', 'api'], lastSeen: 0 });
      expect(registry.getTagCount()).toBe(2);
    });
  });

  // ============================================================
  // stale
  // ============================================================
  describe('stale', () => {
    it('should check isStale', () => {
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'online', tags: [], lastSeen: 0 });
      expect(registry.isStale('n1', 1000)).toBe(true);
    });

    it('should return false for unknown', () => {
      expect(registry.isStale('unknown')).toBe(false);
    });

    it('should get stale nodes', () => {
      registry.register({ id: 'n1', host: 'a', port: 80, status: 'online', tags: [], lastSeen: 0 });
      expect(registry.getStaleNodes(1000)).toHaveLength(1);
    });
  });

  // ============================================================
  // edge cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle many nodes', () => {
      for (let i = 0; i < 50; i++) {
        registry.register({ id: `n${i}`, host: 'a', port: 80, status: 'online', tags: [], lastSeen: 0 });
      }
      expect(registry.getCount()).toBe(50);
    });
  });
});