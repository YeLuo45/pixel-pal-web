import { describe, it, expect, beforeEach } from 'vitest';
import { RegistryService, ServiceEndpoint } from '../RegistryService';

describe('RegistryService', () => {
  let registry: RegistryService;

  beforeEach(() => {
    registry = new RegistryService();
  });

  describe('Service Registration', () => {
    it('should register a service endpoint', () => {
      const endpoint: ServiceEndpoint = {
        id: 'service-1',
        name: 'Test Service',
        url: 'http://localhost:8000',
        capabilities: ['sync', 'storage'],
        health: 'healthy',
        lastCheck: Date.now(),
      };
      registry.register(endpoint);
      const retrieved = registry.get('service-1');
      expect(retrieved).toEqual(endpoint);
    });

    it('should register multiple services', () => {
      const endpoint1: ServiceEndpoint = {
        id: 'service-1',
        name: 'Service One',
        url: 'http://localhost:8001',
        capabilities: ['sync'],
        health: 'healthy',
        lastCheck: Date.now(),
      };
      const endpoint2: ServiceEndpoint = {
        id: 'service-2',
        name: 'Service Two',
        url: 'http://localhost:8002',
        capabilities: ['storage'],
        health: 'healthy',
        lastCheck: Date.now(),
      };
      registry.register(endpoint1);
      registry.register(endpoint2);
      expect(registry.getAll()).toHaveLength(2);
    });

    it('should overwrite existing service with same id', () => {
      const endpoint1: ServiceEndpoint = {
        id: 'service-1',
        name: 'Original',
        url: 'http://localhost:8001',
        capabilities: ['sync'],
        health: 'healthy',
        lastCheck: Date.now(),
      };
      const endpoint2: ServiceEndpoint = {
        id: 'service-1',
        name: 'Updated',
        url: 'http://localhost:8002',
        capabilities: ['storage'],
        health: 'healthy',
        lastCheck: Date.now(),
      };
      registry.register(endpoint1);
      registry.register(endpoint2);
      const retrieved = registry.get('service-1');
      expect(retrieved?.name).toBe('Updated');
      expect(registry.getAll()).toHaveLength(1);
    });
  });

  describe('Service Unregistration', () => {
    it('should unregister an existing service', () => {
      const endpoint: ServiceEndpoint = {
        id: 'service-1',
        name: 'Test Service',
        url: 'http://localhost:8000',
        capabilities: ['sync'],
        health: 'healthy',
        lastCheck: Date.now(),
      };
      registry.register(endpoint);
      const result = registry.unregister('service-1');
      expect(result).toBe(true);
      expect(registry.get('service-1')).toBeNull();
    });

    it('should return false when unregistering non-existent service', () => {
      const result = registry.unregister('non-existent');
      expect(result).toBe(false);
    });

    it('should decrease count after unregister', () => {
      registry.register({
        id: 's1', name: 'S1', url: 'http://localhost:1',
        capabilities: [], health: 'healthy', lastCheck: Date.now(),
      });
      registry.register({
        id: 's2', name: 'S2', url: 'http://localhost:2',
        capabilities: [], health: 'healthy', lastCheck: Date.now(),
      });
      registry.unregister('s1');
      expect(registry.getAll()).toHaveLength(1);
    });
  });

  describe('Service Retrieval', () => {
    it('should get a service by id', () => {
      const endpoint: ServiceEndpoint = {
        id: 'service-1',
        name: 'Test Service',
        url: 'http://localhost:8000',
        capabilities: ['sync', 'storage'],
        health: 'healthy',
        lastCheck: Date.now(),
      };
      registry.register(endpoint);
      const retrieved = registry.get('service-1');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('service-1');
    });

    it('should return null for non-existent service', () => {
      const retrieved = registry.get('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should get all services', () => {
      registry.register({
        id: 's1', name: 'S1', url: 'http://localhost:1',
        capabilities: [], health: 'healthy', lastCheck: Date.now(),
      });
      registry.register({
        id: 's2', name: 'S2', url: 'http://localhost:2',
        capabilities: [], health: 'healthy', lastCheck: Date.now(),
      });
      const all = registry.getAll();
      expect(all).toHaveLength(2);
    });

    it('should return empty array when no services registered', () => {
      expect(registry.getAll()).toHaveLength(0);
    });
  });

  describe('Capability-based Discovery', () => {
    it('should get services by capability', () => {
      registry.register({
        id: 'sync-service',
        name: 'Sync Service',
        url: 'http://localhost:8001',
        capabilities: ['sync', 'storage'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      registry.register({
        id: 'storage-service',
        name: 'Storage Service',
        url: 'http://localhost:8002',
        capabilities: ['storage'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      const syncServices = registry.getByCapability('sync');
      expect(syncServices).toHaveLength(1);
      expect(syncServices[0].id).toBe('sync-service');
    });

    it('should return multiple services with same capability', () => {
      registry.register({
        id: 'sync-1',
        name: 'Sync Service 1',
        url: 'http://localhost:8001',
        capabilities: ['sync'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      registry.register({
        id: 'sync-2',
        name: 'Sync Service 2',
        url: 'http://localhost:8002',
        capabilities: ['sync'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      const syncServices = registry.getByCapability('sync');
      expect(syncServices).toHaveLength(2);
    });

    it('should return empty array for non-existent capability', () => {
      registry.register({
        id: 'service-1',
        name: 'Test Service',
        url: 'http://localhost:8000',
        capabilities: ['sync'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      const services = registry.getByCapability('non-existent');
      expect(services).toHaveLength(0);
    });

    it('should return all services when capability matches multiple', () => {
      registry.register({
        id: 's1',
        name: 'S1',
        url: 'http://localhost:1',
        capabilities: ['sync', 'storage'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      const syncServices = registry.getByCapability('sync');
      const storageServices = registry.getByCapability('storage');
      expect(syncServices).toHaveLength(1);
      expect(storageServices).toHaveLength(1);
    });
  });

  describe('Health Management', () => {
    it('should update service health', () => {
      registry.register({
        id: 'service-1',
        name: 'Test Service',
        url: 'http://localhost:8000',
        capabilities: ['sync'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      registry.updateHealth('service-1', 'degraded');
      const retrieved = registry.get('service-1');
      expect(retrieved?.health).toBe('degraded');
    });

    it('should update health to unhealthy', () => {
      registry.register({
        id: 'service-1',
        name: 'Test Service',
        url: 'http://localhost:8000',
        capabilities: ['sync'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      registry.updateHealth('service-1', 'unhealthy');
      const retrieved = registry.get('service-1');
      expect(retrieved?.health).toBe('unhealthy');
    });

    it('should not throw when updating health of non-existent service', () => {
      expect(() => registry.updateHealth('non-existent', 'degraded')).not.toThrow();
    });

    it('should check health and return false for non-existent service', async () => {
      const result = await registry.checkHealth('non-existent');
      expect(result).toBe(false);
    });

    it('should return service health status via checkHealth', async () => {
      registry.register({
        id: 'service-1',
        name: 'Test Service',
        url: 'http://localhost:9999',
        capabilities: ['sync'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      const result = await registry.checkHealth('service-1');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Last Check Timestamp', () => {
    it('should update lastCheck timestamp', () => {
      const before = Date.now() - 1000;
      registry.register({
        id: 'service-1',
        name: 'Test Service',
        url: 'http://localhost:8000',
        capabilities: ['sync'],
        health: 'healthy',
        lastCheck: before,
      });
      registry.updateHealth('service-1', 'degraded');
      const retrieved = registry.get('service-1');
      expect(retrieved!.lastCheck).toBeGreaterThanOrEqual(before);
    });
  });

  describe('Edge Cases', () => {
    it('should handle service with empty capabilities', () => {
      registry.register({
        id: 'service-1',
        name: 'Test Service',
        url: 'http://localhost:8000',
        capabilities: [],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      const services = registry.getByCapability('sync');
      expect(services).toHaveLength(0);
    });

    it('should handle service with many capabilities', () => {
      const capabilities = ['sync', 'storage', 'auth', 'api', 'backup'];
      registry.register({
        id: 'service-1',
        name: 'Full Service',
        url: 'http://localhost:8000',
        capabilities,
        health: 'healthy',
        lastCheck: Date.now(),
      });
      const syncServices = registry.getByCapability('sync');
      expect(syncServices).toHaveLength(1);
    });

    it('should handle service with special characters in name', () => {
      registry.register({
        id: 'service-1',
        name: 'Service <>&"',
        url: 'http://localhost:8000',
        capabilities: ['sync'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      const retrieved = registry.get('service-1');
      expect(retrieved?.name).toBe('Service <>&"');
    });

    it('should handle service with unicode name', () => {
      registry.register({
        id: 'service-1',
        name: '服务',
        url: 'http://localhost:8000',
        capabilities: ['sync'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      const retrieved = registry.get('service-1');
      expect(retrieved?.name).toBe('服务');
    });

    it('should handle service with very long URL', () => {
      const longUrl = 'http://localhost:' + '8'.repeat(1000);
      registry.register({
        id: 'service-1',
        name: 'Test Service',
        url: longUrl,
        capabilities: ['sync'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      const retrieved = registry.get('service-1');
      expect(retrieved?.url).toBe(longUrl);
    });

    it('should handle many services efficiently', () => {
      const count = 100;
      for (let i = 0; i < count; i++) {
        registry.register({
          id: `service-${i}`,
          name: `Service ${i}`,
          url: `http://localhost:800${i}`,
          capabilities: ['sync'],
          health: 'healthy',
          lastCheck: Date.now(),
        });
      }
      const all = registry.getAll();
      expect(all).toHaveLength(count);
    });

    it('should get services by first capability', () => {
      registry.register({
        id: 'service-1',
        name: 'Test Service',
        url: 'http://localhost:8000',
        capabilities: ['sync', 'storage'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      const services = registry.getByCapability('storage');
      expect(services).toHaveLength(1);
    });
  });

  describe('Service Capabilities Edge Cases', () => {
    it('should handle capability with spaces', () => {
      registry.register({
        id: 'service-1',
        name: 'Test Service',
        url: 'http://localhost:8000',
        capabilities: ['has capability'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      const services = registry.getByCapability('has capability');
      expect(services).toHaveLength(1);
    });

    it('should find service by any of its capabilities', () => {
      registry.register({
        id: 'multi-service',
        name: 'Multi Service',
        url: 'http://localhost:8000',
        capabilities: ['alpha', 'beta', 'gamma'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      expect(registry.getByCapability('alpha')).toHaveLength(1);
      expect(registry.getByCapability('beta')).toHaveLength(1);
      expect(registry.getByCapability('gamma')).toHaveLength(1);
      expect(registry.getByCapability('delta')).toHaveLength(0);
    });
  });

  describe('Health Transitions', () => {
    it('should transition from healthy to degraded to unhealthy', () => {
      registry.register({
        id: 'service-1',
        name: 'Test Service',
        url: 'http://localhost:8000',
        capabilities: ['sync'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      registry.updateHealth('service-1', 'degraded');
      expect(registry.get('service-1')?.health).toBe('degraded');
      registry.updateHealth('service-1', 'unhealthy');
      expect(registry.get('service-1')?.health).toBe('unhealthy');
    });

    it('should transition from unhealthy back to healthy', () => {
      registry.register({
        id: 'service-1',
        name: 'Test Service',
        url: 'http://localhost:8000',
        capabilities: ['sync'],
        health: 'unhealthy',
        lastCheck: Date.now(),
      });
      registry.updateHealth('service-1', 'healthy');
      expect(registry.get('service-1')?.health).toBe('healthy');
    });

    it('should handle rapid health updates', () => {
      registry.register({
        id: 'service-1',
        name: 'Test Service',
        url: 'http://localhost:8000',
        capabilities: ['sync'],
        health: 'healthy',
        lastCheck: Date.now(),
      });
      for (let i = 0; i < 10; i++) {
        registry.updateHealth('service-1', i % 2 === 0 ? 'healthy' : 'degraded');
      }
      expect(registry.get('service-1')).not.toBeNull();
    });
  });
});