/**
 * Service Mesh
 * nanobot-design Service Mesh - Register + AddPolicy + Stats
 */

export interface MeshNode {
  id: string;
  service: string;
  version: string;
  policies: string[];
  created: number;
  updated: number;
  active: boolean;
  hits: number;
  traffic: number;
}

export interface SMStats {
  nodes: number;
  totalPolicies: number;
  totalHits: number;
  totalTraffic: number;
  active: number;
  inactive: number;
  services: number;
  versions: number;
  avgPolicies: number;
  avgTraffic: number;
}

export class ServiceMesh {
  private nodes: Map<string, MeshNode> = new Map();
  private counter = 0;

  register(service: string, version: string): string {
    const id = `mesh-${++this.counter}`;
    this.nodes.set(id, {
      id,
      service,
      version,
      policies: [],
      created: Date.now(),
      updated: Date.now(),
      active: true,
      hits: 0,
      traffic: 0,
    });
    return id;
  }

  addPolicy(id: string, policy: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    if (!n.active) return false;
    if (!n.policies.includes(policy)) n.policies.push(policy);
    n.updated = Date.now();
    return true;
  }

  route(id: string, traffic: number = 1): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    if (!n.active) return false;
    n.traffic += traffic;
    n.hits++;
    n.updated = Date.now();
    return true;
  }

  removePolicy(id: string, policy: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.policies = n.policies.filter(p => p !== policy);
    n.updated = Date.now();
    return true;
  }

  getStats(): SMStats {
    const all = Array.from(this.nodes.values());
    return {
      nodes: all.length,
      totalPolicies: all.reduce((s, n) => s + n.policies.length, 0),
      totalHits: all.reduce((s, n) => s + n.hits, 0),
      totalTraffic: all.reduce((s, n) => s + n.traffic, 0),
      active: all.filter(n => n.active).length,
      inactive: all.filter(n => !n.active).length,
      services: new Set(all.map(n => n.service)).size,
      versions: new Set(all.map(n => n.version)).size,
      avgPolicies: all.length > 0 ? Math.round((all.reduce((s, n) => s + n.policies.length, 0) / all.length) * 100) / 100 : 0,
      avgTraffic: all.length > 0 ? Math.round((all.reduce((s, n) => s + n.traffic, 0) / all.length) * 100) / 100 : 0,
    };
  }

  getNode(id: string): MeshNode | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): MeshNode[] {
    return Array.from(this.nodes.values());
  }

  removeNode(id: string): boolean {
    return this.nodes.delete(id);
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  getCount(): number {
    return this.nodes.size;
  }

  getService(id: string): string | undefined {
    return this.nodes.get(id)?.service;
  }

  getVersion(id: string): string | undefined {
    return this.nodes.get(id)?.version;
  }

  getPolicies(id: string): string[] {
    return [...(this.nodes.get(id)?.policies ?? [])];
  }

  getPolicyCount(id: string): number {
    return this.getPolicies(id).length;
  }

  getHits(id: string): number {
    return this.nodes.get(id)?.hits ?? 0;
  }

  getTraffic(id: string): number {
    return this.nodes.get(id)?.traffic ?? 0;
  }

  isActive(id: string): boolean {
    return this.nodes.get(id)?.active ?? false;
  }

  hasPolicy(id: string, policy: string): boolean {
    return this.nodes.get(id)?.policies.includes(policy) ?? false;
  }

  setActive(id: string, active: boolean): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.active = active;
    n.updated = Date.now();
    return true;
  }

  setService(id: string, service: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.service = service;
    n.updated = Date.now();
    return true;
  }

  setVersion(id: string, version: string): boolean {
    const n = this.nodes.get(id);
    if (!n) return false;
    n.version = version;
    n.updated = Date.now();
    return true;
  }

  resetAll(): void {
    for (const n of this.nodes.values()) {
      n.hits = 0;
      n.traffic = 0;
      n.policies = [];
      n.active = true;
    }
  }

  getByService(service: string): MeshNode[] {
    return Array.from(this.nodes.values()).filter(n => n.service === service);
  }

  getByVersion(version: string): MeshNode[] {
    return Array.from(this.nodes.values()).filter(n => n.version === version);
  }

  getByPolicy(policy: string): MeshNode[] {
    return Array.from(this.nodes.values()).filter(n => n.policies.includes(policy));
  }

  getActiveNodes(): MeshNode[] {
    return Array.from(this.nodes.values()).filter(n => n.active);
  }

  getInactiveNodes(): MeshNode[] {
    return Array.from(this.nodes.values()).filter(n => !n.active);
  }

  getAllServices(): string[] {
    return [...new Set(Array.from(this.nodes.values()).map(n => n.service))];
  }

  getServiceCount(): number {
    return this.getAllServices().length;
  }

  getAllVersions(): string[] {
    return [...new Set(Array.from(this.nodes.values()).map(n => n.version))];
  }

  getVersionCount(): number {
    return this.getAllVersions().length;
  }

  getByMinTraffic(min: number): MeshNode[] {
    return Array.from(this.nodes.values()).filter(n => n.traffic >= min);
  }

  getMostTraffic(): MeshNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.traffic > max.traffic ? n : max);
  }

  getNewest(): MeshNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((max, n) => n.created > max.created ? n : max);
  }

  getOldest(): MeshNode | null {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return null;
    return all.reduce((min, n) => n.created < min.created ? n : min);
  }

  getCreatedAt(id: string): number {
    return this.nodes.get(id)?.created ?? 0;
  }

  getUpdatedAt(id: string): number {
    return this.nodes.get(id)?.updated ?? 0;
  }

  clearAll(): void {
    this.nodes.clear();
    this.counter = 0;
  }
}

export default ServiceMesh;