# PRD: PixelPal V349 — Generic-Agent Decision Engine v2 (Direction D Iteration 32)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-180 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v349-decision-engine-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 32 = Decision Engine v2**，来源：generic-agent-design。

本迭代实现决策引擎 v2：决策定义、决策执行、决策评分、决策统计。

## 功能规格

### 1. 决策引擎 v2 架构

```
DecisionDefiner → DecisionExecutor → DecisionScorer → DecisionReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/dec2/DecisionEngineV2.ts` | 决策引擎 v2 |
| `src/dec2/__tests__/DecisionEngineV2.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Decision {
  id: string;
  context: string;
  action: string;
  score: number;
  executed: number;
}

class DecisionEngineV2 {
  define(context: string, action: string, score: number): string;
  execute(id: string): boolean;
  rescore(id: string, score: number): boolean;
  getStats(): { decisions: number; totalExecutions: number; avgScore: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/dec2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/dec2/__tests__/DecisionEngineV2.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v349-decision-engine-v2` 分支