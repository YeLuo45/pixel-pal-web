/**
 * Tool Analytics - Usage Analytics and Recommendations
 * V166: Tracks tool usage statistics and provides recommendations
 */

export interface ToolUsageStats {
  toolName: string;
  callCount: number;
  successCount: number;
  failureCount: number;
  avgLatencyMs: number;
  lastCalledAt: string;
  lastSuccessAt: string;
}

interface ToolStatsEntry {
  toolName: string;
  callCount: number;
  successCount: number;
  failureCount: number;
  totalLatencyMs: number;
  lastCalledAt: string;
  lastSuccessAt: string;
}

// Internal storage for tool statistics
const statsStore = new Map<string, ToolStatsEntry>();

/**
 * Role-based tool recommendations (simplified)
 * In production, this would be based on actual usage patterns
 */
const roleRecommendations: Record<string, string[]> = {
  admin: ['toolManagement', 'userManagement', 'systemConfig', 'analytics'],
  agent: ['dataQuery', 'fileOperation', 'webSearch', 'codeAnalysis'],
  user: ['documentRead', 'imageGeneration', 'notification', 'chat'],
};

/**
 * Record a tool call
 * @param tool - The tool name
 * @param latencyMs - Latency in milliseconds
 * @param success - Whether the call was successful
 */
export function recordToolCall(tool: string, latencyMs: number, success: boolean): void {
  const existing = statsStore.get(tool);
  
  if (existing) {
    existing.callCount++;
    existing.totalLatencyMs += latencyMs;
    existing.lastCalledAt = new Date().toISOString();
    
    if (success) {
      existing.successCount++;
      existing.lastSuccessAt = new Date().toISOString();
    } else {
      existing.failureCount++;
    }
  } else {
    statsStore.set(tool, {
      toolName: tool,
      callCount: 1,
      successCount: success ? 1 : 0,
      failureCount: success ? 0 : 1,
      totalLatencyMs: latencyMs,
      lastCalledAt: new Date().toISOString(),
      lastSuccessAt: success ? new Date().toISOString() : '',
    });
  }
}

/**
 * Get usage statistics for a tool
 * @param tool - The tool name
 * @returns ToolUsageStats or undefined if not found
 */
export function getToolStats(tool: string): ToolUsageStats | undefined {
  const entry = statsStore.get(tool);
  if (!entry) return undefined;
  
  return {
    toolName: entry.toolName,
    callCount: entry.callCount,
    successCount: entry.successCount,
    failureCount: entry.failureCount,
    avgLatencyMs: entry.callCount > 0 ? entry.totalLatencyMs / entry.callCount : 0,
    lastCalledAt: entry.lastCalledAt,
    lastSuccessAt: entry.lastSuccessAt,
  };
}

/**
 * Get the most used tools
 * @param limit - Maximum number of tools to return (default: 10)
 * @returns Array of ToolUsageStats sorted by callCount descending
 */
export function getMostUsedTools(limit: number = 10): ToolUsageStats[] {
  return Array.from(statsStore.values())
    .sort((a, b) => b.callCount - a.callCount)
    .slice(0, limit)
    .map(entry => ({
      toolName: entry.toolName,
      callCount: entry.callCount,
      successCount: entry.successCount,
      failureCount: entry.failureCount,
      avgLatencyMs: entry.callCount > 0 ? entry.totalLatencyMs / entry.callCount : 0,
      lastCalledAt: entry.lastCalledAt,
      lastSuccessAt: entry.lastSuccessAt,
    }));
}

/**
 * Get recommended tools for a user role
 * @param userRole - The user role (admin, agent, user)
 * @returns Array of recommended tool names
 */
export function getRecommendedTools(userRole: string): string[] {
  return roleRecommendations[userRole] ?? [];
}

/**
 * Clear all statistics (for testing)
 */
export function clearStats(): void {
  statsStore.clear();
}

/**
 * Get all tracked tool names
 */
export function getTrackedTools(): string[] {
  return Array.from(statsStore.keys());
}

/**
 * Get success rate for a tool
 * @param tool - The tool name
 * @returns Success rate as a percentage (0-100), or undefined if no calls
 */
export function getToolSuccessRate(tool: string): number | undefined {
  const entry = statsStore.get(tool);
  if (!entry || entry.callCount === 0) return undefined;
  
  return (entry.successCount / entry.callCount) * 100;
}

/**
 * Get average latency for a tool
 * @param tool - The tool name
 * @returns Average latency in ms, or undefined if no calls
 */
export function getToolAvgLatency(tool: string): number | undefined {
  const entry = statsStore.get(tool);
  if (!entry || entry.callCount === 0) return undefined;
  
  return entry.totalLatencyMs / entry.callCount;
}

/**
 * Get total call count across all tools
 */
export function getTotalCallCount(): number {
  let total = 0;
  for (const entry of statsStore.values()) {
    total += entry.callCount;
  }
  return total;
}

/**
 * Get total failure count across all tools
 */
export function getTotalFailureCount(): number {
  let total = 0;
  for (const entry of statsStore.values()) {
    total += entry.failureCount;
  }
  return total;
}

/**
 * Get overall success rate
 */
export function getOverallSuccessRate(): number {
  let totalCalls = 0;
  let totalSuccess = 0;
  
  for (const entry of statsStore.values()) {
    totalCalls += entry.callCount;
    totalSuccess += entry.successCount;
  }
  
  if (totalCalls === 0) return 100; // No calls = 100% success rate
  return (totalSuccess / totalCalls) * 100;
}

/**
 * Record multiple tool calls at once
 * @param calls - Array of {tool, latencyMs, success}
 */
export function recordToolCalls(calls: Array<{ tool: string; latencyMs: number; success: boolean }>): void {
  for (const call of calls) {
    recordToolCall(call.tool, call.latencyMs, call.success);
  }
}