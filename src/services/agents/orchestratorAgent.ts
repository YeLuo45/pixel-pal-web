import { agentRegistry } from './agentRegistry'
import { agentBus } from './agentBus'
import { multiAgentStore } from './multiAgentStore'
import type { AgentMessage, Task, AgentConfig } from './types'
import { AgentType } from './types'
import { taskAssigner } from './roleSystem'
import type { TaskAssignment } from './roleSystem'

let taskCounter = 0

export class OrchestratorAgent {
  private id = 'orchestrator'
  private pendingTasks = new Map<string, Task>()
  private currentTraceId: string | null = null

  constructor() {
    agentBus.subscribe(this.id, this.handleMessage.bind(this))
  }

  private async handleMessage(msg: AgentMessage): Promise<void> {
    switch (msg.type) {
      case 'task':
        await this.processUserRequest(msg.payload as { message: string })
        break
      case 'result':
        await this.handleResult(msg.payload as { taskId: string; result: unknown })
        break
      case 'error':
        await this.handleError(msg.payload as { taskId: string; error: string })
        break
    }
  }

  async processUserRequest(input: { message: string }): Promise<void> {
    const parentId = `task-${++taskCounter}`
    this.currentTraceId = parentId

    // V98: Use TaskAssigner for intelligent task decomposition and agent assignment
    const assignment = taskAssigner.assign({ description: input.message })

    console.log(`[Orchestrator] Task assignment: ${assignment.assignedRole} (${assignment.reasoning})`)

    // Create task with assigned agent info
    const subTasks = this.decomposeTask(parentId, input.message, assignment)

    subTasks.forEach(t => this.pendingTasks.set(t.id, t))

    // 同步到sessionStorage
    multiAgentStore.save({
      traceId: parentId,
      tasks: Array.from(this.pendingTasks.values()),
    })

    for (const task of subTasks) {
      const executor = this.selectExecutor(task)
      task.assignedTo = executor.id

      await agentBus.send({
        from: this.id,
        to: executor.id,
        type: 'task',
        payload: task,
        timestamp: Date.now(),
        traceId: parentId,
      })
    }

    console.log(`[Orchestrator] Started ${subTasks.length} tasks`)
  }

  private decomposeTask(parentId: string, message: string, assignment?: TaskAssignment): Task[] {
    const tasks: Task[] = []

    // V98: Use complexity-based task decomposition
    if (assignment?.shouldDecompose) {
      // For complex tasks, create structured subtasks based on role
      const role = assignment?.assignedRole || 'planner'

      if (role === 'planner' || role === 'operator') {
        // Planning phase
        tasks.push({
          id: `${parentId}-plan`,
          type: 'task-planning',
          description: `Plan: ${message.substring(0, 100)}...`,
          inputs: { message },
          status: 'pending',
          createdAt: Date.now(),
          dependencies: [],
        })

        // Execution phase
        tasks.push({
          id: `${parentId}-exec`,
          type: 'task-execution',
          description: `Execute: ${message.substring(0, 100)}...`,
          inputs: { message },
          status: 'pending',
          createdAt: Date.now(),
          dependencies: [`${parentId}-plan`],
        })

        // Review phase
        tasks.push({
          id: `${parentId}-review`,
          type: 'task-review',
          description: `Review execution results`,
          inputs: { message },
          status: 'pending',
          createdAt: Date.now(),
          dependencies: [`${parentId}-exec`],
        })
      } else {
        // For critic/summarizer roles, single task
        tasks.push({
          id: `${parentId}-task`,
          type: `task-${role}`,
          description: message,
          inputs: { message },
          status: 'pending',
          createdAt: Date.now(),
          dependencies: [],
        })
      }
    } else {
      // Simple single-step execution
      tasks.push({
        id: `${parentId}-exec`,
        type: 'general',
        description: message,
        inputs: { message },
        status: 'pending',
        createdAt: Date.now(),
        dependencies: [],
      })
    }

    return tasks
  }

  private selectExecutor(task: Task): AgentConfig {
    const executors = agentRegistry.getByType(AgentType.EXECUTOR)
    return executors[0] || { id: 'executor', name: 'Default', type: AgentType.EXECUTOR, capabilities: [] } as AgentConfig
  }

  private async handleResult(payload: { taskId: string; result: unknown }): Promise<void> {
    const task = this.pendingTasks.get(payload.taskId)
    if (!task) return

    task.status = 'completed'
    task.result = payload.result
    task.completedAt = Date.now()
    this.pendingTasks.delete(payload.taskId)

    multiAgentStore.save({
      traceId: this.currentTraceId || '',
      tasks: Array.from(this.pendingTasks.values()),
    })

    if (this.pendingTasks.size === 0) {
      console.log('[Orchestrator] All tasks completed')
      setTimeout(() => multiAgentStore.clear(), 3000)
    }
  }

  private async handleError(payload: { taskId: string; error: string }): Promise<void> {
    const task = this.pendingTasks.get(payload.taskId)
    if (task) {
      task.status = 'failed'
      this.pendingTasks.delete(payload.taskId)
      multiAgentStore.save({
        traceId: this.currentTraceId || '',
        tasks: Array.from(this.pendingTasks.values()),
      })
    }
    console.warn(`[Orchestrator] Task failed: ${payload.error}`)
  }
}

export const orchestratorAgent = new OrchestratorAgent()
