/**
 * Tool Lifecycle Hook - Lifecycle Hook System for MCP Tools
 * V166: Provides hooks for tool lifecycle events (register, call, discover)
 */

export type HookType = 
  | 'beforeRegister' 
  | 'afterRegister' 
  | 'beforeCall' 
  | 'afterCall' 
  | 'beforeDiscover' 
  | 'afterDiscover';

export interface HookContext {
  toolName?: string;
  agentId?: string;
  args?: Record<string, unknown>;
  result?: unknown;
  error?: Error;
  timestamp: string;
}

export interface ToolLifecycleHook {
  id: string;
  type: HookType;
  tool?: string;
  handler: (context: HookContext) => Promise<void> | void;
  order: number; // Lower = earlier
}

// Internal storage for hooks
const hooksStore = new Map<string, ToolLifecycleHook>();
let hookIdCounter = 0;

/**
 * Generate a unique hook ID
 */
function generateHookId(): string {
  return `hook_${++hookIdCounter}_${Date.now()}`;
}

/**
 * Add a lifecycle hook
 * @param hook - Hook configuration (without id)
 * @returns The unique ID of the added hook
 */
export function addHook(hook: Omit<ToolLifecycleHook, 'id'>): string {
  const id = generateHookId();
  const fullHook: ToolLifecycleHook = {
    ...hook,
    id,
    order: hook.order ?? 100, // Default order is 100
  };
  hooksStore.set(id, fullHook);
  return id;
}

/**
 * Remove a hook by ID
 * @param id - The hook ID to remove
 * @returns true if the hook was removed, false if not found
 */
export function removeHook(id: string): boolean {
  return hooksStore.delete(id);
}

/**
 * Get hooks filtered by type and optionally by tool
 * @param type - Optional hook type filter
 * @param tool - Optional tool name filter
 * @returns Array of matching hooks, sorted by order
 */
export function getHooks(type?: HookType, tool?: string): ToolLifecycleHook[] {
  let hooks = Array.from(hooksStore.values());
  
  if (type) {
    hooks = hooks.filter(h => h.type === type);
  }
  
  if (tool) {
    hooks = hooks.filter(h => h.tool === undefined || h.tool === tool);
  }
  
  // Sort by order (lower = earlier)
  return hooks.sort((a, b) => a.order - b.order);
}

/**
 * Clear all hooks (for testing)
 */
export function clearHooks(): void {
  hooksStore.clear();
  hookIdCounter = 0;
}

/**
 * Get the count of registered hooks
 */
export function getHookCount(): number {
  return hooksStore.size;
}

/**
 * Execute hooks of a specific type
 * @param type - The hook type to execute
 * @param context - The context to pass to each hook handler
 * @param toolName - Optional tool name to filter hooks
 */
export async function executeHooks(
  type: HookType, 
  context: HookContext, 
  toolName?: string
): Promise<void> {
  const hooks = getHooks(type, toolName);
  
  for (const hook of hooks) {
    try {
      await hook.handler(context);
    } catch (error) {
      // Log error but continue with other hooks
      console.error(`Hook ${hook.id} failed:`, error);
    }
  }
}

/**
 * Create a hook context with timestamp
 */
export function createHookContext(partial?: Partial<HookContext>): HookContext {
  return {
    toolName: partial?.toolName,
    agentId: partial?.agentId,
    args: partial?.args,
    result: partial?.result,
    error: partial?.error,
    timestamp: partial?.timestamp ?? new Date().toISOString(),
  };
}

/**
 * Check if a specific hook exists
 */
export function hasHook(id: string): boolean {
  return hooksStore.has(id);
}

/**
 * Get a specific hook by ID
 */
export function getHook(id: string): ToolLifecycleHook | undefined {
  return hooksStore.get(id);
}

/**
 * Update a hook's handler by ID
 */
export function updateHook(id: string, handler: (context: HookContext) => Promise<void> | void): boolean {
  const hook = hooksStore.get(id);
  if (!hook) return false;
  
  hook.handler = handler;
  return true;
}