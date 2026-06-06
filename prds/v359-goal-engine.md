# PRD: PixelPal V359 — Generic-Agent Goal Engine (Direction D Iteration 34)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-219 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v359-goal-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 34 = Goal Engine**，来源：generic-agent-design。

本迭代实现目标引擎：目标定义、目标推进、目标完成、目标统计。

## 功能规格

### 1. 目标引擎架构

```
GoalDefiner → GoalAdvancer → GoalCompleter → GoalReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/goal/GoalEngine.ts` | 目标引擎 |
| `src/goal/__tests__/GoalEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Goal {
  id: string;
  name: string;
  target: number;
  progress: number;
  completed: boolean;
}

class GoalEngine {
  define(name: string, target: number): string;
  advance(id: string, amount: number): boolean;
  getProgress(id: string): number;
  getStats(): { goals: number; completed: number; avgProgress: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/goal/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/goal/__tests__/GoalEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v359-goal-engine` 分支