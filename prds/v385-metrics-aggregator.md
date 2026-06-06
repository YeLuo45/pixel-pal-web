# PRD: PixelPal V385 — Thunderbolt Metrics Aggregator (Direction E Iteration 39)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-296 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v385-metrics-aggregator |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 39 = Metrics Aggregator**，来源：thunderbolt-design。

本迭代实现指标聚合器：指标记录、指标聚合、指标查询、指标统计。

## 功能规格

### 1. 指标聚合器架构

```
MetricRecorder → MetricAggregator → MetricQuerier → MetricReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ma/MetricsAggregator.ts` | 指标聚合器 |
| `src/ma/__tests__/MetricsAggregator.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Metric {
  id: string;
  name: string;
  value: number;
  type: 'counter' | 'gauge' | 'histogram';
}

class MetricsAggregator {
  record(name: string, value: number, type?: 'counter' | 'gauge' | 'histogram'): string;
  aggregate(name: string): { count: number; sum: number; avg: number; min: number; max: number };
  getStats(): { metrics: number; total: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ma/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ma/__tests__/MetricsAggregator.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v385-metrics-aggregator` 分支