# PRD: PixelPal V187 — Multi-Agent Studio Panel (Direction C Iteration 1/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260604-037 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v187-multi-agent-studio |
| 部署分支 | gh-pages (via GitHub Actions on master push) |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C = Multi-Agent Studio Panel**，来源：ruflo Hook System + chatdev Multi-Agent Role Coordination。

本迭代 (1/9) 实现多角色 Agent 协作面板基础架构 + Hook 驱动的任务编排。

## 功能规格

### 1. 多角色 Agent 架构

```
Designer Agent    — 负责任务分解和流程设计
Executor Agent   — 负责执行具体任务
Reviewer Agent   — 负责质量和验收评估
Coordinator      — 负责任务调度和结果汇总
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/agents/MultiAgentStudio.tsx` | 多Agent协作面板主组件 |
| `src/agents/HookDrivenTaskQueue.ts` | Hook驱动的任务队列 |
| `src/agents/AgentRole.ts` | Agent角色定义（Designer/Executor/Reviewer/Coordinator） |
| `src/agents/__tests__/MultiAgentStudio.test.tsx` | 面板组件测试 |
| `src/agents/__tests__/HookDrivenTaskQueue.test.ts` | 任务队列测试 |

### 3. Hook驱动任务编排

```typescript
interface AgentHook {
  name: string;
  before?: (task: Task) => Task | Promise<Task>;
  after?: (result: Result, task: Task) => Result | Promise<Result>;
  onError?: (error: Error, task: Task) => void;
}

interface Task {
  id: string;
  type: 'design' | 'execute' | 'review';
  payload: unknown;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: number;
  agentId?: string;
}
```

### 4. chatdev角色专业化

每个Agent有明确的职责边界，通过MessageBus协调：

```typescript
interface AgentMessage {
  from: string;
  to: string;
  type: 'task' | 'result' | 'review' | 'error';
  payload: unknown;
  timestamp: number;
}
```

## 技术约束

- 零新增依赖
- 复用现有 `src/services/bus/` MessageBus
- 复用现有 EmotionEngine 状态

## 测试要求

- 覆盖率 ≥ 99%（statements/branches/functions/lines）
- 通过率 100%
- 测试位置：`src/agents/__tests__/`
- 组件测试使用 `@testing-library/react`

## 验收标准

- [ ] `npx vitest run src/agents --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `npm run build` 成功（HashRouter SPA）
- [ ] Git commit 到 `v187-multi-agent-studio` 分支