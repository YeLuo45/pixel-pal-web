# PRD: PixelPal V366 — Claude Code Refactor Engine (Direction A Iteration 36)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-230 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v366-refactor-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 36 = Refactor Engine**，来源：claude-code-design。

本迭代实现重构引擎：重构规则、重构分析、重构执行、重构统计。

## 功能规格

### 1. 重构引擎架构

```
RefactorRuleDefiner → RefactorAnalyzer → RefactorExecutor → RefactorReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/re/RefactorEngine.ts` | 重构引擎 |
| `src/re/__tests__/RefactorEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Refactor {
  id: string;
  name: string;
  pattern: string;
  replacement: string;
  applied: number;
}

class RefactorEngine {
  addRule(name: string, pattern: string, replacement: string): string;
  apply(id: string, code: string): string;
  getStats(): { rules: number; totalApplied: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/re/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/re/__tests__/RefactorEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v366-refactor-engine` 分支