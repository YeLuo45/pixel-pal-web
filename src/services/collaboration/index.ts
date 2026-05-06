/**
 * Collaboration Services - V33 Multi-Agent Collaboration System
 * 
 * Barrel export for all collaboration-related services.
 * 
 * @example
 * import { 
 *   CollaborationOrchestrator,
 *   SharedContext,
 *   TaskDecomposer,
 *   PersonaRoleRegistry,
 *   ResultAggregator,
 *   createOrchestrator,
 *   getRoleRegistry,
 * } from '@/services/collaboration';
 */

// Types
export * from './types';

// Core Components
export { SharedContext, createSharedContext } from './sharedContext';
export { TaskDecomposer, createTaskDecomposer } from './taskDecomposer';
export { ResultAggregator, createResultAggregator } from './resultAggregator';
export { PersonaRoleRegistry, getRoleRegistry, getAvailableRoles, isValidRole, getRoleDisplayName, getRoleEmoji } from './personaRoleRegistry';
export { CollaborationOrchestrator, createOrchestrator } from './orchestrator';

// ============================================================================
// Quick Start Example
// ============================================================================

/**
 * Quick Start: Run a simple collaboration session
 * 
 * ```typescript
 * import { createOrchestrator } from '@/services/collaboration';
 * 
 * async function main() {
 *   const orchestrator = createOrchestrator();
 *   
 *   // Subscribe to events
 *   orchestrator.onEvent((event) => {
 *     console.log(`[${event.type}]`, event.data);
 *   });
 *   
 *   // Start collaboration
 *   const session = await orchestrator.startSession('分析我这周的情绪变化并给出建议');
 *   
 *   // Get progress
 *   const progress = orchestrator.getProgress(session.id);
 *   console.log('Progress:', progress);
 *   
 *   // Close session when done
 *   orchestrator.closeSession(session.id);
 * }
 * 
 * main();
 * ```
 */

// ============================================================================
// Default Export
// ============================================================================

export default {
  orchestrator: createOrchestrator,
  roleRegistry: getRoleRegistry,
  resultAggregator: createResultAggregator,
};
