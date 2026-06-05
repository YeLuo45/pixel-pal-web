# PRD: PixelPal V286 — Claude Code Refactor Tool (Direction A Iteration 20)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-163 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v286-refactor-tool |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 20 = Refactor Tool**，来源：claude-code-design。

本迭代实现重构工具：代码分析、模式检测、转换规则、转换应用。

## 功能规格

### 1. 重构工具架构

```
CodeAnalyzer → PatternDetector → TransformRule → TransformApplier
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/refactor/RefactorTool.ts` | 重构工具 |
| `src/refactor/__tests__/RefactorTool.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface RefactoringRule {
  id: string;
  name: string;
  pattern: string;
  replacement: string;
  description: string;
}

interface RefactoringResult {
  original: string;
  transformed: string;
  ruleId: string;
  appliedAt: number;
}

class RefactorTool {
  addRule(rule: RefactoringRule): boolean;
  transform(code: string, ruleId: string): RefactoringResult | null;
  detectPatterns(code: string): string[];
  getStats(): { rules: number; transformations: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/refactor/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/refactor/__tests__/RefactorTool.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v286-refactor-tool` 分支