# PRD: PixelPal V213 — Claude Code Automated Refactoring v2 (Direction A Iteration 4/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-007 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v213-auto-refactor-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 4/9 = Automated Refactoring v2**，来源：claude-code-design。

本迭代实现自动重构引擎v2：代码气味检测、批量重构、多模式重构、优先级排序。

## 功能规格

### 1. 自动重构引擎v2架构

```
CodeScanner → SmellDetector → RefactorPlanner → BatchRefactor → Validator
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/refactor/AutoRefactor.ts` | 自动重构引擎v2 |
| `src/refactor/__tests__/AutoRefactor.test.ts` | 测试 |

### 3. 接口设计

```typescript
type CodeSmell = 'long-method' | 'dead-code' | 'feature-envy' | 'god-class';

interface RefactorCandidate {
  fileId: string;
  smell: CodeSmell;
  severity: number;
  fix: () => string;
}

class AutoRefactor {
  scan(candidates: string[]): RefactorCandidate[];
  prioritize(candidates: RefactorCandidate[]): RefactorCandidate[];
  apply(candidates: RefactorCandidate[]): ApplyResult;
  getStats(): { scanned: number; refactored: number; failed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/refactor/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/refactor/__tests__/AutoRefactor.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v213-auto-refactor-v2` 分支