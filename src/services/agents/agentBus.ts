import type { AgentMessage } from './types'
import { roleAgentRegistry } from './roleSystem'
import type { AgentRole } from './roleSystem'

type MessageHandler = (msg: AgentMessage) => void | Promise<void>

/**
 * V98 Enhancement: Role-based message routing
 * Supports dispatching messages based on agent roles (planner, operator, critic, summarizer)
 */
class AgentBus {
  private handlers = new Map<string, Set<MessageHandler>>()
  private agentQueues = new Map<string, AgentMessage[]>()
  private processing = new Set<string>()
  // V98: Role-based subscriptions for broadcast patterns
  private roleSubscriptions = new Map<AgentRole, Set<string>>()

  subscribe(agentId: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(agentId)) {
      this.handlers.set(agentId, new Set())
    }
    this.handlers.get(agentId)!.add(handler)
    return () => {
      this.handlers.get(agentId)?.delete(handler)
    }
  }

  async send(msg: AgentMessage): Promise<void> {
    if (!this.agentQueues.has(msg.to)) {
      this.agentQueues.set(msg.to, [])
    }
    this.agentQueues.get(msg.to)!.push(msg)
    this.processQueue(msg.to)
  }

  async broadcast(msg: Omit<AgentMessage, 'to'>): Promise<void> {
    const allAgents = Array.from(this.handlers.keys())
    await Promise.all(
      allAgents
        .filter(id => id !== msg.from)
        .map(id => this.send({ ...msg, to: id }))
    )
  }

  private async processQueue(agentId: string): Promise<void> {
    if (this.processing.has(agentId)) return
    this.processing.add(agentId)

    try {
      while (this.agentQueues.has(agentId) && this.agentQueues.get(agentId)!.length > 0) {
        const msg = this.agentQueues.get(agentId)!.shift()!
        const handlers = this.handlers.get(agentId)
        if (handlers) {
          await Promise.all(
            Array.from(handlers).map(h => {
              try {
                const result = h(msg)
                if (result instanceof Promise) return result.catch(console.warn)
              } catch (e) {
                console.warn(`[AgentBus] Handler error for ${agentId}:`, e)
              }
            })
          )
        }
      }
    } finally {
      this.processing.delete(agentId)
    }
  }

  // V98: Subscribe to messages by agent role
  subscribeByRole(role: AgentRole, agentId: string, handler: MessageHandler): () => void {
    if (!this.roleSubscriptions.has(role)) {
      this.roleSubscriptions.set(role, new Set())
    }
    this.roleSubscriptions.get(role)!.add(agentId)
    return this.subscribe(agentId, handler)
  }

  // V98: Send to all agents of a specific role
  async sendToRole(role: AgentRole, msg: Omit<AgentMessage, 'to'>): Promise<void> {
    const agents = roleAgentRegistry.getByRole(role)
    await Promise.all(
      agents.map(agent => this.send({ ...msg, to: agent.id }))
    )
  }

  // V98: Get agents registered for a role
  getAgentsByRole(role: AgentRole): string[] {
    return roleAgentRegistry.getByRole(role).map(a => a.id)
  }
}

export const agentBus = new AgentBus()
