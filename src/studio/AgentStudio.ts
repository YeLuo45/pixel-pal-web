/**
 * Agent Studio
 * chatdev-design Multi-Agent Studio v2 - Workspace + Message + Task + State
 */

export type AgentStatus = 'idle' | 'busy' | 'offline';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
}

export interface Task {
  id: string;
  description: string;
  assignee?: string;
  status: TaskStatus;
  priority: number;
}

export interface Message {
  from: string;
  to: string;
  content: string;
  timestamp: number;
}

export class AgentStudio {
  private agents: Map<string, Agent> = new Map();
  private tasks: Map<string, Task> = new Map();
  private messages: Message[] = [];
  private agentCounter = 0;
  private taskCounter = 0;

  /**
   * Create a new agent
   */
  createAgent(name: string, role: string): Agent {
    const id = `agent-${++this.agentCounter}`;
    const agent: Agent = { id, name, role, status: 'idle' };
    this.agents.set(id, agent);
    return agent;
  }

  /**
   * Assign a task to an agent
   */
  assignTask(agentId: string, task: Omit<Task, 'id'>): boolean {
    if (!this.agents.has(agentId)) return false;
    const id = `task-${++this.taskCounter}`;
    const newTask: Task = { ...task, id, assignee: agentId };
    this.tasks.set(id, newTask);

    // Update agent status to busy
    const agent = this.agents.get(agentId)!;
    agent.status = 'busy';

    return true;
  }

  /**
   * Send a message between agents
   */
  sendMessage(from: string, to: string, content: string): boolean {
    if (!this.agents.has(from) || !this.agents.has(to)) return false;
    const msg: Message = { from, to, content, timestamp: Date.now() };
    this.messages.push(msg);
    return true;
  }

  /**
   * Get tasks for an agent
   */
  getAgentTasks(agentId: string): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.assignee === agentId);
  }

  /**
   * Get messages for an agent (sent or received)
   */
  getMessages(agentId: string): Message[] {
    return this.messages.filter(m => m.from === agentId || m.to === agentId);
  }

  /**
   * Get workspace statistics
   */
  getWorkspaceStats(): { agentCount: number; taskCount: number; messageCount: number } {
    return {
      agentCount: this.agents.size,
      taskCount: this.tasks.size,
      messageCount: this.messages.length,
    };
  }

  /**
   * Get agent by id
   */
  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  /**
   * Get all agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get all tasks
   */
  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: TaskStatus): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    task.status = status;

    // If task completed, mark agent as idle
    if (status === 'completed' && task.assignee) {
      const agent = this.agents.get(task.assignee);
      if (agent) {
        const hasOtherBusy = Array.from(this.tasks.values()).some(
          t => t.assignee === task.assignee && t.id !== taskId && t.status !== 'completed'
        );
        if (!hasOtherBusy) agent.status = 'idle';
      }
    }

    return true;
  }

  /**
   * Remove agent
   */
  removeAgent(id: string): boolean {
    // Unassign all tasks
    for (const task of this.tasks.values()) {
      if (task.assignee === id) task.assignee = undefined;
    }
    return this.agents.delete(id);
  }

  /**
   * Get pending tasks
   */
  getPendingTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'pending');
  }

  /**
   * Get in-progress tasks
   */
  getInProgressTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'in_progress');
  }

  /**
   * Get completed tasks
   */
  getCompletedTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'completed');
  }

  /**
   * Get task by id
   */
  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  /**
   * Get message count between two agents
   */
  getMessageCount(from: string, to: string): number {
    return this.messages.filter(m => m.from === from && m.to === to).length;
  }

  /**
   * Get agents by role
   */
  getAgentsByRole(role: string): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.role === role);
  }

  /**
   * Get agents by status
   */
  getAgentsByStatus(status: AgentStatus): Agent[] {
    return Array.from(this.agents.values()).filter(a => a.status === status);
  }

  /**
   * Broadcast message to all agents
   */
  broadcast(from: string, content: string): number {
    let count = 0;
    for (const agent of this.agents.values()) {
      if (agent.id !== from) {
        this.messages.push({ from, to: agent.id, content, timestamp: Date.now() });
        count++;
      }
    }
    return count;
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.messages = [];
  }

  /**
   * Clear all data
   */
  clearAll(): void {
    this.agents.clear();
    this.tasks.clear();
    this.messages = [];
    this.agentCounter = 0;
    this.taskCounter = 0;
  }
}

export default AgentStudio;