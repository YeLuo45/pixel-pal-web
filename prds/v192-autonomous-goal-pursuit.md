# PRD: PixelPal V192 — Generic-Agent Autonomous Goal Pursuit (Direction D Iteration 2/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260604-043 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v192-autonomous-goal-pursuit |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 2/9 = Autonomous Goal Pursuit**，来源：generic-agent Autonomous Goal Pursuit。

本迭代实现自主目标追求能力：AI自动拆解高层目标为可执行子任务，并自主执行、评估、调整。

## 功能规格

### 1. 自主目标追求流程

```
目标 → 拆解 → 计划 → 执行 → 评估 → 调整 → 目标（循环）
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/evolution/GoalPursuit.ts` | 目标追求引擎：拆解、计划、执行跟踪 |
| `src/evolution/__tests__/GoalPursuit.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Goal {
  id: string;
  description: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  subGoals: SubGoal[];
  createdAt: number;
  deadline?: number;
}

interface SubGoal {
  id: string;
  goalId: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: number;
  dependencies: string[];
}

class GoalPursuit {
  // 拆解目标为子目标
  decompose(goal: string): Goal

  // 执行子目标
  async executeSubGoal(goalId: string, subGoalId: string): Promise<void>

  // 评估进度
  evaluate(goalId: string): { progress: number; status: Goal['status'] }

  // 自主调整计划
  replan(goalId: string): Goal
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/evolution/__tests__/`

## 验收标准

- [ ] `npx vitest run src/evolution --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v192-autonomous-goal-pursuit` 分支