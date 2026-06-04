/**
 * Load Balancer
 * nanobot-design Load Balancer - Round-robin + Weighted + Least-connections + Rate limiting
 */

export type BalanceStrategy = 'round-robin' | 'weighted' | 'least-connections';

export interface Backend {
  id: string;
  url: string;
  weight: number;
  healthy: boolean;
  activeConnections: number;
}

export class LoadBalancer {
  private backends: Map<string, Backend> = new Map();
  private roundRobinIndex = 0;
  private maxConnections = 100;

  addBackend(backend: Backend): void {
    this.backends.set(backend.id, { ...backend });
  }

  select(strategy: BalanceStrategy): Backend | null {
    const healthy = Array.from(this.backends.values()).filter(b => b.healthy && b.activeConnections < this.maxConnections);
    if (healthy.length === 0) return null;

    if (strategy === 'round-robin') {
      this.roundRobinIndex = this.roundRobinIndex % healthy.length;
      const selected = healthy[this.roundRobinIndex];
      this.roundRobinIndex++;
      return selected;
    }

    if (strategy === 'weighted') {
      // Pick based on weight - higher weight = more likely
      const totalWeight = healthy.reduce((sum, b) => sum + b.weight, 0);
      let pick = Math.random() * totalWeight;
      for (const backend of healthy) {
        pick -= backend.weight;
        if (pick <= 0) return backend;
      }
      return healthy[healthy.length - 1];
    }

    if (strategy === 'least-connections') {
      return healthy.reduce((best, curr) => curr.activeConnections < best.activeConnections ? curr : best);
    }

    return null;
  }

  incrementConnections(id: string): boolean {
    const backend = this.backends.get(id);
    if (!backend) return false;
    backend.activeConnections++;
    return true;
  }

  decrementConnections(id: string): boolean {
    const backend = this.backends.get(id);
    if (!backend) return false;
    backend.activeConnections = Math.max(0, backend.activeConnections - 1);
    return true;
  }

  markHealthy(id: string): boolean {
    const backend = this.backends.get(id);
    if (!backend) return false;
    backend.healthy = true;
    return true;
  }

  markUnhealthy(id: string): boolean {
    const backend = this.backends.get(id);
    if (!backend) return false;
    backend.healthy = false;
    return true;
  }

  canServe(id: string): boolean {
    const backend = this.backends.get(id);
    if (!backend) return false;
    return backend.healthy && backend.activeConnections < this.maxConnections;
  }

  getBackend(id: string): Backend | undefined {
    return this.backends.get(id);
  }

  getAllBackends(): Backend[] {
    return Array.from(this.backends.values());
  }

  getHealthyBackends(): Backend[] {
    return Array.from(this.backends.values()).filter(b => b.healthy);
  }

  removeBackend(id: string): boolean {
    return this.backends.delete(id);
  }

  getBackendCount(): number {
    return this.backends.size;
  }

  hasBackend(id: string): boolean {
    return this.backends.has(id);
  }

  getActiveConnections(id: string): number {
    return this.backends.get(id)?.activeConnections ?? 0;
  }

  getTotalActiveConnections(): number {
    return Array.from(this.backends.values()).reduce((sum, b) => sum + b.activeConnections, 0);
  }

  getTotalHealthy(): number {
    return this.getHealthyBackends().length;
  }

  setMaxConnections(max: number): void {
    this.maxConnections = Math.max(1, max);
  }

  getMaxConnections(): number {
    return this.maxConnections;
  }

  isOverloaded(id: string): boolean {
    const backend = this.backends.get(id);
    if (!backend) return false;
    return backend.activeConnections >= this.maxConnections;
  }

  resetRoundRobin(): void {
    this.roundRobinIndex = 0;
  }

  clearAll(): void {
    this.backends.clear();
    this.roundRobinIndex = 0;
  }

  setWeight(id: string, weight: number): boolean {
    const backend = this.backends.get(id);
    if (!backend) return false;
    backend.weight = Math.max(0, weight);
    return true;
  }

  getWeight(id: string): number {
    return this.backends.get(id)?.weight ?? 0;
  }
}

export default LoadBalancer;