# PRD: PixelPal V520 — Claude Code Coverage Engine (Direction A Iteration 67)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-271 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v520-coverage-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 67 = Coverage Engine**，来源：claude-code-design。

本迭代实现覆盖率引擎：覆盖率跟踪、报告、更新、统计（3 种状态：uncovered/partial/full）。

## 功能规格

### 1. 覆盖率引擎架构

```
CoverageTracker → CoverageReporter → CoverageUpdater
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/cve/CoverageEngine.ts` | 覆盖率引擎 |
| `src/cve/__tests__/CoverageEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type CoverageStatus = 'uncovered' | 'partial' | 'full';

class CoverageEngine {
  track(file: string, totalLines: number, coveredLines: number): string;
  report(id: string): boolean;
  updateCoverage(id: string, coveredLines: number): boolean;
  getStats(): { coverages: number; totalAdded: number; totalReported: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/cve/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/cve/__tests__/CoverageEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v520-coverage-engine` 分支