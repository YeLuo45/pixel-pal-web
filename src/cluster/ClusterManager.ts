/**
 * Cluster Manager
 * nanobot-design Cluster Manager - Create + Add + Remove + Stats
 */

export type ClusterStatus = 'active' | 'inactive' | 'draining';

export interface Cluster {
  id: string;
  name: string;
  nodes: string[];
  leader: string | null;
  status: ClusterStatus;
  created: number;
  updated: number;
}

export interface ClusterStats {
  clusters: number;
  nodes: number;
  active: number;
  inactive: number;
  draining: number;
}

export class ClusterManager {
  private clusters: Map<string, Cluster> = new Map();
  private counter = 0;

  createCluster(name: string): string {
    const id = `cluster-${++this.counter}`;
    const now = Date.now();
    this.clusters.set(id, {
      id,
      name,
      nodes: [],
      leader: null,
      status: 'active',
      created: now,
      updated: now,
    });
    return id;
  }

  addNode(clusterId: string, nodeId: string): boolean {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) return false;
    if (!cluster.nodes.includes(nodeId)) {
      cluster.nodes.push(nodeId);
      cluster.updated = Date.now();
    }
    return true;
  }

  removeNode(clusterId: string, nodeId: string): boolean {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) return false;
    const idx = cluster.nodes.indexOf(nodeId);
    if (idx === -1) return false;
    cluster.nodes.splice(idx, 1);
    if (cluster.leader === nodeId) cluster.leader = null;
    cluster.updated = Date.now();
    return true;
  }

  setLeader(clusterId: string, nodeId: string): boolean {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) return false;
    if (!cluster.nodes.includes(nodeId)) return false;
    cluster.leader = nodeId;
    cluster.updated = Date.now();
    return true;
  }

  getStats(): ClusterStats {
    const all = Array.from(this.clusters.values());
    const totalNodes = all.reduce((sum, c) => sum + c.nodes.length, 0);
    return {
      clusters: all.length,
      nodes: totalNodes,
      active: all.filter(c => c.status === 'active').length,
      inactive: all.filter(c => c.status === 'inactive').length,
      draining: all.filter(c => c.status === 'draining').length,
    };
  }

  getCluster(id: string): Cluster | undefined {
    return this.clusters.get(id);
  }

  getAllClusters(): Cluster[] {
    return Array.from(this.clusters.values());
  }

  removeCluster(id: string): boolean {
    return this.clusters.delete(id);
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

  getNodes(clusterId: string): string[] {
    return [...(this.clusters.get(clusterId)?.nodes ?? [])];
  }

  getNodeCount(clusterId: string): number {
    return this.clusters.get(clusterId)?.nodes.length ?? 0;
  }

  hasNode(clusterId: string, nodeId: string): boolean {
    return this.clusters.get(clusterId)?.nodes.includes(nodeId) ?? false;
  }

  getLeader(clusterId: string): string | null {
    return this.clusters.get(clusterId)?.leader ?? null;
  }

  hasLeader(clusterId: string): boolean {
    return this.clusters.get(clusterId)?.leader !== null && this.clusters.get(clusterId)?.leader !== undefined;
  }

  getStatus(clusterId: string): ClusterStatus | null {
    return this.clusters.get(clusterId)?.status ?? null;
  }

  setStatus(clusterId: string, status: ClusterStatus): boolean {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) return false;
    cluster.status = status;
    cluster.updated = Date.now();
    return true;
  }

  activate(clusterId: string): boolean {
    return this.setStatus(clusterId, 'active');
  }

  deactivate(clusterId: string): boolean {
    return this.setStatus(clusterId, 'inactive');
  }

  drain(clusterId: string): boolean {
    return this.setStatus(clusterId, 'draining');
  }

  isActive(clusterId: string): boolean {
    return this.clusters.get(clusterId)?.status === 'active';
  }

  isInactive(clusterId: string): boolean {
    return this.clusters.get(clusterId)?.status === 'inactive';
  }

  isDraining(clusterId: string): boolean {
    return this.clusters.get(clusterId)?.status === 'draining';
  }

  getByStatus(status: ClusterStatus): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => c.status === status);
  }

  getActive(): Cluster[] {
    return this.getByStatus('active');
  }

  getInactive(): Cluster[] {
    return this.getByStatus('inactive');
  }

  getDraining(): Cluster[] {
    return this.getByStatus('draining');
  }

  getByName(name: string): Cluster | undefined {
    return Array.from(this.clusters.values()).find(c => c.name === name);
  }

  getClustersForNode(nodeId: string): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => c.nodes.includes(nodeId));
  }

  getLeaderless(): Cluster[] {
    return Array.from(this.clusters.values()).filter(c => c.leader === null);
  }

  rename(clusterId: string, name: string): boolean {
    const cluster = this.clusters.get(clusterId);
    if (!cluster) return false;
    cluster.name = name;
    cluster.updated = Date.now();
    return true;
  }

  getCreatedAt(id: string): number {
    return this.clusters.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.clusters.get(id)?.updated ?? 0;
  }

  getTotalNodeCount(): number {
    return Array.from(this.clusters.values()).reduce((sum, c) => sum + c.nodes.length, 0);
  }

  getAvgNodeCount(): number {
    const all = Array.from(this.clusters.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((sum, c) => sum + c.nodes.length, 0) / all.length) * 100) / 100;
  }

  getLargestCluster(): Cluster | null {
    const all = Array.from(this.clusters.values());
    if (all.length === 0) return null;
    return all.reduce((max, c) => c.nodes.length > max.nodes.length ? c : max);
  }

  clearAll(): void {
    this.clusters.clear();
    this.counter = 0;
  }
}

export default ClusterManager;