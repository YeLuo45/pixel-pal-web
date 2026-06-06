/**
 * Query Engine
 * generic-agent-design Query Engine - Register + Execute + Stats
 */

export type QueryType = 'select' | 'insert' | 'update' | 'delete';

export interface Query {
  id: string;
  type: QueryType;
  table: string;
  conditions: string;
  executed: boolean;
  resultCount: number;
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
}

export interface QreStats {
  queries: number;
  executed: number;
  pending: number;
  totalExecutions: number;
  totalResultCount: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueTables: number;
  avgResultCount: number;
  maxResultCount: number;
  minResultCount: number;
  selectCount: number;
  insertCount: number;
  updateCount: number;
  deleteCount: number;
  executionRate: number;
}

export class QueryEngine {
  private queries: Map<string, Query> = new Map();
  private counter = 0;
  private totalExecutions = 0;
  private totalResultCount = 0;

  register(type: QueryType, table: string, conditions: string = ''): string {
    const id = `qre-${++this.counter}`;
    this.queries.set(id, {
      id,
      type,
      table,
      conditions,
      executed: false,
      resultCount: 0,
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
    });
    return id;
  }

  execute(id: string, resultCount: number = 0): boolean {
    const q = this.queries.get(id);
    if (!q) return false;
    if (!q.active) return false;
    q.executed = true;
    q.resultCount = resultCount;
    q.history.push(Date.now());
    q.updated = Date.now();
    q.hits++;
    this.totalExecutions++;
    this.totalResultCount += resultCount;
    return true;
  }

  reset(id: string): boolean {
    const q = this.queries.get(id);
    if (!q) return false;
    q.executed = false;
    q.resultCount = 0;
    q.history = [];
    q.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.queries.delete(id);
  }

  resetAll(): void {
    for (const q of this.queries.values()) {
      q.executed = false;
      q.resultCount = 0;
      q.hits = 0;
      q.history = [];
      q.active = true;
    }
    this.totalExecutions = 0;
    this.totalResultCount = 0;
  }

  getStats(): QreStats {
    const all = Array.from(this.queries.values());
    const resultValues = all.map(q => q.resultCount);
    return {
      queries: all.length,
      executed: all.filter(q => q.executed).length,
      pending: all.filter(q => !q.executed).length,
      totalExecutions: this.totalExecutions,
      totalResultCount: this.totalResultCount,
      active: all.filter(q => q.active).length,
      inactive: all.filter(q => !q.active).length,
      totalHits: all.reduce((s, q) => s + q.hits, 0),
      uniqueTables: new Set(all.map(q => q.table)).size,
      avgResultCount: all.length > 0 ? Math.round((resultValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxResultCount: resultValues.length > 0 ? Math.max(...resultValues) : 0,
      minResultCount: resultValues.length > 0 ? Math.min(...resultValues) : 0,
      selectCount: all.filter(q => q.type === 'select').length,
      insertCount: all.filter(q => q.type === 'insert').length,
      updateCount: all.filter(q => q.type === 'update').length,
      deleteCount: all.filter(q => q.type === 'delete').length,
      executionRate: all.length > 0 ? Math.round((all.filter(q => q.executed).length / all.length) * 100) / 100 : 0,
    };
  }

  getQuery(id: string): Query | undefined {
    return this.queries.get(id);
  }

  getAllQueries(): Query[] {
    return Array.from(this.queries.values());
  }

  hasQuery(id: string): boolean {
    return this.queries.has(id);
  }

  getCount(): number {
    return this.queries.size;
  }

  getType(id: string): QueryType | undefined {
    return this.queries.get(id)?.type;
  }

  getTable(id: string): string | undefined {
    return this.queries.get(id)?.table;
  }

  getConditions(id: string): string | undefined {
    return this.queries.get(id)?.conditions;
  }

  getResultCount(id: string): number {
    return this.queries.get(id)?.resultCount ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.queries.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.queries.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.queries.get(id)?.active ?? false;
  }

  isExecuted(id: string): boolean {
    return this.queries.get(id)?.executed ?? false;
  }

  isPending(id: string): boolean {
    const q = this.queries.get(id);
    return q ? !q.executed : false;
  }

  isSelect(id: string): boolean {
    return this.queries.get(id)?.type === 'select';
  }

  isInsert(id: string): boolean {
    return this.queries.get(id)?.type === 'insert';
  }

  isUpdate(id: string): boolean {
    return this.queries.get(id)?.type === 'update';
  }

  isDelete(id: string): boolean {
    return this.queries.get(id)?.type === 'delete';
  }

  setActive(id: string, active: boolean): boolean {
    const q = this.queries.get(id);
    if (!q) return false;
    q.active = active;
    q.updated = Date.now();
    return true;
  }

  setConditions(id: string, conditions: string): boolean {
    const q = this.queries.get(id);
    if (!q) return false;
    q.conditions = conditions;
    q.updated = Date.now();
    return true;
  }

  getByType(type: QueryType): Query[] {
    return Array.from(this.queries.values()).filter(q => q.type === type);
  }

  getByTable(table: string): Query[] {
    return Array.from(this.queries.values()).filter(q => q.table === table);
  }

  getExecutedQueries(): Query[] {
    return Array.from(this.queries.values()).filter(q => q.executed);
  }

  getPendingQueries(): Query[] {
    return Array.from(this.queries.values()).filter(q => !q.executed);
  }

  getActiveQueries(): Query[] {
    return Array.from(this.queries.values()).filter(q => q.active);
  }

  getInactiveQueries(): Query[] {
    return Array.from(this.queries.values()).filter(q => !q.active);
  }

  getAllTables(): string[] {
    return [...new Set(Array.from(this.queries.values()).map(q => q.table))];
  }

  getTableCount(): number {
    return this.getAllTables().length;
  }

  getNewest(): Query | null {
    const all = Array.from(this.queries.values());
    if (all.length === 0) return null;
    return all.reduce((max, q) => q.created > max.created ? q : max);
  }

  getOldest(): Query | null {
    const all = Array.from(this.queries.values());
    if (all.length === 0) return null;
    return all.reduce((min, q) => q.created < min.created ? q : min);
  }

  getCreatedAt(id: string): number {
    return this.queries.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.queries.get(id)?.updated ?? 0;
  }

  getTotalExecutions(): number {
    return this.totalExecutions;
  }

  getTotalResultCount(): number {
    return this.totalResultCount;
  }

  clearAll(): void {
    this.queries.clear();
    this.counter = 0;
    this.totalExecutions = 0;
    this.totalResultCount = 0;
  }
}

export default QueryEngine;