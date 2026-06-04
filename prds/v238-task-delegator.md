# PRD: PixelPal V238 — Chatdev Task Delegator (Direction C Iteration 10)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-040 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v238-task-delegator |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 10 = Task Delegator**，来源：chatdev-design。

本迭代实现任务委派器：任务委派、代理选择、负载感知、委派历史。

## 功能规格

### 1. 任务委派器架构

```
TaskDelegator → AgentSelector → LoadAwareRouter → DelegationHistory
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/delegation/TaskDelegator.ts` | 任务委派器 |
| `src/delegation/__tests__/TaskDelegator.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Delegation {
  taskId: string;
  agentId: string;
  timestamp: number;
  reason: string;
}

class TaskDelegator {
  delegate(taskId: string, reason: string): Delegation | null;
  registerAgent(id: string, capacity: number): void;
  selectAgent(): string | null;
  getHistory(): Delegation[];
  getActiveDelegations(): Delegation[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/delegation/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/delegation/__tests__/TaskDelegator.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v238-task-delegator` 分支