/**
 * Token Engine
 * nanobot-design Token Engine - Issue + Verify + Revoke + Stats
 */

export type TokenState = 'valid' | 'expired' | 'revoked';

export interface Token {
  id: string;
  value: string;
  subject: string;
  state: TokenState;
  expiresAt: number;
  created: number;
  updated: number;
  hits: number;
  active: boolean;
}

export interface TkeStats {
  tokens: number;
  totalIssued: number;
  totalVerified: number;
  totalRevoked: number;
  totalExpired: number;
  valid: number;
  expired: number;
  revoked: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueSubjects: number;
  totalValueLen: number;
  avgValueLen: number;
  maxValueLen: number;
}

export class TokenEngine {
  private tokens: Map<string, Token> = new Map();
  private counter = 0;
  private totalIssued = 0;
  private totalVerified = 0;
  private totalRevoked = 0;
  private totalExpired = 0;
  private totalValueLen = 0;

  issue(subject: string, expiresIn: number): string {
    const id = `tke-${++this.counter}`;
    const value = `tok-${Math.random().toString(36).slice(2, 12)}-${Date.now().toString(36)}`;
    this.tokens.set(id, {
      id,
      value,
      subject,
      state: 'valid',
      expiresAt: Date.now() + expiresIn,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      active: true,
    });
    this.totalIssued++;
    this.totalValueLen += value.length;
    return id;
  }

  verify(id: string): boolean {
    const t = this.tokens.get(id);
    if (!t) return false;
    if (!t.active) return false;
    if (t.state === 'revoked') return false;
    if (Date.now() > t.expiresAt) {
      t.state = 'expired';
      t.updated = Date.now();
      this.totalExpired++;
      return false;
    }
    t.hits++;
    t.updated = Date.now();
    this.totalVerified++;
    return true;
  }

  revoke(id: string): boolean {
    const t = this.tokens.get(id);
    if (!t) return false;
    if (!t.active) return false;
    t.state = 'revoked';
    t.updated = Date.now();
    this.totalRevoked++;
    return true;
  }

  expire(id: string): boolean {
    const t = this.tokens.get(id);
    if (!t) return false;
    t.state = 'expired';
    t.updated = Date.now();
    return true;
  }

  remove(id: string): boolean {
    return this.tokens.delete(id);
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.tokens.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setSubject(id: string, subject: string): boolean {
    const t = this.tokens.get(id);
    if (!t) return false;
    t.subject = subject;
    t.updated = Date.now();
    return true;
  }

  setExpiresAt(id: string, expiresAt: number): boolean {
    const t = this.tokens.get(id);
    if (!t) return false;
    t.expiresAt = expiresAt;
    t.updated = Date.now();
    return true;
  }

  setState(id: string, state: TokenState): boolean {
    const t = this.tokens.get(id);
    if (!t) return false;
    t.state = state;
    t.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const t of this.tokens.values()) {
      t.state = 'valid';
      t.active = true;
      t.hits = 0;
    }
    this.totalIssued = 0;
    this.totalVerified = 0;
    this.totalRevoked = 0;
    this.totalExpired = 0;
    this.totalValueLen = 0;
  }

  getStats(): TkeStats {
    const all = Array.from(this.tokens.values());
    const vArr = all.map(t => t.value.length);
    return {
      tokens: all.length,
      totalIssued: this.totalIssued,
      totalVerified: this.totalVerified,
      totalRevoked: this.totalRevoked,
      totalExpired: this.totalExpired,
      valid: all.filter(t => t.state === 'valid').length,
      expired: all.filter(t => t.state === 'expired').length,
      revoked: all.filter(t => t.state === 'revoked').length,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      uniqueSubjects: new Set(all.map(t => t.subject)).size,
      totalValueLen: this.totalValueLen,
      avgValueLen: all.length > 0 ? Math.round((vArr.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxValueLen: vArr.length > 0 ? Math.max(...vArr) : 0,
    };
  }

  getToken(id: string): Token | undefined {
    return this.tokens.get(id);
  }

  getAllTokens(): Token[] {
    return Array.from(this.tokens.values());
  }

  hasToken(id: string): boolean {
    return this.tokens.has(id);
  }

  getCount(): number {
    return this.tokens.size;
  }

  getValue(id: string): string | undefined {
    return this.tokens.get(id)?.value;
  }

  getSubject(id: string): string | undefined {
    return this.tokens.get(id)?.subject;
  }

  getState(id: string): TokenState | undefined {
    return this.tokens.get(id)?.state;
  }

  getExpiresAt(id: string): number {
    return this.tokens.get(id)?.expiresAt ?? 0;
  }

  getHits(id: string): number {
    return this.tokens.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.tokens.get(id)?.active ?? false;
  }

  isValid(id: string): boolean {
    return this.tokens.get(id)?.state === 'valid';
  }

  isExpired(id: string): boolean {
    return this.tokens.get(id)?.state === 'expired';
  }

  isRevoked(id: string): boolean {
    return this.tokens.get(id)?.state === 'revoked';
  }

  getByState(state: TokenState): Token[] {
    return Array.from(this.tokens.values()).filter(t => t.state === state);
  }

  getActiveTokens(): Token[] {
    return Array.from(this.tokens.values()).filter(t => t.active);
  }

  getInactiveTokens(): Token[] {
    return Array.from(this.tokens.values()).filter(t => !t.active);
  }

  getAllSubjects(): string[] {
    return [...new Set(Array.from(this.tokens.values()).map(t => t.subject))];
  }

  getNewest(): Token | null {
    const all = Array.from(this.tokens.values());
    if (all.length === 0) return null;
    return all.reduce((max, t) => t.created > max.created ? t : max);
  }

  getOldest(): Token | null {
    const all = Array.from(this.tokens.values());
    if (all.length === 0) return null;
    return all.reduce((min, t) => t.created < min.created ? t : min);
  }

  getCreatedAt(id: string): number {
    return this.tokens.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.tokens.get(id)?.updated ?? 0;
  }

  getTotalIssued(): number {
    return this.totalIssued;
  }

  getTotalVerified(): number {
    return this.totalVerified;
  }

  getTotalRevoked(): number {
    return this.totalRevoked;
  }

  getTotalExpired(): number {
    return this.totalExpired;
  }

  clearAll(): void {
    this.tokens.clear();
    this.counter = 0;
    this.totalIssued = 0;
    this.totalVerified = 0;
    this.totalRevoked = 0;
    this.totalExpired = 0;
    this.totalValueLen = 0;
  }
}

export default TokenEngine;