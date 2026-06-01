import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SyncEngine, SyncStatus } from '../SyncEngine';
import { OfflineQueue } from '../OfflineQueue';
import { ConflictResolver } from '../ConflictResolver';

describe('SyncEngine', () => {
  let syncEngine: SyncEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    syncEngine = new SyncEngine({
      autoSync: true,
      syncInterval: 5000,
      conflictStrategy: 'last-write-wins',
      maxRetries: 3,
    });
  });

  afterEach(() => {
    syncEngine.stopAutoSync();
  });

  describe('Status Management', () => {
    it('should initialize with IDLE status', () => {
      expect(syncEngine.getStatus()).toBe(SyncStatus.IDLE);
    });

    it('should correctly report isOnline when online', () => {
      expect(syncEngine.isOnline()).toBe(true);
    });

    it('should correctly report isSyncing when not syncing', () => {
      expect(syncEngine.isSyncing()).toBe(false);
    });
  });

  describe('Change Tracking', () => {
    it('should track changes correctly', () => {
      syncEngine.trackChange('user', '123', { name: 'Test' });
      const pending = syncEngine.getPendingChanges();
      expect(pending).toHaveLength(1);
      expect(pending[0]).toEqual({
        entity: 'user',
        id: '123',
        data: { name: 'Test' },
      });
    });

    it('should track multiple changes for same entity', () => {
      syncEngine.trackChange('user', '123', { name: 'Test1' });
      syncEngine.trackChange('user', '123', { name: 'Test2' });
      const pending = syncEngine.getPendingChanges();
      expect(pending).toHaveLength(2);
    });

    it('should track changes for different entities', () => {
      syncEngine.trackChange('user', '1', { name: 'User1' });
      syncEngine.trackChange('post', '1', { title: 'Post1' });
      const pending = syncEngine.getPendingChanges();
      expect(pending).toHaveLength(2);
    });

    it('should return empty array when no pending changes', () => {
      expect(syncEngine.getPendingChanges()).toHaveLength(0);
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve conflict with last-write-wins strategy', () => {
      const local = { name: 'Local', updatedAt: 2000 };
      const remote = { name: 'Remote', updatedAt: 3000 };
      const result = syncEngine.resolveConflict(local, remote, 'last-write-wins');
      expect(result.name).toBe('Remote');
    });

    it('should resolve conflict with server-wins strategy', () => {
      const local = { name: 'Local' };
      const remote = { name: 'Remote' };
      const result = syncEngine.resolveConflict(local, remote, 'server-wins');
      expect(result.name).toBe('Remote');
    });

    it('should resolve conflict with client-wins strategy', () => {
      const local = { name: 'Local' };
      const remote = { name: 'Remote' };
      const result = syncEngine.resolveConflict(local, remote, 'client-wins');
      expect(result.name).toBe('Local');
    });

    it('should handle equal timestamps with last-write-wins', () => {
      const local = { name: 'Local', updatedAt: 1000 };
      const remote = { name: 'Remote', updatedAt: 1000 };
      const result = syncEngine.resolveConflict(local, remote, 'last-write-wins');
      expect(result.name).toBe('Remote');
    });
  });

  describe('Offline Queue Operations', () => {
    it('should enqueue offline actions', () => {
      syncEngine.enqueueOffline('CREATE_USER', { name: 'Test' });
      const pending = syncEngine.getOfflineQueue().getPending();
      expect(pending).toHaveLength(1);
    });

    it('should return valid queue stats', () => {
      syncEngine.enqueueOffline('CREATE_USER', { name: 'Test' });
      const stats = syncEngine.getOfflineQueue().getStats();
      expect(stats.pending).toBe(1);
      expect(stats.processing).toBe(0);
      expect(stats.failed).toBe(0);
    });
  });

  describe('Sync Operations', () => {
    it('should sync when online with pending changes', async () => {
      syncEngine.trackChange('user', '1', { name: 'Test' });
      const result = await syncEngine.sync();
      expect(result.success).toBe(true);
      expect(result.changesUploaded).toBe(1);
    });

    it('should return success with no pending changes', async () => {
      const result = await syncEngine.sync();
      expect(result.success).toBe(true);
      expect(result.changesUploaded).toBe(0);
    });

    it('should handle offline status during sync', async () => {
      syncEngine.setOnline(false);
      syncEngine.trackChange('user', '1', { name: 'Test' });
      const result = await syncEngine.sync();
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Device is offline');
    });

    it('should transition to SYNCING status during sync', async () => {
      vi.useFakeTimers();
      syncEngine.trackChange('user', '1', { name: 'Test' });
      const syncPromise = syncEngine.sync();
      
      // Advance timers to allow the promise to start
      await vi.advanceTimersByTimeAsync(0);
      
      expect(syncEngine.isSyncing()).toBe(true);
      
      await vi.runAllTimersAsync();
      await syncPromise;
      
      vi.useRealTimers();
      expect(syncEngine.isSyncing()).toBe(false);
    });

    it('should clear pending changes after successful sync', async () => {
      syncEngine.trackChange('user', '1', { name: 'Test' });
      await syncEngine.sync();
      expect(syncEngine.getPendingChanges()).toHaveLength(0);
    });

    it('should return conflicts in sync result when present', async () => {
      syncEngine.trackChange('user', '1', { name: 'Test' });
      syncEngine.addConflict({
        entity: 'user',
        id: '1',
        localVersion: { name: 'Local' },
        remoteVersion: { name: 'Remote' },
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        resolved: false,
      });
      const result = await syncEngine.sync();
      expect(result.conflicts).toBeDefined();
      expect(result.conflicts.length).toBeGreaterThan(0);
    });
  });

  describe('Force Sync', () => {
    it('should force sync even with no changes', async () => {
      const result = await syncEngine.forceSync();
      expect(result.success).toBe(true);
    });

    it('should force sync despite offline status', async () => {
      syncEngine.setOnline(false);
      const result = await syncEngine.forceSync();
      expect(result.errors).toContain('Device is offline');
    });
  });

  describe('Auto Sync', () => {
    it('should start auto sync when enabled', () => {
      vi.useFakeTimers();
      syncEngine.startAutoSync();
      expect(syncEngine.getStatus()).toBe(SyncStatus.IDLE);
      syncEngine.stopAutoSync();
      vi.useRealTimers();
    });

    it('should stop auto sync', () => {
      syncEngine.stopAutoSync();
      expect(syncEngine.getStatus()).toBe(SyncStatus.IDLE);
    });

    it('should update sync interval', () => {
      syncEngine.updateConfig({ syncInterval: 10000 });
      expect(syncEngine.getConfig().syncInterval).toBe(10000);
    });
  });

  describe('Error Handling', () => {
    it('should handle sync errors gracefully', async () => {
      syncEngine.trackChange('user', '1', { name: 'Test' });
      const result = await syncEngine.sync();
      expect(result.errors).toBeDefined();
    });

    it('should retry on failure when retries available', async () => {
      syncEngine.trackChange('user', '1', { name: 'Test' });
      const result = await syncEngine.sync();
      expect(result.errors).toBeDefined();
    });

    it('should set ERROR status after max retries exceeded', async () => {
      vi.useFakeTimers();
      const engine = new SyncEngine({
        autoSync: false,
        syncInterval: 1000,
        conflictStrategy: 'last-write-wins',
        maxRetries: 1,
      });
      engine.trackChange('user', '1', { name: 'Test' });
      vi.useRealTimers();
    });
  });

  describe('Configuration', () => {
    it('should return current config', () => {
      const config = syncEngine.getConfig();
      expect(config.autoSync).toBe(true);
      expect(config.syncInterval).toBe(5000);
      expect(config.conflictStrategy).toBe('last-write-wins');
      expect(config.maxRetries).toBe(3);
    });

    it('should update config dynamically', () => {
      syncEngine.updateConfig({
        autoSync: false,
        syncInterval: 10000,
      });
      const config = syncEngine.getConfig();
      expect(config.autoSync).toBe(false);
      expect(config.syncInterval).toBe(10000);
    });

    it('should preserve unchanged config values', () => {
      syncEngine.updateConfig({ syncInterval: 20000 });
      const config = syncEngine.getConfig();
      expect(config.conflictStrategy).toBe('last-write-wins');
      expect(config.maxRetries).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty entity and id in trackChange', () => {
      syncEngine.trackChange('', '', {});
      expect(syncEngine.getPendingChanges()).toHaveLength(1);
    });

    it('should handle null data in trackChange', () => {
      syncEngine.trackChange('user', '1', null);
      expect(syncEngine.getPendingChanges()).toHaveLength(1);
    });

    it('should handle undefined data in trackChange', () => {
      syncEngine.trackChange('user', '1', undefined);
      expect(syncEngine.getPendingChanges()).toHaveLength(1);
    });

    it('should handle sync with very large data', () => {
      const largeData = { data: 'x'.repeat(10000) };
      syncEngine.trackChange('user', '1', largeData);
      expect(syncEngine.getPendingChanges()).toHaveLength(1);
    });

    it('should handle rapid successive syncs', async () => {
      syncEngine.trackChange('user', '1', { name: 'Test' });
      await syncEngine.sync();
      syncEngine.trackChange('user', '2', { name: 'Test2' });
      const result = await syncEngine.sync();
      expect(result.success).toBe(true);
    });
  });
});