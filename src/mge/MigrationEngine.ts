/**
 * Migration Engine
 * claude-code-design Migration Engine - Plan + Apply + Rollback + Stats
 */

export type MigrationStatus = 'pending' | 'applied' | 'rolled-back' | 'failed';

export interface Migration {
  id: string;
  name: string;
  version: string;
  status: MigrationStatus;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface MgeStats {
  migrations: number;
  totalApplied: number;
  totalRolledBack: number;
  totalFailed: number;
  pending: number;
  applied: number;
  rolledBack: number;
  failed: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  uniqueVersions: number;
}

export class MigrationEngine {
  private migrations: Map<string, Migration> = new Map();
  private counter = 0;
  private totalApplied = 0;
  private totalRolledBack = 0;
  private totalFailed = 0;

  plan(name: string, version: string): string {
    const id = `mge-${++this.counter}`;
    this.migrations.set(id, {
      id,
      name,
      version,
      status: 'pending',
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  apply(id: string): boolean {
    const m = this.migrations.get(id);
    if (!m) return false;
    if (!m.active) return false;
    if (m.status !== 'pending') return false;
    m.status = 'applied';
    m.updated = Date.now();
    m.hits++;
    this.totalApplied++;
    return true;
  }

  rollback(id: string): boolean {
    const m = this.migrations.get(id);
    if (!m) return false;
    if (m.status !== 'applied') return false;
    m.status = 'rolled-back';
    m.updated = Date.now();
    m.hits++;
    this.totalRolledBack++;
    return true;
  }

  fail(id: string): boolean {
    const m = this.migrations.get(id);
    if (!m) return false;
    m.status = 'failed';
    m.updated = Date.now();
    m.hits++;
    this.totalFailed++;
    return true;
  }

  remove(id: string): boolean {
    return this.migrations.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const m = this.migrations.get(id);
    if (!m) return false;
    m.active = active;
    m.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const m = this.migrations.get(id);
    if (!m) return false;
    m.name = name;
    m.updated = Date.now();
    return true;
  }

  setVersion(id: string, version: string): boolean {
    const m = this.migrations.get(id);
    if (!m) return false;
    m.version = version;
    m.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const m of this.migrations.values()) {
      m.status = 'pending';
      m.active = true;
      m.hits = 0;
    }
    this.totalApplied = 0;
    this.totalRolledBack = 0;
    this.totalFailed = 0;
  }

  getStats(): MgeStats {
    const all = Array.from(this.migrations.values());
    return {
      migrations: all.length,
      totalApplied: this.totalApplied,
      totalRolledBack: this.totalRolledBack,
      totalFailed: this.totalFailed,
      pending: all.filter(m => m.status === 'pending').length,
      applied: all.filter(m => m.status === 'applied').length,
      rolledBack: all.filter(m => m.status === 'rolled-back').length,
      failed: all.filter(m => m.status === 'failed').length,
      active: all.filter(m => m.active).length,
      inactive: all.filter(m => !m.active).length,
      totalHits: all.reduce((s, m) => s + m.hits, 0),
      uniqueNames: new Set(all.map(m => m.name)).size,
      uniqueVersions: new Set(all.map(m => m.version)).size,
    };
  }

  getMigration(id: string): Migration | undefined {
    return this.migrations.get(id);
  }

  getAllMigrations(): Migration[] {
    return Array.from(this.migrations.values());
  }

  hasMigration(id: string): boolean {
    return this.migrations.has(id);
  }

  getCount(): number {
    return this.migrations.size;
  }

  getName(id: string): string | undefined {
    return this.migrations.get(id)?.name;
  }

  getVersion(id: string): string | undefined {
    return this.migrations.get(id)?.version;
  }

  getStatus(id: string): MigrationStatus | undefined {
    return this.migrations.get(id)?.status;
  }

  getHits(id: string): number {
    return this.migrations.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.migrations.get(id)?.active ?? false;
  }

  isApplied(id: string): boolean {
    return this.migrations.get(id)?.status === 'applied';
  }

  isRolledBack(id: string): boolean {
    return this.migrations.get(id)?.status === 'rolled-back';
  }

  isFailed(id: string): boolean {
    return this.migrations.get(id)?.status === 'failed';
  }

  isPending(id: string): boolean {
    return this.migrations.get(id)?.status === 'pending';
  }

  getByStatus(status: MigrationStatus): Migration[] {
    return Array.from(this.migrations.values()).filter(m => m.status === status);
  }

  getActiveMigrations(): Migration[] {
    return Array.from(this.migrations.values()).filter(m => m.active);
  }

  getInactiveMigrations(): Migration[] {
    return Array.from(this.migrations.values()).filter(m => !m.active);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.migrations.values()).map(m => m.name))];
  }

  getAllVersions(): string[] {
    return [...new Set(Array.from(this.migrations.values()).map(m => m.version))];
  }

  getNewest(): Migration | null {
    const all = Array.from(this.migrations.values());
    if (all.length === 0) return null;
    return all.reduce((max, m) => m.created > max.created ? m : max);
  }

  getOldest(): Migration | null {
    const all = Array.from(this.migrations.values());
    if (all.length === 0) return null;
    return all.reduce((min, m) => m.created < min.created ? m : min);
  }

  getCreatedAt(id: string): number {
    return this.migrations.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.migrations.get(id)?.updated ?? 0;
  }

  getTotalApplied(): number {
    return this.totalApplied;
  }

  getTotalRolledBack(): number {
    return this.totalRolledBack;
  }

  getTotalFailed(): number {
    return this.totalFailed;
  }

  clearAll(): void {
    this.migrations.clear();
    this.counter = 0;
    this.totalApplied = 0;
    this.totalRolledBack = 0;
    this.totalFailed = 0;
  }
}

export default MigrationEngine;