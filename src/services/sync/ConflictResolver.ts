import { QueuedAction } from './OfflineQueue';

export interface ConflictRecord {
  entity: string;
  id: string;
  localVersion: any;
  remoteVersion: any;
  localTimestamp: number;
  remoteTimestamp: number;
  resolved: boolean;
  resolution?: 'local' | 'remote' | 'merged';
}

export class ConflictResolver {
  private conflicts: Map<string, ConflictRecord> = new Map();

  private getKey(entity: string, id: string): string {
    return `${entity}-${id}`;
  }

  detectConflict(local: any, remote: any): boolean {
    return JSON.stringify(local) !== JSON.stringify(remote);
  }

  addConflict(record: ConflictRecord): void {
    const key = this.getKey(record.entity, record.id);
    if (!this.conflicts.has(key)) {
      this.conflicts.set(key, record);
    }
  }

  getUnresolvedConflicts(): ConflictRecord[] {
    return Array.from(this.conflicts.values()).filter(c => !c.resolved);
  }

  resolve(conflictId: string, resolution: 'local' | 'remote' | 'merged', mergedData?: any): boolean {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return false;
    if (!['local', 'remote', 'merged'].includes(resolution)) return false;
    
    conflict.resolved = true;
    conflict.resolution = resolution;
    return true;
  }

  autoResolve(record: ConflictRecord, strategy: string): ConflictRecord {
    let resolution: 'local' | 'remote' = 'remote';
    
    if (strategy === 'last-write-wins') {
      resolution = record.localTimestamp > record.remoteTimestamp ? 'local' : 'remote';
    } else if (strategy === 'server-wins') {
      resolution = 'remote';
    } else if (strategy === 'client-wins') {
      resolution = 'local';
    }
    
    return {
      ...record,
      resolved: true,
      resolution,
    };
  }
}