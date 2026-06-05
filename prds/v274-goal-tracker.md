# PRD: PixelPal V274 — Generic-Agent Goal Tracker (Direction D Iteration 17)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-123 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v274-goal-tracker |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 17 = Goal Tracker**，来源：generic-agent-design。

本迭代实现目标跟踪器：目标定义、目标进度、目标评估、目标调整。

## 功能规格

### 1. 目标跟踪器架构

```
GoalDefiner → GoalProgress → GoalEvaluator → GoalAdjuster
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/goal/GoalTracker.ts` | 目标跟踪器 |
| `src/goal/__tests__/GoalTracker.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Goal {
  id: string;
  name: string;
  progress: number; // 0-100
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  milestones: Milestone[];
}

interface Milestone {
  id: string;
  name: string;
  target: number;
  reached: boolean;
}

class GoalTracker {
  defineGoal(name: string, milestones: string[]): string;
  updateProgress(goalId: string, progress: number): boolean;
  completeMilestone(goalId: string, milestoneId: string): boolean;
  getProgress(goalId: string): { progress: number; status: Goal['status'] };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/goal/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/goal/__tests__/GoalTracker.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v274-goal-tracker` 分支