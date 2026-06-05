# PRD: PixelPal V331 — Claude Code Coverage Aggregator (Direction A Iteration 29)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-119 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v331-coverage-aggregator |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 29 = Coverage Aggregator**，来源：claude-code-design。

本迭代实现覆盖率聚合器：覆盖率汇总、覆盖率比较、覆盖率阈值、覆盖率报告。

## 功能规格

### 1. 覆盖率聚合器架构

```
CoverageCollector → CoverageComparator → CoverageThreshold → CoverageReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/cov/CoverageAggregator.ts` | 覆盖率聚合器 |
| `src/cov/__tests__/CoverageAggregator.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Coverage {
  id: string;
  file: string;
  coverage: number;
  threshold: number;
}

class CoverageAggregator {
  add(file: string, coverage: number): string;
  getOverall(): number;
  getFailing(): Coverage[];
  getStats(): { files: number; overall: number; failing: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/cov/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/cov/__tests__/CoverageAggregator.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v331-coverage-aggregator` 分支