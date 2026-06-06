/**
 * Belief Network
 * generic-agent-design Belief Network - AddNode + AddEdge + Query + Stats
 */

export interface BeliefNode {
  id: string;
  name: string;
  belief: number;
  edges: string[];
  created: number;
  updated: number;
  hits: number;
}

export interface BNStats {
  nodes: number;
  edges: number;
  totalBelief: number;
  avgBelief: number;
  totalHits: number;
}

export class BeliefNetwork {
  private nodes: Map<string, BeliefNode> = new Map();
  private edgeCount = 0;
  private counter = 0;

  addNode(name: string, belief: number): string {
    const id = `bn-${++this.counter}`;
    this.nodes.set(id, {
      id,
      name,
      belief,
      edges: [],
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
    });
    return id;
  }

  addEdge(from: string, to: string): boolean {
    const n1 = this.nodes.get(from);
    const n2 = this.nodes.get(to);
    if (!n1 || !n2) return false;
    if (n1.edges.includes(to)) return false;
    n1.edges.push(to);
    this.edgeCount++;
    return true;
  }

  query(id: string): number {
    const n = this.nodes.get(id);
    if (!n) return 0;
    n.hits++;
    n.updated = Date.now();
    return n.belief;
  }

  getStats(): BNStats {
    const all = Array.from(this.nodes.values());
    return {
      nodes: all.length,
      edges: this.edgeCount,
      totalBelief: all.reduce((s, n) => s + n.belief, 0),
      avgBelief: all.length > 0 ? Math.round((all.reduce((s, n) => s + n.belief, 0) / all.length) * 100) / 100 : 0,
      totalHits: all.reduce((s, n) => s + n.hits, 0),
    };
  }

  getNode(id: string): BeliefNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): BeliefNode[] {
    return Array.from(this.nodes.values());
  }

  removeNode(id: string): boolean {
    const removed = this.nodes.delete(id);
    if (removed) {
      this.edgeCount = 0;
      for (const n of this.nodes.values()) {
        n.edges = n.edges.filter(e => e !== id);
        this.edgeCount += n.edges.length;
      }
    }
    return removed;
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  getCount(): number {
    return this.nodes.size;
  }

  getName(id: string): string | undefined {
    return this.nodes.get(id)?.name;
  }

  getBelief(id: string): number {
    return this.nodes.get(id)?.belief ?? 0;
  }

  getHits(id: string): number {
    return this.nodes.get(id)?.hits ?? 0;
  }

  getEdges(id: string): string[] {
    return [...(this.nodes.get(id)?.edges ?? [])];
  }

  getEdgeCount(id: string): number {
    return this.getEdges(id).length;
  }

  hasEdge(from: string, to: string): boolean {
    return this.nodes.get(from)?.edges.includes(to) ?? false;
  }

  removeEdge(from: string, to: string): boolean {
    const n = this.nodes.get(from);
    if (!n) return false;
    if (!n.edges.includes(to)) return false;
    n.edges = n.edges.filter(e => e !== to);
    this.edgeCount--;
    return true;
  }

  setBelief(id: string, belief: number): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.belief = belief;
    n.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.name = name;
    n.updated = Date.now();
    return true;
  }

  resetHits(): void {
    for (const n of this.nodes.values()) n.hits = 0;
  }

  resetAll(): void {
    for (const n of this.nodes.values()) {
      n.hits = 0;
      n.edges = [];
    }
    this.edgeCount = 0;
  }

  getByName(name: string): BeliefNode[] {
    return Array.from(this.nodes.values()).filter(n => n.name === name);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.nodes.values()).map(n => n.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinBelief(min: number): BeliefNode[] {
    return Array.from(this.nodes.values()).filter(n => n.belief >= min);
  }

  getByMaxBelief(max: number): BeliefNode[] {
    return Array.from(this.nodes.values()).filter(n => n.belief <= max);
  }

  getSortedByBelief(): BeliefNode[] {
    return [...Array.from(this.nodes.values())].sort((a, b) => b.belief - a.belief);
  }

  getMostHit(): BeliefNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.hits > max.hits ? n : max);
  }

  getHighestBelief(): BeliefNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.belief > max.belief ? n : max);
  }

  getMostConnected(): BeliefNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.edges.length > max.edges.length ? n : max);
  }

  getCreatedAt(id: string): number {
    return this.nodes.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.nodes.get(id)?.updated ?? 0;
  }

  getEdgeCountTotal(): number {
    return this.edgeCount;
  }

  clearAll(): void {
    this.nodes.clear();
    this.edgeCount = 0;
    this.counter = 0;
  }
}

export default BeliefNetwork;