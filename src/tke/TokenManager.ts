/**
 * Token Manager
 * thunderbolt-design Token Manager - Issue + Validate + Revoke + Stats
 */

export interface Token {
  id: string;
  value: string;
  scope: string;
  valid: boolean;
  created: number;
  expires: number;
  updated: number;
  active: boolean;
  hits: number;
  history: number[];
  validated: number;
  revoked: number;
}

export interface TkeStats {
  tokens: number;
  valid: number;
  invalid: number;
  revoked: number;
  expired: number;
  active: number;
  inactive: number;
  totalHits: number;
  totalValidations: number;
  totalRevocations: number;
  uniqueScopes: number;
  avgScopeLength: number;
  avgValueLength: number;
  maxValueLength: number;
  minValueLength: number;
}

export class TokenManager {
  private tokens: Map<string, Token> = new Map();
  private counter = 0;
  private totalValidations = 0;
  private totalRevocations = 0;
  private expiredCount = 0;

  issue(scope: string, expires: number = 0, value?: string): string {
    const id = `tke-${++this.counter}`;
    const tokenValue = value ?? `tkn-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    this.tokens.set(id, {
      id,
      value: tokenValue,
      scope,
      valid: true,
      created: Date.now(),
      expires: expires > 0 ? Date.now() + expires : 0,
      updated: Date.now(),
      active: true,
      hits: 0,
      history: [],
      validated: 0,
      revoked: 0,
    });
    return id;
  }

  validate(token: string): boolean {
    this.totalValidations++;
    for (const t of this.tokens.values()) {
      if (t.value !== token) continue;
      if (!t.active) continue;
      if (t.expires > 0 && t.expires < Date.now()) {
        t.valid = false;
        this.expiredCount++;
        return false;
      }
      t.validated++;
      t.hits++;
      t.history.push(Date.now());
      t.updated = Date.now();
      return t.valid;
    }
    return false;
  }

  revoke(id: string): boolean {
    const t = this.tokens.get(id);
    if (!t) return false;
    if (!t.valid) return false;
    t.valid = false;
    t.revoked++;
    t.history.push(Date.now());
    t.updated = Date.now();
    t.hits++;
    this.totalRevocations++;
    return true;
  }

  remove(id: string): boolean {
    return this.tokens.delete(id);
  }

  resetAll(): void {
    for (const t of this.tokens.values()) {
      t.valid = true;
      t.hits = 0;
      t.history = [];
      t.validated = 0;
      t.revoked = 0;
      t.active = true;
    }
    this.totalValidations = 0;
    this.totalRevocations = 0;
    this.expiredCount = 0;
  }

  getStats(): TkeStats {
    const all = Array.from(this.tokens.values());
    const scopeLengths = all.map(t => t.scope.length);
    const valueLengths = all.map(t => t.value.length);
    return {
      tokens: all.length,
      valid: all.filter(t => t.valid).length,
      invalid: all.filter(t => !t.valid).length,
      revoked: this.totalRevocations,
      expired: this.expiredCount,
      active: all.filter(t => t.active).length,
      inactive: all.filter(t => !t.active).length,
      totalHits: all.reduce((s, t) => s + t.hits, 0),
      totalValidations: this.totalValidations,
      totalRevocations: this.totalRevocations,
      uniqueScopes: new Set(all.map(t => t.scope)).size,
      avgScopeLength: all.length > 0 ? Math.round((scopeLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      avgValueLength: all.length > 0 ? Math.round((valueLengths.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxValueLength: valueLengths.length > 0 ? Math.max(...valueLengths) : 0,
      minValueLength: valueLengths.length > 0 ? Math.min(...valueLengths) : 0,
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

  getScope(id: string): string | undefined {
    return this.tokens.get(id)?.scope;
  }

  getScopeLength(id: string): number {
    return this.tokens.get(id)?.scope.length ?? 0;
  }

  getValueLength(id: string): number {
    return this.tokens.get(id)?.value.length ?? 0;
  }

  getExpires(id: string): number {
    return this.tokens.get(id)?.expires ?? 0;
  }

  getValidated(id: string): number {
    return this.tokens.get(id)?.validated ?? 0;
  }

  getRevoked(id: string): number {
    return this.tokens.get(id)?.revoked ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.tokens.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.tokens.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.tokens.get(id)?.active ?? false;
  }

  isValid(id: string): boolean {
    return this.tokens.get(id)?.valid ?? false;
  }

  isExpired(id: string): boolean {
    const t = this.tokens.get(id);
    if (!t) return false;
    return t.expires > 0 && t.expires < Date.now();
  }

  setActive(id: string, active: boolean): boolean {
    const t = this.tokens.get(id);
    if (!t) return false;
    t.active = active;
    t.updated = Date.now();
    return true;
  }

  setScope(id: string, scope: string): boolean {
    const t = this.tokens.get(id);
    if (!t) return false;
    t.scope = scope;
    t.updated = Date.now();
    return true;
  }

  setExpires(id: string, expires: number): boolean {
    const t = this.tokens.get(id);
    if (!t) return false;
    t.expires = expires;
    t.updated = Date.now();
    return true;
  }

  getByScope(scope: string): Token[] {
    return Array.from(this.tokens.values()).filter(t => t.scope === scope);
  }

  getActiveTokens(): Token[] {
    return Array.from(this.tokens.values()).filter(t => t.active);
  }

  getInactiveTokens(): Token[] {
    return Array.from(this.tokens.values()).filter(t => !t.active);
  }

  getValidTokens(): Token[] {
    return Array.from(this.tokens.values()).filter(t => t.valid);
  }

  getInvalidTokens(): Token[] {
    return Array.from(this.tokens.values()).filter(t => !t.valid);
  }

  getAllScopes(): string[] {
    return [...new Set(Array.from(this.tokens.values()).map(t => t.scope))];
  }

  getScopeCount(): number {
    return this.getAllScopes().length;
  }

  getByValue(value: string): Token | undefined {
    for (const t of this.tokens.values()) {
      if (t.value === value) return t;
    }
    return undefined;
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

  getTotalValidations(): number {
    return this.totalValidations;
  }

  getTotalRevocations(): number {
    return this.totalRevocations;
  }

  getExpiredCount(): number {
    return this.expiredCount;
  }

  clearAll(): void {
    this.tokens.clear();
    this.counter = 0;
    this.totalValidations = 0;
    this.totalRevocations = 0;
    this.expiredCount = 0;
  }
}

export default TokenManager;