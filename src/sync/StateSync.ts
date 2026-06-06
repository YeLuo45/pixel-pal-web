/**
 * State Sync
 * nanobot-design State Sync - RegisterNode + Publish + Sync + Stats
 */

export interface NodeState {
  id: string;
  nodeId: string;
  state: unknown;
  version: number;
  synced: boolean;
  created: number;
  updated: number;
}

export interface SyncStats {
  nodes: number;
  total: number;
  synced: number;
  unsynced: number;
  syncCount: number;
  avgVersion: number;
}

export class StateSync {
  private states: Map<string, NodeState> = new Map();
  private counter = 0;
  private syncCount = 0;

  registerNode(nodeId: string): string {
    const id = `st-${++this.counter}`;
    this.states.set(id, {
      id,
      nodeId,
      state: null,
      version: 0,
      synced: false,
      created: Date.now(),
      updated: Date.now(),
    });
    return id;
  }

  publish(nodeId: string, state: unknown): boolean {
    const entry = Array.from(this.states.values()).find(s => s.nodeId === nodeId);
    if (!entry) return false;
    entry.state = state;
    entry.version++;
    entry.synced = false;
    entry.updated = Date.now();
    return true;
  }

  sync(): number {
    this.syncCount++;
    let count = 0;
    for (const s of this.states.values()) {
      if (!s.synced) {
        s.synced = true;
        count++;
      }
    }
    return count;
  }

  getStats(): SyncStats {
    const all = Array.from(this.states.values());
    return {
      nodes: all.length,
      total: all.length,
      synced: all.filter(s => s.synced).length,
      unsynced: all.filter(s => !s.synced).length,
      syncCount: this.syncCount,
      avgVersion: all.length > 0 ? Math.round((all.reduce((s, x) => s + x.version, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getState(id: string): NodeState | undefined {
    return this.states.get(id);
  }

  getAllStates(): NodeState[] {
    return Array.from(this.states.values());
  }

  removeState(id: string): boolean {
    return this.states.delete(id);
  }

  hasState(id: string): boolean {
    return this.states.has(id);
  }

  getCount(): number {
    return this.states.size;
  }

  getNodeId(id: string): string | undefined {
    return this.states.get(id)?.nodeId;
  }

  getStateValue(id: string): unknown {
    return this.states.get(id)?.state;
  }

  getVersion(id: string): number {
    return this.states.get(id)?.version ?? 0;
  }

  isSynced(id: string): boolean {
    return this.states.get(id)?.synced ?? false;
  }

  getByNodeId(nodeId: string): NodeState[] {
    return Array.from(this.states.values()).filter(s => s.nodeId === nodeId);
  }

  getSyncedStates(): NodeState[] {
    return Array.from(this.states.values()).filter(s => s.synced);
  }

  getUnsyncedStates(): NodeState[] {
    return Array.from(this.states.values()).filter(s => !s.synced);
  }

  getAllNodeIds(): string[] {
    return [...new Set(Array.from(this.states.values()).map(s => s.nodeId))];
  }

  getNodeIdCount(): number {
    return this.getAllNodeIds().length;
  }

  getSyncCount(): number {
    return this.syncCount;
  }

  getCreatedAt(id: string): number {
    return this.states.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.states.get(id)?.updated ?? 0;
  }

  getMostRecent(): NodeState | null {
    const all = Array.from(this.states.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.updated > max.updated ? s : max);
  }

  getOldest(): NodeState | null {
    const all = Array.from(this.states.values());
    if (all.length === 0) return null;
    return all.reduce((min, s) => s.created < min.created ? s : min);
  }

  getHighestVersion(): NodeState | null {
    const all = Array.from(this.states.values());
    if (all.length === 0) return null;
    return all.reduce((max, s) => s.version > max.version ? s : max);
  }

  markUnsynced(id: string): boolean {
    const s = this.states.get(id);
    if (!s) return false;
    s.synced = false;
    return true;
  }

  markSynced(id: string): boolean {
    const s = this.states.get(id);
    if (!s) return false;
    s.synced = true;
    return true;
  }

  forceSyncAll(): number {
    let count = 0;
    for (const s of this.states.values()) {
      if (!s.synced) {
        s.synced = true;
        count++;
      }
    }
    return count;
  }

  resetVersions(): void {
    for (const s of this.states.values()) {
      s.version = 0;
      s.synced = false;
    }
  }

  resetSyncCount(): void {
    this.syncCount = 0;
  }

  clearAll(): void {
    this.states.clear();
    this.counter = 0;
    this.syncCount = 0;
  }
}

export default StateSync;