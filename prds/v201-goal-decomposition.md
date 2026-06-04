# PRD: PixelPal V201 — Generic-Agent Goal Decomposition Engine (Direction D Iteration 1/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260604-049 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v201-goal-decomposition |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 1/9 = Goal Decomposition Engine**，来源：generic-agent Goal Decomposition Engine。

本迭代实现目标分解引擎：复杂目标自动拆解为可执行子目标、依赖关系管理、执行计划生成。

## 功能规格

### 1. 目标分解架构

```
复杂目标 → 分解器 → 子目标树 → 执行计划 → 调度执行
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/goals/GoalDecomposer.ts` | 目标分解引擎 |
| `src/goals/__tests__/GoalDecomposer.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Goal {
  id: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dependencies: string[];
  subGoals: SubGoal[];
}

interface SubGoal {
  id: string;
  goalId: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  estimatedEffort: number;
}

interface ExecutionPlan {
  goalId: string;
  steps: Step[];
  totalEffort: number;
}

interface Step {
  subGoalId: string;
  order: number;
  parallelWith?: string[];
}

class GoalDecomposer {
  decompose(goal: string, depth?: number): Goal
  generatePlan(goal: Goal): ExecutionPlan
  getExecutableSteps(plan: ExecutionPlan): Step[]
  updateProgress(goalId: string, subGoalId: string, status: SubGoal['status']): void
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/goals/__tests__/`

## 验收标准

- [ ] `npx vitest run src/goals --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v201-goal-decomposition` 分支