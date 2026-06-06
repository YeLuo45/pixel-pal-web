/**
 * Agent Engine
 * nanobot-design Agent Engine - Spawn + Assign + Release + Stats
 */

export type AgentState = 'idle' | 'busy' | 'offline';

export interface Agent {
  id: string;
  name: string;
  task: string;
  state: AgentState;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface AgeStats {
  agents: number;
  totalSpawned: number;
  totalReleased: number;
  idle: number;
  busy: number;
  offline: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueTasks: number;
  emptyTask: number;
  busyPercent: number;
  idlePercent: number;
  offlinePercent: number;
}

export class AgentEngine {
  private agents: Map<string, Agent> = new Map();
  private counter = 0;
  private totalSpawned = 0;
  private totalReleased = 0;

  spawn(name: string): string {
    const id = `age-${++this.counter}`;
    this.agents.set(id, {
      id,
      name,
      task: '',
      state: 'idle',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalSpawned++;
    return id;
  }

  assign(id: string, task: string): boolean {
    const a = this.agents.get(id);
    if (!a) return false;
    if (!a.active) return false;
    if (a.state === 'offline') return false;
    a.task = task;
    a.state = 'busy';
    a.updated = Date.now();
    a.hits++;
    return true;
  }

  release(id: string): boolean {
    const a = this.agents.get(id);
    if (!a) return false;
    a.task = '';
    a.state = 'idle';
    a.updated = Date.now();
    a.hits++;
    this.totalReleased++;
    return true;
  }

  goOffline(id: string): boolean {
    const a = this.agents.get(id);
    if (!a) return false;
    a.state = 'offline';
    a.updated = Date.now();
    a.hits++;
    return true;
  }

  goOnline(id: string): boolean {
    const a = this.agents.get(id);
    if (!a) return false;
    a.state = 'idle';
    a.updated = Date.now();
    a.hits++;
    return true;
  }

  remove(id: string): boolean {
    return this.agents.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const a = this.agents.get(id);
    if (!a) return false;
    a.active = active;
    a.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const a of this.agents.values()) {
      a.task = '';
      a.state = 'idle';
      a.active = true;
      a.hits = 0;
    }
    this.totalSpawned = 0;
    this.totalReleased = 0;
  }

  getStats(): AgeStats {
    const all = Array.from(this.agents.values());
    const total = all.length;
    return {
      agents: total,
      totalSpawned: this.totalSpawned,
      totalReleased: this.totalReleased,
      idle: all.filter(a => a.state === 'idle').length,
      busy: all.filter(a => a.state === 'busy').length,
      offline: all.filter(a => a.state === 'offline').length,
      active: all.filter(a => a.active).length,
      inactive: all.filter(a => !a.active).length,
      totalHits: all.reduce((s, a) => s + a.hits, 0),
      uniqueNames: new Set(all.map(a => a.name)).size,
      uniqueTasks: new Set(all.map(a => a.task).filter(t => t !== '')).size,
      emptyTask: all.filter(a => a.task === '').length,
      busyPercent: total > 0 ? Math.round((all.filter(a => a.state === 'busy').length / total) * 100) : 0,
      idlePercent: total > 0 ? Math.round((all.filter(a => a.state === 'idle').length / total) * 100) : 0,
      offlinePercent: total > 0 ? Math.round((all.filter(a => a.state === 'offline').length / total) * 100) : 0,
    };
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  hasAgent(id: string): boolean {
    return this.agents.has(id);
  }

  getCount(): number {
    return this.agents.size;
  }

  getName(id: string): string | undefined {
    return this.agents.get(id)?.name;
  }

  getTask(id: string): string | undefined {
    return this.agents.get(id)?.task;
  }

  getState(id: string): AgentState | undefined {
    return this.agents.get(id)?.state;
  }

  getHits(id: string): number {
    return this.agents.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.agents.get(id)?.active ?? false;
  }

  isIdle(id: string): boolean {
    return this.agents.get(id)?.state === 'idle';
  }

  isBusy(id: string): boolean {
    return this.agents.get(id)?.state === 'busy';
  }

  isOffline(id: string): boolean {
    return this.agents.get(id)?.state === 'offline';
  }

  getByState(state: AgentState): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.state === state);
  }

  getByTask(task: string): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.task === task);
  }

  getActiveAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.active);
  }

  getInactiveAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(a => !a.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.agents.values()).map(a => a.name))];
  }

  getAllTasks(): string[] {
    return [...new Set(Array.from(this.agents.values()).map(a => a.task).filter(t => t !== ''))];
  }

  getNewest(): Agent | null {
    const all = Array.from(this.agents.values());
    if (all.length === 0) return null;
    return all.reduce((max, a) => a.created > max.created ? a : max);
  }

  getOldest(): Agent | null {
    const all = Array.from(this.agents.values());
    if (all.length === 0) return null;
    return all.reduce((min, a) => a.created < min.created ? a : min);
  }

  getCreatedAt(id: string): number {
    return this.agents.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.agents.get(id)?.updated ?? 0;
  }

  getTotalSpawned(): number {
    return this.totalSpawned;
  }

  getTotalReleased(): number {
    return this.totalReleased;
  }

  clearAll(): void {
    this.agents.clear();
    this.counter = 0;
    this.totalSpawned = 0;
    this.totalReleased = 0;
  }
}

export default AgentEngine;