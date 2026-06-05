/**
 * Action Sequencer
 * thunderbolt-design Action Sequencer - Define + Execute + Reset + Stats
 */

export interface Action {
  id: string;
  name: string;
  order: number;
  executed: boolean;
  result: unknown;
  created: number;
  executedAt: number;
  duration: number;
  error: string;
}

export interface SeqStats {
  total: number;
  executed: number;
  pending: number;
  errors: number;
  avgDuration: number;
}

export class ActionSequencer {
  private actions: Map<string, Action> = new Map();
  private counter = 0;

  define(name: string, order: number): string {
    const id = `act-${++this.counter}`;
    this.actions.set(id, {
      id,
      name,
      order,
      executed: false,
      result: null,
      created: Date.now(),
      executedAt: 0,
      duration: 0,
      error: '',
    });
    return id;
  }

  execute(id: string, fn: () => unknown): unknown {
    const a = this.actions.get(id);
    if (!a) return null;
    const start = Date.now();
    try {
      a.result = fn();
      a.executed = true;
    } catch (e) {
      a.error = (e as Error).message;
    }
    a.executedAt = Date.now();
    a.duration = a.executedAt - start;
    return a.result;
  }

  reset(): void {
    for (const a of this.actions.values()) {
      a.executed = false;
      a.result = null;
      a.executedAt = 0;
      a.duration = 0;
      a.error = '';
    }
  }

  getStats(): SeqStats {
    const all = Array.from(this.actions.values());
    const executed = all.filter(a => a.executed);
    return {
      total: all.length,
      executed: executed.length,
      pending: all.filter(a => !a.executed).length,
      errors: all.filter(a => a.error !== '').length,
      avgDuration: executed.length > 0 ? Math.round((executed.reduce((s, a) => s + a.duration, 0) / executed.length) * 100) / 100 : 0,
    };
  }

  getAction(id: string): Action | undefined {
    return this.actions.get(id);
  }

  getAllActions(): Action[] {
    return Array.from(this.actions.values());
  }

  removeAction(id: string): boolean {
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

  getOrder(id: string): number {
    return this.actions.get(id)?.order ?? 0;
  }

  getResult(id: string): unknown {
    return this.actions.get(id)?.result;
  }

  getError(id: string): string {
    return this.actions.get(id)?.error ?? '';
  }

  getDuration(id: string): number {
    return this.actions.get(id)?.duration ?? 0;
  }

  isExecuted(id: string): boolean {
    return this.actions.get(id)?.executed ?? false;
  }

  isPending(id: string): boolean {
    return !this.isExecuted(id);
  }

  hasError(id: string): boolean {
    return this.actions.get(id)?.error !== '';
  }

  setOrder(id: string, order: number): boolean {
    const a = this.actions.get(id);
    if (!a) return false;
    a.order = order;
    return true;
  }

  setName(id: string, name: string): boolean {
    const a = this.actions.get(id);
    if (!a) return false;
    a.name = name;
    return true;
  }

  getCreatedAt(id: string): number {
    return this.actions.get(id)?.created ?? 0;
  }

  getExecutedAt(id: string): number {
    return this.actions.get(id)?.executedAt ?? 0;
  }

  getByName(name: string): Action[] {
    return Array.from(this.actions.values()).filter(a => a.name === name);
  }

  getExecutedActions(): Action[] {
    return Array.from(this.actions.values()).filter(a => a.executed);
  }

  getPendingActions(): Action[] {
    return Array.from(this.actions.values()).filter(a => !a.executed);
  }

  getErroredActions(): Action[] {
    return Array.from(this.actions.values()).filter(a => a.error !== '');
  }

  getSortedByOrder(): Action[] {
    return [...Array.from(this.actions.values())].sort((a, b) => a.order - b.order);
  }

  getNextPending(): Action | null {
    const pending = this.getPendingActions();
    if (pending.length === 0) return null;
    return pending.sort((a, b) => a.order - b.order)[0];
  }

  getLongest(): Action | null {
    const executed = this.getExecutedActions();
    if (executed.length === 0) return null;
    return executed.reduce((max, a) => a.duration > max.duration ? a : max);
  }

  getShortest(): Action | null {
    const executed = this.getExecutedActions();
    if (executed.length === 0) return null;
    return executed.reduce((min, a) => a.duration < min.duration ? a : min);
  }

  executeAll(fn: (id: string) => unknown): number {
    let count = 0;
    for (const a of this.actions.values()) {
      if (!a.executed) {
        this.execute(a.id, () => fn(a.id));
        count++;
      }
    }
    return count;
  }

  clearAll(): void {
    this.actions.clear();
    this.counter = 0;
  }
}

export default ActionSequencer;