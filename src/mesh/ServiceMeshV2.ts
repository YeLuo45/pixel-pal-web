/**
 * Service Mesh v2
 * nanobot-design Service Mesh v2 - Route + Traffic + Circuit + Monitor
 */

export interface Route {
  source: string;
  destination: string;
  weight: number;
  enabled: boolean;
}

export interface MeshMetrics {
  total: number;
  enabled: number;
  disabled: number;
}

export class ServiceMeshV2 {
  private routes: Route[] = [];
  private trafficLog: { source: string; destination: string; timestamp: number }[] = [];
  private maxLogSize = 1000;

  addRoute(route: Route): void {
    this.routes.push({ ...route });
  }

  selectRoute(source: string): Route[] {
    return this.routes.filter(r => r.source === source && r.enabled);
  }

  enableRoute(source: string, destination: string): boolean {
    const route = this.routes.find(r => r.source === source && r.destination === destination);
    if (!route) return false;
    route.enabled = true;
    return true;
  }

  disableRoute(source: string, destination: string): boolean {
    const route = this.routes.find(r => r.source === source && r.destination === destination);
    if (!route) return false;
    route.enabled = false;
    return true;
  }

  getMetrics(): MeshMetrics {
    return {
      total: this.routes.length,
      enabled: this.routes.filter(r => r.enabled).length,
      disabled: this.routes.filter(r => !r.enabled).length,
    };
  }

  getRoute(source: string, destination: string): Route | undefined {
    return this.routes.find(r => r.source === source && r.destination === destination);
  }

  getAllRoutes(): Route[] {
    return [...this.routes];
  }

  getEnabledRoutes(): Route[] {
    return this.routes.filter(r => r.enabled);
  }

  getDisabledRoutes(): Route[] {
    return this.routes.filter(r => !r.enabled);
  }

  removeRoute(source: string, destination: string): boolean {
    const idx = this.routes.findIndex(r => r.source === source && r.destination === destination);
    if (idx === -1) return false;
    this.routes.splice(idx, 1);
    return true;
  }

  getRouteCount(): number {
    return this.routes.length;
  }

  getAllSources(): string[] {
    return [...new Set(this.routes.map(r => r.source))];
  }

  getAllDestinations(): string[] {
    return [...new Set(this.routes.map(r => r.destination))];
  }

  getRoutesBySource(source: string): Route[] {
    return this.routes.filter(r => r.source === source);
  }

  getRoutesByDestination(destination: string): Route[] {
    return this.routes.filter(r => r.destination === destination);
  }

  recordTraffic(source: string, destination: string): void {
    this.trafficLog.push({ source, destination, timestamp: Date.now() });
    if (this.trafficLog.length > this.maxLogSize) {
      this.trafficLog = this.trafficLog.slice(-this.maxLogSize);
    }
  }

  getTrafficLog(): { source: string; destination: string; timestamp: number }[] {
    return [...this.trafficLog];
  }

  getTrafficCount(): number {
    return this.trafficLog.length;
  }

  getTrafficBySource(source: string): number {
    return this.trafficLog.filter(t => t.source === source).length;
  }

  getTrafficByDestination(destination: string): number {
    return this.trafficLog.filter(t => t.destination === destination).length;
  }

  setRouteWeight(source: string, destination: string, weight: number): boolean {
    const route = this.routes.find(r => r.source === source && r.destination === destination);
    if (!route) return false;
    route.weight = Math.max(0, weight);
    return true;
  }

  getRouteWeight(source: string, destination: string): number {
    return this.routes.find(r => r.source === source && r.destination === destination)?.weight ?? 0;
  }

  getTotalWeight(source: string): number {
    return this.routes
      .filter(r => r.source === source)
      .reduce((sum, r) => sum + r.weight, 0);
  }

  selectByWeight(source: string): Route | null {
    const available = this.selectRoute(source);
    if (available.length === 0) return null;
    if (available.length === 1) return available[0];
    const total = available.reduce((sum, r) => sum + r.weight, 0);
    if (total === 0) return available[0];
    let pick = Math.random() * total;
    for (const r of available) {
      pick -= r.weight;
      if (pick <= 0) return r;
    }
    return available[available.length - 1];
  }

  clearAll(): void {
    this.routes = [];
    this.trafficLog = [];
  }
}

export default ServiceMeshV2;