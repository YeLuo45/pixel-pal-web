# PRD: PixelPal V329 — Generic-Agent Strategy Planner (Direction D Iteration 28)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-102 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v329-strategy-planner |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 28 = Strategy Planner**，来源：generic-agent-design。

本迭代实现策略规划器：策略定义、策略选择、策略执行、策略统计。

## 功能规格

### 1. 策略规划器架构

```
StrategyDefiner → StrategySelector → StrategyExecutor → StrategyReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/strat/StrategyPlanner.ts` | 策略规划器 |
| `src/strat/__tests__/StrategyPlanner.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Strategy {
  id: string;
  name: string;
  score: number;
  executions: number;
}

class StrategyPlanner {
  define(name: string, score: number): string;
  select(top: number): Strategy[];
  execute(id: string): boolean;
  getStats(): { strategies: number; totalExecutions: number; avgScore: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/strat/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/strat/__tests__/StrategyPlanner.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v329-strategy-planner` 分支