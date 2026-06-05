# PRD: PixelPal V279 — Generic-Agent Strategy Library (Direction D Iteration 18)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-139 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v279-strategy-library |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 18 = Strategy Library**，来源：generic-agent-design。

本迭代实现策略库：策略定义、策略应用、策略评估、策略选择。

## 功能规格

### 1. 策略库架构

```
StrategyDefiner → StrategyApplier → StrategyEvaluator → StrategySelector
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/strategy/StrategyLibrary.ts` | 策略库 |
| `src/strategy/__tests__/StrategyLibrary.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Strategy {
  id: string;
  name: string;
  score: number;
  applicability: (context: string) => boolean;
  description: string;
}

class StrategyLibrary {
  addStrategy(strategy: Omit<Strategy, 'score'>): void;
  apply(id: string, context: string): boolean;
  selectBest(context: string): Strategy | null;
  getByScore(min: number): Strategy[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/strategy/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/strategy/__tests__/StrategyLibrary.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v279-strategy-library` 分支