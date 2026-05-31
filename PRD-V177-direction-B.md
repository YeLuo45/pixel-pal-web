# PRD: PixelPal V177 - Multi-Agent Studio Panel (Direction B)

## 概述

基于 ruflo Multi-Agent Studio + chatdev Multi-Agent Orchestration 架构，为 PixelPal 构建多角色 Agent 协作面板，支持人格角色切换与对话路由。

## 背景与现状

- **已有**: AgentRegistry（可插拔 Agent 注册）、Orchestrator（任务分解）、AgentExecutionBus、TaskDecomposer、CriticEngine
- **缺失**: 统一的多角色协作 UI 面板、人格角色切换、对话路由配置
- **目标**: 参照 ruflo/chatdev 实现可视化的多 Agent 协作界面

## 架构设计

### 核心组件

| 组件 | 来源 | 说明 |
|------|------|------|
| AgentRoleRegistry | ruflo | 角色定义（coordinator/executor/reviewer） |
| RoleSwitcher | chatdev | 角色切换与路由逻辑 |
| MultiAgentPanel | ruflo | 多角色协作 UI 面板 |
| ConversationRouter | chatdev | 消息路由到不同 Agent |

### Agent 角色定义

```typescript
export enum AgentRole {
  COORDINATOR = 'coordinator',  // 主协调者
  EXECUTOR = 'executor',        // 执行者
  REVIEWER = 'reviewer',        // 评审者
  EMOTION = 'emotion',          // 情感分析
}

export interface AgentRoleConfig {
  role: AgentRole;
  name: string;
  icon: string;
  color: string;
  description: string;
  capabilities: string[];
  isActive: boolean;
}
```

### MultiAgentPanel UI

```
┌─────────────────────────────────────────────────────┐
│  Multi-Agent Studio                           [×]   │
├─────────────────────────────────────────────────────┤
│  Roles:  [●Coordinator] [○Executor] [○Reviewer]   │
├─────────────────────────────────────────────────────┤
│  │Coordinator│ │Executor│ │Reviewer│ │Emotion│     │
│  ───────────────────────────────────────────────   │
│  │ Chat messages from each role...               │ │
│  ───────────────────────────────────────────────   │
├─────────────────────────────────────────────────────┤
│  [Send to: Coordinator ▼] [Send Message]           │
└─────────────────────────────────────────────────────┘
```

## 功能清单

### 1. AgentRoleRegistry（src/services/agents/AgentRoleRegistry.ts）
- 角色配置管理（新增/修改/删除）
- 角色激活状态切换
- 角色能力映射

### 2. RoleSwitcher（src/services/agents/RoleSwitcher.ts）
- 快速切换活跃角色
- 路由规则配置（关键词 → 角色映射）
- 消息分发逻辑

### 3. MultiAgentPanel UI 组件（src/components/MultiAgent/MultiAgentPanel.tsx）
- 角色标签页切换
- 实时消息显示
- 发送消息到指定角色
- 角色状态指示器

### 4. ConversationRouter（src/services/agents/ConversationRouter.ts）
- 基于关键词的自动路由
- 手动路由规则
- 路由历史记录

### 5. 测试用例（src/services/agents/__tests__/AgentRoleRegistry.test.ts, RoleSwitcher.test.ts）
- 覆盖率目标：99%+
- 约 60+ 测试用例

## 技术约束

- **零新增依赖**：使用现有 MUI/Emotion 组件库
- **向后兼容**：AgentRegistry 现有 API 不变
- **HashRouter 兼容**：SPA 路由支持

## 验收标准

1. `AgentRoleRegistry` 实现完整角色管理
2. `RoleSwitcher` 正确路由消息到指定角色
3. `MultiAgentPanel` UI 可正常显示和交互
4. 测试通过率 100%，覆盖率 ≥ 99%
5. `pnpm run build` 成功（exit code 0）