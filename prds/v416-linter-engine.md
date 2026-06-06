# PRD: PixelPal V416 — Claude Code Linter Engine (Direction A Iteration 46)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-427 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v416-linter-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 46 = Linter Engine**，来源：claude-code-design。

本迭代实现 Linter 引擎：规则定义、规则检查、规则统计。

## 功能规格

### 1. Linter 引擎架构

```
RuleDefiner → RuleChecker → LintReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/le/LinterEngine.ts` | Linter 引擎 |
| `src/le/__tests__/LinterEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface LintRule {
  id: string;
  name: string;
  severity: 'error' | 'warning' | 'info';
  violations: number;
}

class LinterEngine {
  define(name: string, severity: 'error' | 'warning' | 'info'): string;
  check(id: string, count: number): boolean;
  getStats(): { rules: number; totalViolations: number; errors: number; warnings: number; infos: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/le/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/le/__tests__/LinterEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v416-linter-engine` 分支