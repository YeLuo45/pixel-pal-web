/**
 * Task Delegator
 * chatdev-design Task Delegator - Delegate + Select + Load + History
 */

export interface Agent {
  id: string;
  capacity: number;
  currentLoad: number;
  active: boolean;
}

export interface Delegation {
  taskId: string;
  agentId: string;
  timestamp: number;
  reason: string;
}

export class TaskDelegator {
  private agents: Map<string, Agent> = new Map();
  private history: Delegation[] = [];
  private activeDelegations: Map<string, Delegation> = new Map();

  delegate(taskId: string, reason: string): Delegation | null {
    const agentId = this.selectAgent();
    if (!agentId) return null;

    const delegation: Delegation = {
      taskId,
      agentId,
      timestamp: Date.now(),
      reason,
    };

    this.history.push(delegation);
    this.activeDelegations.set(taskId, delegation);

    const agent = this.agents.get(agentId);
    if (agent) {
      agent.currentLoad++;
    }

    return { ...delegation };
  }

  registerAgent(id: string, capacity: number): void {
    this.agents.set(id, {
      id,
      capacity,
      currentLoad: 0,
      active: true,
    });
  }

  selectAgent(): string | null {
    let best: Agent | null = null;
    let bestAvailable = -1;

    for (const agent of this.agents.values()) {
      if (!agent.active) continue;
      const available = agent.capacity - agent.currentLoad;
      if (available <= 0) continue;
      if (available > bestAvailable) {
        bestAvailable = available;
        best = agent;
      }
    }

    return best?.id ?? null;
  }

  getHistory(): Delegation[] {
    return [...this.history];
  }

  getActiveDelegations(): Delegation[] {
    return Array.from(this.activeDelegations.values()).map(d => ({ ...d }));
  }

  completeDelegation(taskId: string): boolean {
    const delegation = this.activeDelegations.get(taskId);
    if (!delegation) return false;

    const agent = this.agents.get(delegation.agentId);
    if (agent) {
      agent.currentLoad = Math.max(0, agent.currentLoad - 1);
    }

    return this.activeDelegations.delete(taskId);
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAvailableAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.active && a.currentLoad < a.capacity);
  }

  getActiveAgents(): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.active);
  }

  getAgentCount(): number {
    return this.agents.size;
  }

  hasAgent(id: string): boolean {
    return this.agents.has(id);
  }

  removeAgent(id: string): boolean {
    return this.agents.delete(id);
  }

  setAgentActive(id: string, active: boolean): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;
    agent.active = active;
    return true;
  }

  getHistoryCount(): number {
    return this.history.length;
  }

  getActiveCount(): number {
    return this.activeDelegations.size;
  }

  getDelegationsByAgent(agentId: string): Delegation[] {
    return this.history.filter(d => d.agentId === agentId);
  }

  getDelegationByTask(taskId: string): Delegation | undefined {
    return this.activeDelegations.get(taskId);
  }

  getAverageLoad(): number {
    if (this.agents.size === 0) return 0;
    const sum = Array.from(this.agents.values()).reduce((acc, a) => acc + a.currentLoad, 0);
    return Math.round(sum / this.agents.size * 100) / 100;
  }

  getTotalCapacity(): number {
    return Array.from(this.agents.values()).reduce((sum, a) => sum + a.capacity, 0);
  }

  getTotalLoad(): number {
    return Array.from(this.agents.values()).reduce((sum, a) => sum + a.currentLoad, 0);
  }

  getUtilization(): number {
    const cap = this.getTotalCapacity();
    if (cap === 0) return 0;
    return Math.round((this.getTotalLoad() / cap) * 100) / 100;
  }

  clearHistory(): void {
    this.history = [];
  }

  clearAll(): void {
    this.agents.clear();
    this.history = [];
    this.activeDelegations.clear();
  }
}

export default TaskDelegator;