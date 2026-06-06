/**
 * Action Coordinator
 * thunderbolt-design Action Coordinator - Register + Coordinate + Stats
 */

export type ActionState = 'pending' | 'running' | 'done' | 'failed';

export interface CoordinatedAction {
  id: string;
  name: string;
  status: ActionState;
  coordinatedWith: string[];
  created: number;
  updated: number;
  hits: number;
  coordinatedCount: number;
}

export interface ACStats {
  actions: number;
  pending: number;
  running: number;
  done: number;
  failed: number;
  coordinated: number;
  totalRelations: number;
}

export class ActionCoordinator {
  private actions: Map<string, CoordinatedAction> = new Map();
  private counter = 0;
  private totalRelations = 0;

  register(name: string): string {
    const id = `ac-${++this.counter}`;
    this.actions.set(id, {
      id,
      name,
      status: 'pending',
      coordinatedWith: [],
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      coordinatedCount: 0,
    });
    return id;
  }

  coordinate(id1: string, id2: string): boolean {
    const a1 = this.actions.get(id1);
    const a2 = this.actions.get(id2);
    if (!a1 || !a2) return false;
    if (a1.coordinatedWith.includes(id2)) return false;
    a1.coordinatedWith.push(id2);
    a2.coordinatedWith.push(id1);
    a1.coordinatedCount++;
    a2.coordinatedCount++;
    a1.updated = Date.now();
    a2.updated = Date.now();
    this.totalRelations++;
    return true;
  }

  getStats(): ACStats {
    const all = Array.from(this.actions.values());
    const coordinated = all.filter(a => a.coordinatedWith.length > 0).length;
    return {
      actions: all.length,
      pending: all.filter(a => a.status === 'pending').length,
      running: all.filter(a => a.status === 'running').length,
      done: all.filter(a => a.status === 'done').length,
      failed: all.filter(a => a.status === 'failed').length,
      coordinated,
      totalRelations: this.totalRelations,
    };
  }

  getAction(id: string): CoordinatedAction | undefined {
    return this.actions.get(id);
  }

  getAllActions(): CoordinatedAction[] {
    return Array.from(this.actions.values());
  }

  removeAction(id: string): boolean {
    const a = this.actions.get(id);
    if (!a) return false;
    for (const otherId of a.coordinatedWith) {
      const other = this.actions.get(otherId);
      if (other) {
        other.coordinatedWith = other.coordinatedWith.filter(x => x !== id);
        this.totalRelations--;
      }
    }
    return this.actions.delete(id);
  }

  hasAction(id: string): boolean {
    return this.actions.has(id);
  }

  getCount(): number {
    return this.actions.size;
  }

  getName(id: string): string | undefined {
    return this.actions.get(id)?.name;
  }

  getStatus(id: string): ActionState | undefined {
    return this.actions.get(id)?.status;
  }

  getCoordinatedWith(id: string): string[] {
    return [...(this.actions.get(id)?.coordinatedWith ?? [])];
  }

  getCoordinatedCount(id: string): number {
    return this.getCoordinatedWith(id).length;
  }

  getHits(id: string): number {
    return this.actions.get(id)?.hits ?? 0;
  }

  isPending(id: string): boolean {
    return this.actions.get(id)?.status === 'pending';
  }

  isRunning(id: string): boolean {
    return this.actions.get(id)?.status === 'running';
  }

  isDone(id: string): boolean {
    return this.actions.get(id)?.status === 'done';
  }

  isFailed(id: string): boolean {
    return this.actions.get(id)?.status === 'failed';
  }

  isCoordinated(id: string): boolean {
    return this.getCoordinatedCount(id) > 0;
  }

  isCoordinatedWith(id1: string, id2: string): boolean {
    return this.actions.get(id1)?.coordinatedWith.includes(id2) ?? false;
  }

  setStatus(id: string, status: ActionState): boolean {
    const a = this.actions.get(id);
    if (!a) return false;
    a.status = status;
    a.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const a = this.actions.get(id);
    if (!a) return false;
    a.name = name;
    a.updated = Date.now();
    return true;
  }

  start(id: string): boolean {
    return this.setStatus(id, 'running');
  }

  complete(id: string): boolean {
    return this.setStatus(id, 'done');
  }

  fail(id: string): boolean {
    return this.setStatus(id, 'failed');
  }

  touch(id: string): boolean {
    const a = this.actions.get(id);
    if (!a) return false;
    a.hits++;
    a.updated = Date.now();
    return true;
  }

  uncoordinate(id1: string, id2: string): boolean {
    const a1 = this.actions.get(id1);
    const a2 = this.actions.get(id2);
    if (!a1 || !a2) return false;
    if (!a1.coordinatedWith.includes(id2)) return false;
    a1.coordinatedWith = a1.coordinatedWith.filter(x => x !== id2);
    a2.coordinatedWith = a2.coordinatedWith.filter(x => x !== id1);
    a1.coordinatedCount--;
    a2.coordinatedCount--;
    this.totalRelations--;
    return true;
  }

  resetHits(): void {
    for (const a of this.actions.values()) a.hits = 0;
  }

  resetAll(): void {
    for (const a of this.actions.values()) {
      a.hits = 0;
      a.status = 'pending';
      a.coordinatedWith = [];
      a.coordinatedCount = 0;
    }
    this.totalRelations = 0;
  }

  getByName(name: string): CoordinatedAction[] {
    return Array.from(this.actions.values()).filter(a => a.name === name);
  }

  getByStatus(status: ActionState): CoordinatedAction[] {
    return Array.from(this.actions.values()).filter(a => a.status === status);
  }

  getPendingActions(): CoordinatedAction[] {
    return this.getByStatus('pending');
  }

  getRunningActions(): CoordinatedAction[] {
    return this.getByStatus('running');
  }

  getDoneActions(): CoordinatedAction[] {
    return this.getByStatus('done');
  }

  getFailedActions(): CoordinatedAction[] {
    return this.getByStatus('failed');
  }

  getCoordinatedActions(): CoordinatedAction[] {
    return Array.from(this.actions.values()).filter(a => a.coordinatedWith.length > 0);
  }

  getUncoordinatedActions(): CoordinatedAction[] {
    return Array.from(this.actions.values()).filter(a => a.coordinatedWith.length === 0);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.actions.values()).map(a => a.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinCoordination(min: number): CoordinatedAction[] {
    return Array.from(this.actions.values()).filter(a => a.coordinatedCount >= min);
  }

  getMostCoordinated(): CoordinatedAction | null {
    const all = Array.from(this.actions.values());
    if (all.length === 0) return null;
    return all.reduce((max, a) => a.coordinatedCount > max.coordinatedCount ? a : max);
  }

  getNewest(): CoordinatedAction | null {
    const all = Array.from(this.actions.values());
    if (all.length === 0) return null;
    return all.reduce((max, a) => a.created > max.created ? a : max);
  }

  getOldest(): CoordinatedAction | null {
    const all = Array.from(this.actions.values());
    if (all.length === 0) return null;
    return all.reduce((min, a) => a.created < min.created ? a : min);
  }

  getCreatedAt(id: string): number {
    return this.actions.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.actions.get(id)?.updated ?? 0;
  }

  getTotalRelations(): number {
    return this.totalRelations;
  }

  resetTotalRelations(): void {
    this.totalRelations = 0;
  }

  clearAll(): void {
    this.actions.clear();
    this.counter = 0;
    this.totalRelations = 0;
  }
}

export default ActionCoordinator;