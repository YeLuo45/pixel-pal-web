# PRD: PixelPal V255 — Thunderbolt Workflow Engine v2 (Direction E Iteration 13)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-080 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v255-workflow-engine-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 13 = Workflow Engine v2**，来源：thunderbolt-design。

本迭代实现工作流引擎v2：流程定义、状态机、事件触发、工作流追踪。

## 功能规格

### 1. 工作流引擎v2架构

```
FlowDefinition → StateMachine → EventTrigger → WorkflowTracker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/workflow/WorkflowEngineV2.ts` | 工作流引擎v2 |
| `src/workflow/__tests__/WorkflowEngineV2.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface StateTransition {
  from: string;
  to: string;
  event: string;
}

class WorkflowEngineV2 {
  addState(name: string): void;
  addTransition(transition: StateTransition): void;
  fire(event: string): boolean;
  getCurrentState(): string | null;
  getHistory(): string[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/workflow/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/workflow/__tests__/WorkflowEngineV2.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v255-workflow-engine-v2` 分支