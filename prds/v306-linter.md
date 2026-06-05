# PRD: PixelPal V306 — Claude Code Linter (Direction A Iteration 24)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-043 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v306-linter |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 24 = Linter**，来源：claude-code-design。

本迭代实现代码检查器：规则定义、规则检查、问题收集、报告生成。

## 功能规格

### 1. 代码检查器架构

```
RuleDefiner → RuleChecker → IssueCollector → ReportGenerator
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/lint/Linter.ts` | 代码检查器 |
| `src/lint/__tests__/Linter.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface LintRule {
  id: string;
  name: string;
  check: (code: string) => boolean;
  severity: 'error' | 'warning' | 'info';
}

interface LintIssue {
  ruleId: string;
  message: string;
  severity: LintRule['severity'];
  line: number;
}

class Linter {
  addRule(rule: LintRule): boolean;
  check(code: string): LintIssue[];
  getStats(): { rules: number; issues: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/lint/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/lint/__tests__/Linter.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v306-linter` 分支