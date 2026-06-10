# PRD: PixelPal V219 — Generic-Agent Dynamic Goal Engine (Direction D Iteration 6/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-019 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v219-dynamic-goal-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 6/9 = Dynamic Goal Engine**，来源：generic-agent-design。

本迭代实现动态目标引擎：目标分解、优先级排序、动态调整、进度追踪。

## 功能规格

### 1. 动态目标引擎架构

```
GoalDecomposer → PrioritySorter → DynamicAdjuster → ProgressTracker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/goals/DynamicGoalEngine.ts` | 动态目标引擎 |
| `src/goals/__tests__/DynamicGoalEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Goal {
  id: string;
  title: string;
  priority: number;
  status: 'pending' | 'in_progress' | 'completed';
  subgoals: Goal[];
  progress: number;
}

class DynamicGoalEngine {
  addGoal(goal: Goal): void;
  decomposeGoal(goalId: string): Goal[];
  prioritize(): Goal[];
  adjustPriority(goalId: string, newPriority: number): void;
  getProgress(goalId: string): number;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/goals/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/goals/__tests__/DynamicGoalEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v219-dynamic-goal-engine` 分支