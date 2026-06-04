/**
 * Node Health Monitor - V189 Iteration 1/9
 * Implements nanobot-style distributed node health checking.
 * 
 * nanobot Distributed Mesh mapping:
 * - 节点健康 → 分布式节点监控
 * - Heartbeat → 定期健康检查
 * - Degraded state → 降级运行
 */

export type NodeStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface NodeHealth {
  nodeId: string;
  status: NodeStatus;
  latency: number;
  lastCheck: number;
  consecutiveFailures: number;
}

export interface NodeHealthCheckResult {
  nodeId: string;
  healthy: boolean;
  latency: number;
}

/**
 * NodeHealthMonitor manages distributed node health monitoring.
 * Simulates network checks without actual external connections.
 */
export class NodeHealthMonitor {
  private nodes: Map<string, NodeHealth> = new Map();
  private checkInterval: number = 30000; // 30 seconds default
  private maxConsecutiveFailures: number = 3;

  /**
   * Check the health of a specific node.
   * Simulates network latency and failure conditions.
   */
  async checkNode(nodeId: string): Promise<NodeHealth> {
    // Simulate network check
    const result = await this.simulateCheck(nodeId);
    
    let health = this.nodes.get(nodeId);
    if (!health) {
      health = {
        nodeId,
        status: 'healthy',
        latency: 0,
        lastCheck: 0,
        consecutiveFailures: 0,
      };
      this.nodes.set(nodeId, health);
    }

    health.lastCheck = Date.now();
    health.latency = result.latency;

    if (result.healthy) {
      health.consecutiveFailures = 0;
      health.status = this.calculateStatus(health);
    } else {
      health.consecutiveFailures++;
      health.status = this.calculateStatus(health);
    }

    return { ...health };
  }

  /**
   * Batch check all registered nodes.
   */
  async checkAll(): Promise<NodeHealth[]> {
    const nodeIds = Array.from(this.nodes.keys());
    const results = await Promise.all(
      nodeIds.map(nodeId => this.checkNode(nodeId))
    );
    return results;
  }

  /**
   * Mark a node as unhealthy directly.
   */
  markUnhealthy(nodeId: string): void {
    let health = this.nodes.get(nodeId);
    if (!health) {
      health = {
        nodeId,
        status: 'unhealthy',
        latency: 0,
        lastCheck: Date.now(),
        consecutiveFailures: this.maxConsecutiveFailures,
      };
      this.nodes.set(nodeId, health);
    } else {
      health.consecutiveFailures = this.maxConsecutiveFailures;
      health.status = 'unhealthy';
      health.lastCheck = Date.now();
    }
  }

  /**
   * Get list of healthy node IDs.
   */
  getHealthyNodes(): string[] {
    return Array.from(this.nodes.values())
      .filter(node => node.status === 'healthy')
      .map(node => node.nodeId);
  }

  /**
   * Get list of all registered node IDs.
   */
  getAllNodeIds(): string[] {
    return Array.from(this.nodes.keys());
  }

  /**
   * Get health info for a specific node.
   */
  getNodeHealth(nodeId: string): NodeHealth | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Register a new node for monitoring.
   */
  registerNode(nodeId: string): void {
    if (!this.nodes.has(nodeId)) {
      this.nodes.set(nodeId, {
        nodeId,
        status: 'healthy',
        latency: 0,
        lastCheck: 0,
        consecutiveFailures: 0,
      });
    }
  }

  /**
   * Unregister a node from monitoring.
   */
  unregisterNode(nodeId: string): void {
    this.nodes.delete(nodeId);
  }

  /**
   * Set check interval in milliseconds.
   */
  setCheckInterval(ms: number): void {
    this.checkInterval = Math.max(1000, ms);
  }

  /**
   * Get check interval.
   */
  getCheckInterval(): number {
    return this.checkInterval;
  }

  /**
   * Calculate node status based on consecutive failures.
   */
  private calculateStatus(health: NodeHealth): NodeStatus {
    if (health.consecutiveFailures >= this.maxConsecutiveFailures) {
      return 'unhealthy';
    } else if (health.consecutiveFailures > 0) {
      return 'degraded';
    }
    return 'healthy';
  }

  /**
   * Simulate a network check to a node.
   * Returns a mock result with simulated latency and occasional failures.
   */
  private async simulateCheck(nodeId: string): Promise<NodeHealthCheckResult> {
    // Simulate network latency (10-200ms)
    const latency = Math.floor(Math.random() * 190) + 10;
    
    // Simulate occasional failures based on nodeId hash
    const hash = this.hashString(nodeId);
    const failureChance = (hash % 100) / 1000; // 0-10% failure rate
    const healthy = Math.random() > failureChance;

    // Await for simulated network delay
    await this.delay(latency);

    return { nodeId, healthy, latency };
  }

  /**
   * Simple string hash function for deterministic failure simulation.
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Promise-based delay helper.
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear all nodes (for testing).
   */
  clear(): void {
    this.nodes.clear();
  }

  /**
   * Get node count (for testing).
   */
  getNodeCount(): number {
    return this.nodes.size;
  }
}