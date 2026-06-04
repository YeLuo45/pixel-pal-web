/**
 * Health Monitor v2
 * nanobot-design Health Monitor v2 - Probe + Heartbeat + Alert + Report
 */

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface NodeHealth {
  id: string;
  status: HealthStatus;
  lastHeartbeat: number;
  cpu: number;
  memory: number;
}

export interface Alert {
  nodeId: string;
  severity: AlertSeverity;
  message: string;
  timestamp: number;
}

export class HealthMonitorV2 {
  private nodes: Map<string, NodeHealth> = new Map();
  private alerts: Alert[] = [];
  private heartbeatTimeoutMs = 30000;

  registerNode(node: NodeHealth): void {
    this.nodes.set(node.id, { ...node });
  }

  checkHealth(id: string): NodeHealth | null {
    const node = this.nodes.get(id);
    if (!node) return null;

    const now = Date.now();
    if (now - node.lastHeartbeat > this.heartbeatTimeoutMs) {
      node.status = 'unhealthy';
      this.createAlert(id, 'critical', 'Node missed heartbeat');
    } else if (node.cpu > 0.8 || node.memory > 0.8) {
      node.status = 'degraded';
      this.createAlert(id, 'warning', 'High resource usage');
    } else {
      node.status = 'healthy';
    }

    return { ...node };
  }

  heartbeat(id: string): void {
    const node = this.nodes.get(id);
    if (node) {
      node.lastHeartbeat = Date.now();
    }
  }

  getAlerts(): Alert[] {
    return [...this.alerts];
  }

  generateReport(): string {
    const all = Array.from(this.nodes.values());
    const healthy = all.filter(n => n.status === 'healthy').length;
    const degraded = all.filter(n => n.status === 'degraded').length;
    const unhealthy = all.filter(n => n.status === 'unhealthy').length;
    return `Health Report: Total=${all.length} Healthy=${healthy} Degraded=${degraded} Unhealthy=${unhealthy} Alerts=${this.alerts.length}`;
  }

  getNode(id: string): NodeHealth | undefined {
    return this.nodes.get(id);
  }

  getAllNodes(): NodeHealth[] {
    return Array.from(this.nodes.values());
  }

  getHealthyNodes(): NodeHealth[] {
    return Array.from(this.nodes.values()).filter(n => n.status === 'healthy');
  }

  getDegradedNodes(): NodeHealth[] {
    return Array.from(this.nodes.values()).filter(n => n.status === 'degraded');
  }

  getUnhealthyNodes(): NodeHealth[] {
    return Array.from(this.nodes.values()).filter(n => n.status === 'unhealthy');
  }

  removeNode(id: string): boolean {
    return this.nodes.delete(id);
  }

  getNodeCount(): number {
    return this.nodes.size;
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return this.alerts.filter(a => a.severity === severity);
  }

  getAlertsByNode(nodeId: string): Alert[] {
    return this.alerts.filter(a => a.nodeId === nodeId);
  }

  getAlertCount(): number {
    return this.alerts.length;
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  clearAlertsForNode(nodeId: string): number {
    const before = this.alerts.length;
    this.alerts = this.alerts.filter(a => a.nodeId !== nodeId);
    return before - this.alerts.length;
  }

  setHeartbeatTimeout(ms: number): void {
    this.heartbeatTimeoutMs = Math.max(0, ms);
  }

  getHeartbeatTimeout(): number {
    return this.heartbeatTimeoutMs;
  }

  getAverageCpu(): number {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((sum, n) => sum + n.cpu, 0) / all.length) * 100) / 100;
  }

  getAverageMemory(): number {
    const all = Array.from(this.nodes.values());
    if (all.length === 0) return 0;
    return Math.round((all.reduce((sum, n) => sum + n.memory, 0) / all.length) * 100) / 100;
  }

  getCriticalAlertCount(): number {
    return this.getAlertsBySeverity('critical').length;
  }

  getWarningAlertCount(): number {
    return this.getAlertsBySeverity('warning').length;
  }

  isHealthy(id: string): boolean {
    return this.nodes.get(id)?.status === 'healthy';
  }

  private createAlert(nodeId: string, severity: AlertSeverity, message: string): void {
    this.alerts.push({
      nodeId,
      severity,
      message,
      timestamp: Date.now(),
    });
  }

  clearAll(): void {
    this.nodes.clear();
    this.alerts = [];
  }
}

export default HealthMonitorV2;