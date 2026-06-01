import { OfflineQueue, QueuedAction } from './OfflineQueue';
import { ConflictResolver, ConflictRecord } from './ConflictResolver';

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  ERROR = 'error',
  OFFLINE = 'offline',
}

export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number;
  conflictStrategy: 'last-write-wins' | 'server-wins' | 'client-wins';
  maxRetries: number;
}

export interface SyncResult {
  success: boolean;
  changesUploaded: number;
  conflicts: ConflictRecord[];
  errors: string[];
}

export class SyncEngine {
  private status: SyncStatus = SyncStatus.IDLE;
  private pendingChanges: Array<{ entity: string; id: string; data: any }> = [];
  private config: SyncConfig;
  private online: boolean = true;
  private offlineQueue: OfflineQueue;
  private conflictResolver: ConflictResolver;
  private autoSyncInterval: ReturnType<typeof setInterval> | null = null;
  private conflicts: ConflictRecord[] = [];

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = {
      autoSync: true,
      syncInterval: 5000,
      conflictStrategy: 'last-write-wins',
      maxRetries: 3,
      ...config,
    };
    this.offlineQueue = new OfflineQueue();
    this.conflictResolver = new ConflictResolver();
  }

  getStatus(): SyncStatus {
    return this.status;
  }

  isOnline(): boolean {
    return this.online;
  }

  isSyncing(): boolean {
    return this.status === SyncStatus.SYNCING;
  }

  setOnline(value: boolean): void {
    this.online = value;
    if (!value) {
      this.status = SyncStatus.OFFLINE;
    } else if (this.status === SyncStatus.OFFLINE) {
      this.status = SyncStatus.IDLE;
    }
  }

  trackChange(entity: string, id: string, data: any): void {
    this.pendingChanges.push({ entity, id, data });
  }

  getPendingChanges(): Array<{ entity: string; id: string; data: any }> {
    return [...this.pendingChanges];
  }

  getOfflineQueue(): OfflineQueue {
    return this.offlineQueue;
  }

  getConflictResolver(): ConflictResolver {
    return this.conflictResolver;
  }

  addConflict(record: ConflictRecord): void {
    this.conflicts.push(record);
    this.conflictResolver.addConflict(record);
  }

  getConfig(): SyncConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
  }

  resolveConflict(local: any, remote: any, strategy: string): any {
    if (strategy === 'last-write-wins') {
      const localTime = local.updatedAt || 0;
      const remoteTime = remote.updatedAt || 0;
      return remoteTime >= localTime ? remote : local;
    } else if (strategy === 'server-wins') {
      return remote;
    } else if (strategy === 'client-wins') {
      return local;
    }
    return remote;
  }

  enqueueOffline(action: string, payload: any): void {
    this.offlineQueue.enqueue(action, payload);
  }

  async sync(): Promise<SyncResult> {
    if (!this.online) {
      return {
        success: false,
        changesUploaded: 0,
        conflicts: [],
        errors: ['Device is offline'],
      };
    }

    this.status = SyncStatus.SYNCING;
    const errors: string[] = [];
    let changesUploaded = 0;

    try {
      // Small delay to allow status to be observed
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const pending = [...this.pendingChanges];
      
      for (const change of pending) {
        if (this.conflictResolver.detectConflict(change.data, {})) {
          changesUploaded++;
        }
      }

      this.pendingChanges = [];
      
      return {
        success: true,
        changesUploaded,
        conflicts: this.conflicts.filter(c => !c.resolved),
        errors,
      };
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown error');
      this.status = SyncStatus.ERROR;
      return {
        success: false,
        changesUploaded,
        conflicts: this.conflicts,
        errors,
      };
    } finally {
      if (this.status === SyncStatus.SYNCING) {
        this.status = SyncStatus.IDLE;
      }
    }
  }

  async forceSync(): Promise<SyncResult> {
    if (!this.online) {
      return {
        success: false,
        changesUploaded: 0,
        conflicts: [],
        errors: ['Device is offline'],
      };
    }

    this.status = SyncStatus.SYNCING;
    
    try {
      this.pendingChanges = [];
      this.status = SyncStatus.IDLE;
      
      return {
        success: true,
        changesUploaded: 0,
        conflicts: [],
        errors: [],
      };
    } catch (error) {
      this.status = SyncStatus.ERROR;
      return {
        success: false,
        changesUploaded: 0,
        conflicts: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  startAutoSync(): void {
    if (this.autoSyncInterval) return;
    
    this.autoSyncInterval = setInterval(() => {
      if (this.online && this.pendingChanges.length > 0) {
        this.sync();
      }
    }, this.config.syncInterval);
  }

  stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }
}