/**
 * Node Health Monitor - V199
 * Monitors node health, detects failures, and reports status changes
 */

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'offline';

export interface HealthMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: number;
}

export interface HealthCheck {
  nodeId: string;
  status: HealthStatus;
  metrics: HealthMetrics;
  issues: string[];
}

type CheckFunction = () => Promise<boolean>;

interface NodeRegistration {
  checkFn: CheckFunction;
  status: HealthStatus;
  metrics: HealthMetrics;
  history: HealthCheck[];
  statusChangeCallbacks: Set<(check: HealthCheck) => void>;
  registeredAt: number;
}

export class NodeHealthMonitor {
  private nodes: Map<string, NodeRegistration> = new Map();

  /**
   * Register a node with a health check function
   */
  registerNode(nodeId: string, checkFn: CheckFunction): void {
    if (this.nodes.has(nodeId)) {
      return;
    }
    this.nodes.set(nodeId, {
      checkFn,
      status: 'offline',
      metrics: {
        uptime: 0,
        responseTime: 0,
        errorRate: 0,
        lastCheck: 0,
      },
      history: [],
      statusChangeCallbacks: new Set(),
      registeredAt: Date.now(),
    });
  }

  /**
   * Unregister a node
   */
  unregisterNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    this.consecutiveFailures.delete(nodeId);
  }

  private consecutiveFailures: Map<string, number> = new Map();

  /**
   * Check a specific node's health
   */
  async checkNode(nodeId: string): Promise<HealthCheck> {
    const registration = this.nodes.get(nodeId);
    if (!registration) {
      return {
        nodeId,
        status: 'offline',
        metrics: {
          uptime: 0,
          responseTime: 0,
          errorRate: 0,
          lastCheck: Date.now(),
        },
        issues: ['Node not registered'],
      };
    }

    const startTime = Date.now();
    let isHealthy = false;
    let errorMessage = '';

    try {
      isHealthy = await registration.checkFn();
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : String(error);
    }

    const responseTime = Date.now() - startTime;
    const previousStatus = registration.status;

    // Calculate new error rate first
    const newErrorRate = errorMessage || !isHealthy
      ? (registration.metrics.errorRate * 0.7 + 0.3)
      : registration.metrics.errorRate * 0.9;

    // Update consecutive failures counter
    const consecutiveFailures = this.consecutiveFailures.get(nodeId) || 0;
    if (!isHealthy || errorMessage) {
      this.consecutiveFailures.set(nodeId, consecutiveFailures + 1);
    } else {
      this.consecutiveFailures.set(nodeId, 0);
    }

    // Calculate new status using the new error rate
    const newStatus = this.determineStatus(isHealthy, responseTime, errorMessage, newErrorRate, this.consecutiveFailures.get(nodeId) || 0);

    // Update metrics
    registration.metrics = {
      uptime: isHealthy
        ? registration.metrics.uptime + responseTime
        : registration.metrics.uptime,
      responseTime,
      errorRate: Math.min(1, Math.max(0, newErrorRate)),
      lastCheck: Date.now(),
    };

    registration.status = newStatus;

    const issues = this.generateIssues(newStatus, errorMessage, responseTime);

    const healthCheck: HealthCheck = {
      nodeId,
      status: newStatus,
      metrics: { ...registration.metrics },
      issues,
    };

    // Add to history (keep last 100 entries)
    registration.history.push(healthCheck);
    if (registration.history.length > 100) {
      registration.history.shift();
    }

    // Notify callbacks if status changed
    if (previousStatus !== newStatus) {
      registration.statusChangeCallbacks.forEach((callback) => {
        try {
          callback(healthCheck);
        } catch {
          // Ignore callback errors
        }
      });
    }

    return healthCheck;
  }

  /**
   * Check all registered nodes
   */
  async checkAllNodes(): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];
    const checkPromises: Promise<void>[] = [];

    this.nodes.forEach((_, nodeId) => {
      checkPromises.push(
        this.checkNode(nodeId).then((check) => {
          checks.push(check);
        })
      );
    });

    await Promise.all(checkPromises);
    return checks;
  }

  /**
   * Get current status of a node
   */
  getNodeStatus(nodeId: string): HealthStatus | null {
    const registration = this.nodes.get(nodeId);
    return registration ? registration.status : null;
  }

  /**
   * Subscribe to status changes for a node
   * @returns Unsubscribe function
   */
  onStatusChange(nodeId: string, callback: (check: HealthCheck) => void): () => void {
    const registration = this.nodes.get(nodeId);
    if (!registration) {
      return () => {};
    }

    registration.statusChangeCallbacks.add(callback);

    return () => {
      registration.statusChangeCallbacks.delete(callback);
    };
  }

  /**
   * Get health check history for a node
   */
  getHistory(nodeId: string): HealthCheck[] {
    const registration = this.nodes.get(nodeId);
    return registration ? [...registration.history] : [];
  }

  /**
   * Determine health status based on conditions
   */
  private determineStatus(
    isHealthy: boolean,
    responseTime: number,
    errorMessage: string,
    errorRate: number,
    consecutiveFailures: number
  ): HealthStatus {
    if (!isHealthy || errorMessage) {
      if (errorRate > 0.5 || consecutiveFailures >= 2) {
        return 'unhealthy';
      }
      return 'degraded';
    }

    if (responseTime > 5000) {
      return 'unhealthy';
    }

    if (responseTime > 2000) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Generate issue messages based on status
   */
  private generateIssues(status: HealthStatus, errorMessage: string, responseTime: number): string[] {
    const issues: string[] = [];

    if (errorMessage) {
      issues.push(`Health check failed: ${errorMessage}`);
    }

    switch (status) {
      case 'unhealthy':
        issues.push('Node is unhealthy and requires attention');
        if (responseTime > 5000) {
          issues.push(`Response time exceeded threshold: ${responseTime}ms`);
        }
        break;
      case 'degraded':
        issues.push('Node is operating in degraded mode');
        if (responseTime > 2000) {
          issues.push(`Elevated response time detected: ${responseTime}ms`);
        }
        break;
      case 'offline':
        issues.push('Node is offline or unreachable');
        break;
      case 'healthy':
        // No issues for healthy status
        break;
    }

    return issues;
  }
}

export default NodeHealthMonitor;