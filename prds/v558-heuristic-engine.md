# PRD: PixelPal V558 — Generic-Agent Heuristic Engine (Direction D Iteration 74)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-226 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v558-heuristic-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 74 = Heuristic Engine**，来源：generic-agent-design。

本迭代实现启发式引擎：添加规则、评估、统计（4 种类型：rule/pattern/fallback/default）。

## 功能规格

### 1. 启发式引擎架构

```
RuleAdder → Evaluator → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/hue/HeuristicEngine.ts` | 启发式引擎 |
| `src/hue/__tests__/HeuristicEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type HeuristicType = 'rule' | 'pattern' | 'fallback' | 'default';

class HeuristicEngine {
  addRule(name: string, type: HeuristicType, priority: number): string;
  evaluate(id: string, matches: boolean): boolean;
  getStats(): { heuristics: number; totalAdded: number; totalEvaluated: number; totalMatched: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/hue/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/hue/__tests__/HeuristicEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v558-heuristic-engine` 分支