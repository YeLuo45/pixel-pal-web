/**
 * Tool Manager
 * generic-agent-design Tool Manager - Register + Invoke + Stats
 */

export interface Tool {
  id: string;
  name: string;
  description: string;
  invocations: number;
  successes: number;
  failures: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: boolean[];
}

export interface TMStats {
  tools: number;
  totalInvocations: number;
  totalSuccess: number;
  totalFailures: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgInvocations: number;
  successRate: number;
}

export class ToolManager {
  private tools: Map<string, Tool> = new Map();
  private counter = 0;
  private totalInvocations = 0;
  private totalSuccess = 0;
  private totalFailures = 0;

  register(name: string, description: string): string {
    const id = `tm-${++this.counter}`;
    this.tools.set(id, {
      id,
      name,
      description,
      invocations: 0,
      successes: 0,
      failures: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  invoke(id: string, success: boolean = true): boolean {
    const t = this.tools.get(id);
    if (!t) return false;
    if (!t.active) return false;
    t.invocations++;
    t.history.push(success);
    t.updated = Date.now();
    t.hits++;
    this.totalInvocations++;
    if (success) {
      t.successes++;
      this.totalSuccess++;
    } else {
      t.failures++;
      this.totalFailures++;
    }
    return true;
  }

  getStats(): TMStats {
    const all = Array.from(this.tools.values());
    return {
      tools: all.length,
      totalInvocations: this.totalInvocations,
      totalSuccess: this.totalSuccess,
      totalFailures: this.totalFailures,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      uniqueNames: new Set(all.map(t => t.name)).size,
      avgInvocations: all.length > 0 ? Math.round((all.reduce((s, t) => s + t.invocations, 0) / all.length) * 100) / 100 : 0,
      successRate: this.totalInvocations > 0 ? Math.round((this.totalSuccess / this.totalInvocations) * 100) / 100 : 0,
    };
  }

  getTool(id: string): Tool | undefined {
    return this.tools.get(id);
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  removeTool(id: string): boolean {
    return this.tools.delete(id);
  }

  hasTool(id: string): boolean {
    return this.tools.has(id);
  }

  getCount(): number {
    return this.tools.size;
  }

  getName(id: string): string | undefined {
    return this.tools.get(id)?.name;
  }

  getDescription(id: string): string | undefined {
    return this.tools.get(id)?.description;
  }

  getInvocations(id: string): number {
    return this.tools.get(id)?.invocations ?? 0;
  }

  getSuccesses(id: string): number {
    return this.tools.get(id)?.successes ?? 0;
  }

  getFailures(id: string): number {
    return this.tools.get(id)?.failures ?? 0;
  }

  getHistory(id: string): boolean[] {
    return [...(this.tools.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.tools.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.tools.get(id)?.active ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.tools.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const t = this.tools.get(id);
    if (!t) return false;
    t.name = name;
    t.updated = Date.now();
    return true;
  }

  setDescription(id: string, description: string): boolean {
    const t = this.tools.get(id);
    if (!t) return false;
    t.description = description;
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.tools.values()) {
      t.invocations = 0;
      t.successes = 0;
      t.failures = 0;
      t.hits = 0;
      t.history = [];
      t.active = true;
    }
    this.totalInvocations = 0;
    this.totalSuccess = 0;
    this.totalFailures = 0;
  }

  getByName(name: string): Tool[] {
    return Array.from(this.tools.values()).filter(t => t.name === name);
  }

  getActiveTools(): Tool[] {
    return Array.from(this.tools.values()).filter(t => t.active);
  }

  getInactiveTools(): Tool[] {
    return Array.from(this.tools.values()).filter(t => !t.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.tools.values()).map(t => t.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinInvocations(min: number): Tool[] {
    return Array.from(this.tools.values()).filter(t => t.invocations >= min);
  }

  getMostInvocations(): Tool | null {
    const all = Array.from(this.tools.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.invocations > max.invocations ? t : max);
  }

  getNewest(): Tool | null {
    const all = Array.from(this.tools.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): Tool | null {
    const all = Array.from(this.tools.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
  }

  getCreatedAt(id: string): number {
    return this.tools.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.tools.get(id)?.updated ?? 0;
  }

  getTotalInvocations(): number {
    return this.totalInvocations;
  }

  getTotalSuccess(): number {
    return this.totalSuccess;
  }

  getTotalFailures(): number {
    return this.totalFailures;
  }

  clearAll(): void {
    this.tools.clear();
    this.counter = 0;
    this.totalInvocations = 0;
    this.totalSuccess = 0;
    this.totalFailures = 0;
  }
}

export default ToolManager;