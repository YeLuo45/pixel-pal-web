/**
 * Audit Engine
 * claude-code-design Audit Engine - Add + Validate + Verify + Stats
 */

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditEvent {
  id: string;
  action: string;
  severity: AuditSeverity;
  user: string;
  resolved: boolean;
  active: boolean;
  created: number;
  updated: number;
  hits: number;
}

export interface AueStats {
  events: number;
  totalResolved: number;
  totalUnresolved: number;
  info: number;
  warning: number;
  error: number;
  critical: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueActions: number;
  uniqueUsers: number;
  uniqueSeverities: number;
}

export class AuditEngine {
  private events: Map<string, AuditEvent> = new Map();
  private counter = 0;
  private totalResolved = 0;
  private totalUnresolved = 0;

  add(action: string, severity: AuditSeverity, user: string): string {
    const id = `aue-${++this.counter}`;
    this.events.set(id, {
      id,
      action,
      severity,
      user,
      resolved: false,
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    this.totalUnresolved++;
    return id;
  }

  resolve(id: string): boolean {
    const e = this.events.get(id);
    if (!e) return false;
    if (e.resolved) return false;
    e.resolved = true;
    e.updated = Date.now();
    e.hits++;
    this.totalResolved++;
    this.totalUnresolved = Math.max(0, this.totalUnresolved - 1);
    return true;
  }

  verify(id: string): boolean {
    const e = this.events.get(id);
    if (!e) return false;
    e.hits++;
    e.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.events.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const e = this.events.get(id);
    if (!e) return false;
    e.active = active;
    e.updated = Date.now();
    return true;
  }

  setSeverity(id: string, severity: AuditSeverity): boolean {
    const e = this.events.get(id);
    if (!e) return false;
    e.severity = severity;
    e.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const e of this.events.values()) {
      e.resolved = false;
      e.active = true;
      e.hits = 0;
    }
    this.totalResolved = 0;
    this.totalUnresolved = this.events.size;
  }

  getStats(): AueStats {
    const all = Array.from(this.events.values());
    return {
      events: all.length,
      totalResolved: this.totalResolved,
      totalUnresolved: this.totalUnresolved,
      info: all.filter(e => e.severity === 'info').length,
      warning: all.filter(e => e.severity === 'warning').length,
      error: all.filter(e => e.severity === 'error').length,
      critical: all.filter(e => e.severity === 'critical').length,
      active: all.filter(e => e.active).length,
      inactive: all.filter(e => !e.active).length,
      totalHits: all.reduce((s, e) => s + e.hits, 0),
      uniqueActions: new Set(all.map(e => e.action)).size,
      uniqueUsers: new Set(all.map(e => e.user)).size,
      uniqueSeverities: new Set(all.map(e => e.severity)).size,
    };
  }

  getEvent(id: string): AuditEvent | undefined {
    return this.events.get(id);
  }

  getAllEvents(): AuditEvent[] {
    return Array.from(this.events.values());
  }

  hasEvent(id: string): boolean {
    return this.events.has(id);
  }

  getCount(): number {
    return this.events.size;
  }

  getAction(id: string): string | undefined {
    return this.events.get(id)?.action;
  }

  getSeverity(id: string): AuditSeverity | undefined {
    return this.events.get(id)?.severity;
  }

  getUser(id: string): string | undefined {
    return this.events.get(id)?.user;
  }

  getHits(id: string): number {
    return this.events.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.events.get(id)?.active ?? false;
  }

  isResolved(id: string): boolean {
    return this.events.get(id)?.resolved ?? false;
  }

  getBySeverity(severity: AuditSeverity): AuditEvent[] {
    return Array.from(this.events.values()).filter(e => e.severity === severity);
  }

  getByUser(user: string): AuditEvent[] {
    return Array.from(this.events.values()).filter(e => e.user === user);
  }

  getByAction(action: string): AuditEvent[] {
    return Array.from(this.events.values()).filter(e => e.action === action);
  }

  getResolvedEvents(): AuditEvent[] {
    return Array.from(this.events.values()).filter(e => e.resolved);
  }

  getUnresolvedEvents(): AuditEvent[] {
    return Array.from(this.events.values()).filter(e => !e.resolved);
  }

  getActiveEvents(): AuditEvent[] {
    return Array.from(this.events.values()).filter(e => e.active);
  }

  getInactiveEvents(): AuditEvent[] {
    return Array.from(this.events.values()).filter(e => !e.active);
  }

  getAllActions(): string[] {
    return [...new Set(Array.from(this.events.values()).map(e => e.action))];
  }

  getAllUsers(): string[] {
    return [...new Set(Array.from(this.events.values()).map(e => e.user))];
  }

  getNewest(): AuditEvent | null {
    const all = Array.from(this.events.values());
    if (all.length === 0) return null;
    return all.reduce((max, e) => e.created > max.created ? e : max);
  }

  getOldest(): AuditEvent | null {
    const all = Array.from(this.events.values());
    if (all.length === 0) return null;
    return all.reduce((min, e) => e.created < min.created ? e : min);
  }

  getCreatedAt(id: string): number {
    return this.events.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.events.get(id)?.updated ?? 0;
  }

  getTotalResolved(): number {
    return this.totalResolved;
  }

  getTotalUnresolved(): number {
    return this.totalUnresolved;
  }

  clearAll(): void {
    this.events.clear();
    this.counter = 0;
    this.totalResolved = 0;
    this.totalUnresolved = 0;
  }
}

export default AuditEngine;