# PRD: PixelPal V241 — Claude Code Coverage Analyzer (Direction A Iteration 11)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-052 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v241-coverage-analyzer |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 11 = Coverage Analyzer**，来源：claude-code-design。

本迭代实现覆盖率分析器：行覆盖、分支覆盖、函数覆盖、覆盖率报告。

## 功能规格

### 1. 覆盖率分析器架构

```
LineCoverage → BranchCoverage → FunctionCoverage → CoverageReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/coverage/CoverageAnalyzer.ts` | 覆盖率分析器 |
| `src/coverage/__tests__/CoverageAnalyzer.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface CoverageData {
  file: string;
  totalLines: number;
  coveredLines: number;
  totalBranches: number;
  coveredBranches: number;
  totalFunctions: number;
  coveredFunctions: number;
}

interface CoverageReport {
  overall: number;
  files: CoverageData[];
  gaps: string[];
}

class CoverageAnalyzer {
  addCoverage(data: CoverageData): void;
  calculateOverall(): number;
  generateReport(): CoverageReport;
  findGaps(): string[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/coverage/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/coverage/__tests__/CoverageAnalyzer.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v241-coverage-analyzer` 分支