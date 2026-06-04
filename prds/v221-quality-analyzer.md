# PRD: PixelPal V221 — Claude Code Quality Analyzer (Direction A Iteration 7/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-021 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v221-quality-analyzer |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 7/9 = Quality Analyzer**，来源：claude-code-design。

本迭代实现代码质量分析器：复杂度分析、代码异味检测、质量评分、改进建议。

## 功能规格

### 1. 质量分析器架构

```
ComplexityCalculator → SmellDetector → QualityScorer → ImprovementSuggester
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/quality/CodeQualityAnalyzer.ts` | 代码质量分析器 |
| `src/quality/__tests__/CodeQualityAnalyzer.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface CodeFile {
  path: string;
  lines: number;
  functions: number;
  cyclomaticComplexity: number;
}

interface QualityReport {
  score: number;
  smells: string[];
  suggestions: string[];
}

class CodeQualityAnalyzer {
  analyze(file: CodeFile): QualityReport;
  getSmells(file: CodeFile): string[];
  suggest(file: CodeFile): string[];
  getScore(file: CodeFile): number;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/quality/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/quality/__tests__/CodeQualityAnalyzer.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v221-quality-analyzer` 分支