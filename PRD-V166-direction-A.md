# PRD: PixelPal V166 — MCP Tool Ecosystem Phase 2

## 1. Project Overview

- **Project**: pixel-pal-web (PRJ-20260420-002)
- **Version**: V166
- **Direction**: A (MCP Tool Ecosystem)
- **Proposal ID**: P-20260530-058
- **Date**: 2026-05-30
- **Status**: approved_for_dev

## 2. Motivation

V165 delivered the foundational modules (ToolPermission, ToolDiscovery, ToolVersion, ToolMetadata) as isolated components. V166 will integrate them into a unified ecosystem with the existing McpToolRegistry.

## 3. Goals

| Feature | Description |
|---------|-------------|
| UnifiedToolEcosystem | Integrate all V165 modules with McpToolRegistry into single API |
| ToolLifecycleHooks | Add pre/post hooks for tool registration, discovery, call |
| ToolAnalytics | Track tool usage stats (call count, success rate, avg latency) |
| ToolRecommendations | Suggest tools based on usage patterns |

## 4. Technical Specification

### 4.1 New Components

```
src/services/mcp/
├── ToolEcosystem.ts           # NEW: Unified facade integrating all modules
├── ToolLifecycleHook.ts     # NEW: Pre/post lifecycle hooks
├── ToolAnalytics.ts          # NEW: Usage tracking and recommendations
├── index.ts                  # ENHANCED: Export unified API
└── __tests__/
    ├── ToolEcosystem.test.ts
    ├── ToolLifecycleHook.test.ts
    └── ToolAnalytics.test.ts
```

### 4.2 ToolEcosystem (Unified Facade)

```typescript
// Single entry point for all tool management
class ToolEcosystem {
  // Registration with automatic permission/metadata setup
  registerTool(tool: Tool, metadata?: Partial<ToolMetadata>): void;
  
  // Discovery with caching
  discoverFromAgent(agentId: string): Promise<DiscoveredTool[]>;
  
  // Version management
  registerVersion(tool: string, version: ToolVersion): void;
  
  // Permission checking
  checkAccess(tool: string, role: string): boolean;
  
  // Unified search
  search(query: string): ToolMetadata[];
  
  // Category browsing
  getByCategory(category: string): ToolMetadata[];
}
```

### 4.3 ToolLifecycleHook

```typescript
type HookType = 'beforeRegister' | 'afterRegister' | 'beforeCall' | 'afterCall' | 'beforeDiscover' | 'afterDiscover';

interface ToolLifecycleHook {
  type: HookType;
  tool?: string;  // Optional: specific tool, or undefined for all
  handler: (context: HookContext) => Promise<void> | void;
}

export function addHook(hook: ToolLifecycleHook): void;
export function removeHook(id: string): void;
export function getHooks(type?: HookType, tool?: string): ToolLifecycleHook[];
```

### 4.4 ToolAnalytics

```typescript
interface ToolUsageStats {
  toolName: string;
  callCount: number;
  successCount: number;
  failureCount: number;
  avgLatencyMs: number;
  lastCalledAt: string;
  lastSuccessAt: string;
}

export function recordToolCall(tool: string, latencyMs: number, success: boolean): void;
export function getToolStats(tool: string): ToolUsageStats | undefined;
export function getMostUsedTools(limit?: number): ToolUsageStats[];
export function getRecommendedTools(userRole: string): string[];
```

## 5. Testing Requirements

- **Coverage Target**: ≥95%
- **Pass Rate**: 100%
- **Test Files**: ToolEcosystem.test.ts, ToolLifecycleHook.test.ts, ToolAnalytics.test.ts

## 6. Acceptance Criteria

- [ ] `ToolEcosystem` provides unified API for all tool operations
- [ ] `ToolLifecycleHook` supports 6 hook types with ordering
- [ ] `ToolAnalytics` tracks usage with recommendations
- [ ] Integration with existing `McpClientBridge`
- [ ] All tests pass with ≥95% coverage
- [ ] `npm run build` succeeds
- [ ] No new console errors

## 7. Dependencies

- V165 modules: ToolPermission, ToolDiscovery, ToolVersion, ToolMetadata
- Existing: McpClientBridge, McpToolRegistry
