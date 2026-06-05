# PRD: PixelPal V294 — Generic-Agent Decision Engine (Direction D Iteration 21)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-015 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v294-decision-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 21 = Decision Engine**，来源：generic-agent-design。

本迭代实现决策引擎：规则定义、规则评估、决策缓存、决策追踪。

## 功能规格

### 1. 决策引擎架构

```
RuleDefiner → RuleEvaluator → DecisionCache → DecisionTracker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/decision/DecisionEngine.ts` | 决策引擎 |
| `src/decision/__tests__/DecisionEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface DecisionRule {
  id: string;
  name: string;
  condition: (context: unknown) => boolean;
  action: string;
}

interface Decision {
  id: string;
  ruleId: string;
  action: string;
  context: unknown;
  timestamp: number;
}

class DecisionEngine {
  addRule(rule: DecisionRule): boolean;
  evaluate(context: unknown): Decision | null;
  getStats(): { rules: number; decisions: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/decision/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/decision/__tests__/DecisionEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v294-decision-engine` 分支