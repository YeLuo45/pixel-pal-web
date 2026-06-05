/**
 * Message Router
 * chatdev-design Message Router - Register + Route + Stats
 */

export interface Route {
  id: string;
  pattern: string;
  destination: string;
  hits: number;
  created: number;
}

export interface RouterStats {
  routes: number;
  totalHits: number;
  avgHits: number;
  destinations: number;
  unmatched: number;
}

export class MessageRouter {
  private routes: Map<string, Route> = new Map();
  private counter = 0;
  private unmatched = 0;

  register(pattern: string, destination: string): string {
    const id = `rt-${++this.counter}`;
    this.routes.set(id, {
      id,
      pattern,
      destination,
      hits: 0,
      created: Date.now(),
    });
    return id;
  }

  route(message: string): string | null {
    for (const r of this.routes.values()) {
      if (message.includes(r.pattern)) {
        r.hits++;
        return r.destination;
      }
    }
    this.unmatched++;
    return null;
  }

  getStats(): RouterStats {
    const all = Array.from(this.routes.values());
    return {
      routes: all.length,
      totalHits: all.reduce((s, r) => s + r.hits, 0),
      avgHits: all.length > 0 ? Math.round((all.reduce((s, r) => s + r.hits, 0) / all.length) * 100) / 100 : 0,
      destinations: new Set(all.map(r => r.destination)).size,
      unmatched: this.unmatched,
    };
  }

  getRoute(id: string): Route | undefined {
    return this.routes.get(id);
  }

  getAllRoutes(): Route[] {
    return Array.from(this.routes.values());
  }

  removeRoute(id: string): boolean {
    return this.routes.delete(id);
  }

  hasRoute(id: string): boolean {
    return this.routes.has(id);
  }

  getCount(): number {
    return this.routes.size;
  }

  getPattern(id: string): string | undefined {
    return this.routes.get(id)?.pattern;
  }

  getDestination(id: string): string | undefined {
    return this.routes.get(id)?.destination;
  }

  getHits(id: string): number {
    return this.routes.get(id)?.hits ?? 0;
  }

  getCreatedAt(id: string): number {
    return this.routes.get(id)?.created ?? 0;
  }

  setPattern(id: string, pattern: string): boolean {
    const r = this.routes.get(id);
    if (!r) return false;
    r.pattern = pattern;
    return true;
  }

  setDestination(id: string, destination: string): boolean {
    const r = this.routes.get(id);
    if (!r) return false;
    r.destination = destination;
    return true;
  }

  resetHits(): void {
    for (const r of this.routes.values()) r.hits = 0;
  }

  resetUnmatched(): void {
    this.unmatched = 0;
  }

  resetAll(): void {
    for (const r of this.routes.values()) r.hits = 0;
    this.unmatched = 0;
  }

  getByPattern(pattern: string): Route[] {
    return Array.from(this.routes.values()).filter(r => r.pattern === pattern);
  }

  getByDestination(destination: string): Route[] {
    return Array.from(this.routes.values()).filter(r => r.destination === destination);
  }

  getAllDestinations(): string[] {
    return [...new Set(Array.from(this.routes.values()).map(r => r.destination))];
  }

  getUnmatchedCount(): number {
    return this.unmatched;
  }

  getMostHit(): Route | null {
    const all = Array.from(this.routes.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.hits > max.hits ? r : max);
  }

  getLeastHit(): Route | null {
    const all = Array.from(this.routes.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.hits < min.hits ? r : min);
  }

  getNewest(): Route | null {
    const all = Array.from(this.routes.values());
    if (all.length === 0) return null;
    return all.reduce((max, r) => r.created > max.created ? r : max);
  }

  getOldest(): Route | null {
    const all = Array.from(this.routes.values());
    if (all.length === 0) return null;
    return all.reduce((min, r) => r.created < min.created ? r : min);
  }

  clearAll(): void {
    this.routes.clear();
    this.counter = 0;
    this.unmatched = 0;
  }
}

export default MessageRouter;