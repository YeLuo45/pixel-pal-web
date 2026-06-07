# PRD: PixelPal V561 — Nanobot Aggregator Engine (Direction B Iteration 75)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-234 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v561-aggregator-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 75 = Aggregator Engine**，来源：nanobot-design。

本迭代实现聚合器引擎：添加、聚合、统计（6 种操作：sum/avg/min/max/count/median）。

## 功能规格

### 1. 聚合器引擎架构

```
Aggregator → Aggregate → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/are/AggregatorEngine.ts` | 聚合器引擎 |
| `src/are/__tests__/AggregatorEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type AggOp = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'median';

class AggregatorEngine {
  add(op: AggOp, values: number[]): string;
  aggregate(id: string, values: number[]): boolean;
  remove(id: string): boolean;
  getStats(): { results: number; totalAdded: number; totalAggregated: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/are/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/are/__tests__/AggregatorEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v561-aggregator-engine` 分支