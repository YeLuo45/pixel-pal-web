/**
 * Cluster Manager
 * nanobot-design Cluster Manager - Create + Add + Remove + Stats
 */

export interface Cluster {
  id: string;
  name: string;
  nodes: string[];
  active: boolean;
  created: number;
  updated: number;
  hits: number;
  history: number[];
}

export interface ClmStats {
  clusters: number;
  totalNodes: number;
  active: number;
  inactive: number;
  totalHits: number;
  uniqueNames: number;
  avgNodes: number;
  maxNodes: number;
  minNodes: number;
  uniqueNodes: number;
  emptyClusters: number;
  largestCluster: string | null;
}

export class ClusterManager {
  private clusters: Map<string, Cluster> = new Map();
  private counter = 0;

  create(name: string): string {
    const id = `clm-${++this.counter}`;
    this.clusters.set(id, {
      id,
      name,
      nodes: [],
      active: true,
      created: Date.now(),
      updated: Date.now(),
      hits: 0,
      history: [],
    });
    return id;
  }

  addNode(id: string, node: string): boolean {
    const c = this.clusters.get(id);
    if (!c) return false;
    if (!c.active) return false;
    if (!c.nodes.includes(node)) {
      c.nodes.push(node);
      c.updated = Date.now();
    }
    c.hits++;
    return true;
  }

  removeNode(id: string, node: string): boolean {
    const c = this.clusters.get(id);
    if (!c) return false;
    const idx = c.nodes.indexOf(node);
    if (idx < 0) return false;
    c.nodes.splice(idx, 1);
    c.updated = Date.now();
    c.hits++;
    return true;
  }

  remove(id: string): boolean {
    return this.clusters.delete(id);
  }

  resetAll(): void {
    for (const c of this.clusters.values()) {
      c.hits = 0;
      c.history = [];
      c.active = true;
    }
  }

  getStats(): ClmStats {
    const all = Array.from(this.clusters.values());
    const nodeValues = all.map(c => c.nodes.length);
    const allNodes = all.flatMap(c => c.nodes);
    let largest: Cluster | null = null;
    for (const c of all) {
      if (largest === null || c.nodes.length > largest.nodes.length) {
        largest = c;
      }
    }
    return {
      clusters: all.length,
      totalNodes: allNodes.length,
      active: all.filter(c => c.active).length,
      inactive: all.filter(c => !c.active).length,
      totalHits: all.reduce((s, c) => s + c.hits, 0),
      uniqueNames: new Set(all.map(c => c.name)).size,
      avgNodes: all.length > 0 ? Math.round((nodeValues.reduce((s, v) => s + v, 0) / all.length) * 100) / 100 : 0,
      maxNodes: nodeValues.length > 0 ? Math.max(...nodeValues) : 0,
      minNodes: nodeValues.length > 0 ? Math.min(...nodeValues) : 0,
      uniqueNodes: new Set(allNodes).size,
      emptyClusters: all.filter(c => c.nodes.length === 0).length,
      largestCluster: largest?.name ?? null,
    };
  }

  getCluster(id: string): Cluster | undefined {
    return this.clusters.get(id);
  }

  getAllClusters(): Cluster[] {
    return Array.from(this.clusters.values());
  }

  hasCluster(id: string): boolean {
    return this.clusters.has(id);
  }

  getCount(): number {
    return this.clusters.size;
  }

  getName(id: string): string | undefined {
    return this.clusters.get(id)?.name;
  }

  getNodes(id: string): string[] {
    return [...(this.clusters.get(id)?.nodes ?? [])];
  }

  getNodeCount(id: string): number {
    return this.clusters.get(id)?.nodes.length ?? 0;
  }

  getHistory(id: string): number[] {
    return [...(this.clusters.get(id)?.history ?? [])];
  }

  getHits(id: string): number {
    return this.clusters.get(id)?.hits ?? 0;
  }

  isActive(id: string): boolean {
    return this.clusters.get(id)?.active ?? false;
  }

  isEmpty(id: string): boolean {
    return (this.clusters.get(id)?.nodes.length ?? 0) === 0;
  }

  setActive(id: string, active: boolean): boolean {
    const c = this.clusters.get(id);
    if (!c) return false;
    c.active = active;
    c.updated = Date.now();
    return true;
  }

  setName(id: string, name: string): boolean {
    const c = this.clusters.get(id);
    if (!c) return false;
    c.name = name;
    c.updated = Date.now();
    return true;
  }

  getByName(name: string): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => c.name === name);
  }

  getActiveClusters(): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => c.active);
  }

  getInactiveClusters(): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => !c.active);
  }

  getEmptyClusters(): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => c.nodes.length === 0);
  }

  getAllNames(): string[] {
    return [...new Set(Array.from(this.clusters.values()).map(c => c.name))];
  }

  getNameCount(): number {
    return this.getAllNames().length;
  }

  getByMinNodes(min: number): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => c.nodes.length >= min);
  }

  getLargest(): Cluster | null {
    const all = Array.from(this.clusters.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.nodes.length > max.nodes.length ? c : max);
  }

  getNewest(): Cluster | null {
    const all = Array.from(this.clusters.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.created > max.created ? c : max);
  }

  getOldest(): Cluster | null {
    const all = Array.from(this.clusters.values());
    if (all.length === 0) return null;
    return all.reduce((min, c) => c.created < min.created ? c : min);
  }

  getCreatedAt(id: string): number {
    return this.clusters.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.clusters.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.clusters.clear();
    this.counter = 0;
  }
}

export default ClusterManager;