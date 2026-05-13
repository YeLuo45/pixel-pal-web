import { executorAgent } from './executorAgent'
import { reviewerAgent } from './reviewerAgent'
import { agentRegistry } from './agentRegistry'
import { roleAgentRegistry } from './roleSystem'

export function initMultiAgentSystem(): void {
  console.log('[MultiAgent] Initializing...')

  // V98: Initialize professional role system
  roleAgentRegistry.initialize()
  console.log('[MultiAgent] Role system initialized with', roleAgentRegistry.size(), 'roles')

  // executorAgent和reviewerAgent构造时会自动注册
  void executorAgent
  void reviewerAgent

  // 注册orchestrator
  if (!agentRegistry.get('orchestrator')) {
    agentRegistry.register({
      id: 'orchestrator',
      name: '任务编排Agent',
      type: 'orchestrator' as any,
      capabilities: ['task_decomposition', 'agent_selection', 'progress_tracking'],
    })
  }

  const agents = agentRegistry.list()
  console.log('[MultiAgent] Ready - registered:', agents.map(a => a.id).join(', '))
}
