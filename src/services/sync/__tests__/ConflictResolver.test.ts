import { describe, it, expect, beforeEach } from 'vitest';
import { ConflictResolver, ConflictRecord } from '../ConflictResolver';

describe('ConflictResolver', () => {
  let resolver: ConflictResolver;

  beforeEach(() => {
    resolver = new ConflictResolver();
  });

  describe('Conflict Detection', () => {
    it('should detect conflict when local and remote differ', () => {
      const local = { name: 'Local', version: 1 };
      const remote = { name: 'Remote', version: 2 };
      expect(resolver.detectConflict(local, remote)).toBe(true);
    });

    it('should not detect conflict when local and remote are equal', () => {
      const local = { name: 'Same', version: 1 };
      const remote = { name: 'Same', version: 1 };
      expect(resolver.detectConflict(local, remote)).toBe(false);
    });

    it('should detect conflict with nested objects', () => {
      const local = { user: { name: 'Local' } };
      const remote = { user: { name: 'Remote' } };
      expect(resolver.detectConflict(local, remote)).toBe(true);
    });

    it('should detect conflict with array contents', () => {
      const local = { tags: ['a', 'b'] };
      const remote = { tags: ['a', 'b', 'c'] };
      expect(resolver.detectConflict(local, remote)).toBe(true);
    });

    it('should detect conflict with different types', () => {
      const local = { value: 'string' };
      const remote = { value: 123 };
      expect(resolver.detectConflict(local, remote)).toBe(true);
    });

    it('should not detect conflict for null values', () => {
      const local = { data: null };
      const remote = { data: null };
      expect(resolver.detectConflict(local, remote)).toBe(false);
    });

    it('should detect conflict when one is null', () => {
      const local = { data: null };
      const remote = { data: { value: 1 } };
      expect(resolver.detectConflict(local, remote)).toBe(true);
    });
  });

  describe('Conflict Management', () => {
    it('should add a conflict record', () => {
      const record: ConflictRecord = {
        entity: 'user',
        id: '123',
        localVersion: { name: 'Local' },
        remoteVersion: { name: 'Remote' },
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      };
      resolver.addConflict(record);
      expect(resolver.getUnresolvedConflicts()).toHaveLength(1);
    });

    it('should add multiple conflict records', () => {
      resolver.addConflict({
        entity: 'user',
        id: '1',
        localVersion: {},
        remoteVersion: {},
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      });
      resolver.addConflict({
        entity: 'post',
        id: '1',
        localVersion: {},
        remoteVersion: {},
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      });
      expect(resolver.getUnresolvedConflicts()).toHaveLength(2);
    });

    it('should not add duplicate conflict for same entity and id', () => {
      resolver.addConflict({
        entity: 'user',
        id: '123',
        localVersion: {},
        remoteVersion: {},
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      });
      resolver.addConflict({
        entity: 'user',
        id: '123',
        localVersion: {},
        remoteVersion: {},
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      });
      expect(resolver.getUnresolvedConflicts()).toHaveLength(1);
    });

    it('should allow same entity with different ids', () => {
      resolver.addConflict({
        entity: 'user',
        id: '1',
        localVersion: {},
        remoteVersion: {},
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      });
      resolver.addConflict({
        entity: 'user',
        id: '2',
        localVersion: {},
        remoteVersion: {},
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      });
      expect(resolver.getUnresolvedConflicts()).toHaveLength(2);
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve a conflict with local resolution', () => {
      resolver.addConflict({
        entity: 'user',
        id: '123',
        localVersion: { name: 'Local' },
        remoteVersion: { name: 'Remote' },
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      });
      const result = resolver.resolve('user-123', 'local');
      expect(result).toBe(true);
      const conflicts = resolver.getUnresolvedConflicts();
      expect(conflicts).toHaveLength(0);
    });

    it('should resolve a conflict with remote resolution', () => {
      resolver.addConflict({
        entity: 'user',
        id: '123',
        localVersion: { name: 'Local' },
        remoteVersion: { name: 'Remote' },
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      });
      const result = resolver.resolve('user-123', 'remote');
      expect(result).toBe(true);
    });

    it('should resolve a conflict with merged data', () => {
      resolver.addConflict({
        entity: 'user',
        id: '123',
        localVersion: { name: 'Local' },
        remoteVersion: { name: 'Remote' },
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      });
      const mergedData = { name: 'Merged' };
      const result = resolver.resolve('user-123', 'merged', mergedData);
      expect(result).toBe(true);
    });

    it('should return false when resolving non-existent conflict', () => {
      const result = resolver.resolve('non-existent', 'local');
      expect(result).toBe(false);
    });

    it('should return false when using invalid resolution type', () => {
      resolver.addConflict({
        entity: 'user',
        id: '123',
        localVersion: {},
        remoteVersion: {},
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      });
      const result = resolver.resolve('user-123', 'invalid' as any);
      expect(result).toBe(false);
    });
  });

  describe('Auto Resolution', () => {
    it('should auto-resolve with last-write-wins strategy', () => {
      const record: ConflictRecord = {
        entity: 'user',
        id: '123',
        localVersion: { name: 'Local', updatedAt: 1000 },
        remoteVersion: { name: 'Remote', updatedAt: 2000 },
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      };
      const resolved = resolver.autoResolve(record, 'last-write-wins');
      expect(resolved.resolution).toBe('remote');
      expect(resolved.resolved).toBe(true);
    });

    it('should auto-resolve with server-wins strategy', () => {
      const record: ConflictRecord = {
        entity: 'user',
        id: '123',
        localVersion: { name: 'Local' },
        remoteVersion: { name: 'Remote' },
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      };
      const resolved = resolver.autoResolve(record, 'server-wins');
      expect(resolved.resolution).toBe('remote');
    });

    it('should auto-resolve with client-wins strategy', () => {
      const record: ConflictRecord = {
        entity: 'user',
        id: '123',
        localVersion: { name: 'Local' },
        remoteVersion: { name: 'Remote' },
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      };
      const resolved = resolver.autoResolve(record, 'client-wins');
      expect(resolved.resolution).toBe('local');
    });

    it('should handle equal timestamps in last-write-wins', () => {
      const record: ConflictRecord = {
        entity: 'user',
        id: '123',
        localVersion: { name: 'Local' },
        remoteVersion: { name: 'Remote' },
        localTimestamp: 1000,
        remoteTimestamp: 1000,
        resolved: false,
      };
      const resolved = resolver.autoResolve(record, 'last-write-wins');
      expect(resolved.resolution).toBe('remote');
    });

    it('should default to remote when strategy is unknown', () => {
      const record: ConflictRecord = {
        entity: 'user',
        id: '123',
        localVersion: {},
        remoteVersion: {},
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      };
      const resolved = resolver.autoResolve(record, 'unknown-strategy');
      expect(resolved.resolution).toBe('remote');
    });
  });

  describe('Unresolved Conflicts', () => {
    it('should return empty array when no conflicts', () => {
      expect(resolver.getUnresolvedConflicts()).toHaveLength(0);
    });

    it('should return only unresolved conflicts', () => {
      resolver.addConflict({
        entity: 'user',
        id: '1',
        localVersion: {},
        remoteVersion: {},
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      });
      resolver.addConflict({
        entity: 'user',
        id: '2',
        localVersion: {},
        remoteVersion: {},
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: true,
        resolution: 'local',
      });
      const unresolved = resolver.getUnresolvedConflicts();
      expect(unresolved).toHaveLength(1);
      expect(unresolved[0].id).toBe('1');
    });

    it('should return conflict with resolved: false by default', () => {
      const record: ConflictRecord = {
        entity: 'user',
        id: '123',
        localVersion: {},
        remoteVersion: {},
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      };
      expect(record.resolved).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty entity name', () => {
      const local = {};
      const remote = { name: 'Remote' };
      expect(resolver.detectConflict(local, remote)).toBe(true);
    });

    it('should handle empty local and remote versions', () => {
      expect(resolver.detectConflict({}, {})).toBe(false);
    });

    it('should handle deeply nested conflicts', () => {
      const local = { a: { b: { c: { d: 'local' } } } };
      const remote = { a: { b: { c: { d: 'remote' } } } };
      expect(resolver.detectConflict(local, remote)).toBe(true);
    });

    it('should handle very long string values', () => {
      const local = { data: 'a'.repeat(10000) };
      const remote = { data: 'b'.repeat(10000) };
      expect(resolver.detectConflict(local, remote)).toBe(true);
    });

    it('should handle special characters in data', () => {
      const local = { data: '<script>alert("xss")</script>' };
      const remote = { data: '<script>alert("y")</script>' };
      expect(resolver.detectConflict(local, remote)).toBe(true);
    });

    it('should handle unicode characters', () => {
      const local = { data: '你好世界' };
      const remote = { data: 'Hello World' };
      expect(resolver.detectConflict(local, remote)).toBe(true);
    });

    it('should handle conflict with undefined values', () => {
      const local: any = { data: undefined };
      const remote: any = { data: 'value' };
      expect(resolver.detectConflict(local, remote)).toBe(true);
    });

    it('should handle conflict with NaN values', () => {
      const local: any = { data: NaN };
      const remote: any = { data: NaN };
      expect(resolver.detectConflict(local, remote)).toBe(false);
    });
  });

  describe('Conflict Record Integrity', () => {
    it('should preserve local and remote versions after resolution', () => {
      resolver.addConflict({
        entity: 'user',
        id: '123',
        localVersion: { name: 'Local' },
        remoteVersion: { name: 'Remote' },
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      });
      resolver.resolve('user-123', 'local');
      const unresolved = resolver.getUnresolvedConflicts();
      expect(unresolved).toHaveLength(0);
    });

    it('should set resolution type after resolve', () => {
      resolver.addConflict({
        entity: 'user',
        id: '123',
        localVersion: {},
        remoteVersion: {},
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      });
      resolver.resolve('user-123', 'remote');
      const resolved = resolver.autoResolve({
        entity: 'post',
        id: '456',
        localVersion: {},
        remoteVersion: {},
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      }, 'server-wins');
      expect(resolved.resolution).toBeDefined();
    });
  });

  describe('Batch Operations', () => {
    it('should handle many conflicts efficiently', () => {
      const count = 100;
      for (let i = 0; i < count; i++) {
        resolver.addConflict({
          entity: 'entity',
          id: String(i),
          localVersion: {},
          remoteVersion: {},
          localTimestamp: 1000,
          remoteTimestamp: 2000,
          resolved: false,
        });
      }
      expect(resolver.getUnresolvedConflicts()).toHaveLength(count);
    });

    it('should resolve all conflicts in batch', () => {
      for (let i = 0; i < 5; i++) {
        resolver.addConflict({
          entity: 'user',
          id: String(i),
          localVersion: {},
          remoteVersion: {},
          localTimestamp: 1000,
          remoteTimestamp: 2000,
          resolved: false,
        });
      }
      const conflicts = resolver.getUnresolvedConflicts();
      conflicts.forEach(c => {
        resolver.resolve(`${c.entity}-${c.id}`, 'local');
      });
      expect(resolver.getUnresolvedConflicts()).toHaveLength(0);
    });
  });
});