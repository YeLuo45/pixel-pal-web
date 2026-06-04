# PRD: PixelPal V206 — Generic-Agent Autonomous Planner v2 (Direction D Iteration 2/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260604-054 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v206-autonomous-planner-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 2/9 = Autonomous Planner v2**，来源：generic-agent Autonomous Planner v2。

本迭代实现自主规划器v2：多目标规划、优先级调度、回溯修复、执行监控。

## 功能规格

### 1. 自主规划器架构

```
Goal → Decomposer → Planner → Executor → Monitor → Review → Adjust
                                              ↓
                                        Backtracker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/planner/AutonomousPlanner.ts` | 自主规划器 |
| `src/planner/__tests__/AutonomousPlanner.test.ts` | 测试 |

### 3. 接口设计

```typescript
type PlanStatus = 'planned' | 'executing' | 'completed' | 'failed' | 'paused';
type StepStatus = 'pending' | 'running' | 'done' | 'failed';

interface PlanStep {
  id: string;
  description: string;
  status: StepStatus;
  estimatedCost: number;
  actualCost?: number;
  dependencies: string[];
}

interface Plan {
  id: string;
  goal: string;
  steps: PlanStep[];
  status: PlanStatus;
  createdAt: number;
  completedAt?: number;
}

class AutonomousPlanner {
  createPlan(goal: string, steps: Omit<PlanStep, 'id' | 'status'>[]): Plan;
  execute(planId: string): Promise<void>;
  pause(planId: string): void;
  resume(planId: string): void;
  cancel(planId: string): void;
  getPlan(planId: string): Plan | null;
  getAllPlans(): Plan[];
  retryStep(planId: string, stepId: string): boolean;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/planner/__tests__/`

## 验收标准

- [ ] `npx vitest run src/planner --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v206-autonomous-planner-v2` 分支