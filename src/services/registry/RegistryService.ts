export interface ServiceEndpoint {
  id: string;
  name: string;
  url: string;
  capabilities: string[];
  health: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: number;
}

export class RegistryService {
  private services: Map<string, ServiceEndpoint> = new Map();

  register(endpoint: ServiceEndpoint): void {
    endpoint.lastCheck = Date.now();
    this.services.set(endpoint.id, endpoint);
  }

  unregister(id: string): boolean {
    return this.services.delete(id);
  }

  get(id: string): ServiceEndpoint | null {
    return this.services.get(id) || null;
  }

  getByCapability(capability: string): ServiceEndpoint[] {
    return Array.from(this.services.values()).filter(s => 
      s.capabilities.includes(capability)
    );
  }

  getAll(): ServiceEndpoint[] {
    return Array.from(this.services.values());
  }

  updateHealth(id: string, health: 'healthy' | 'degraded' | 'unhealthy'): void {
    const service = this.services.get(id);
    if (service) {
      service.health = health;
      service.lastCheck = Date.now();
    }
  }

  async checkHealth(id: string): Promise<boolean> {
    const service = this.services.get(id);
    if (!service) return false;
    
    try {
      const response = await fetch(service.url, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      const healthy = response.ok;
      this.updateHealth(id, healthy ? 'healthy' : 'degraded');
      return healthy;
    } catch {
      this.updateHealth(id, 'unhealthy');
      return false;
    }
  }
}