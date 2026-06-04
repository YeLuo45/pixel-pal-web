# PRD: PixelPal V246 — Claude Code Style Enforcer (Direction A Iteration 12)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-060 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v246-style-enforcer |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 12 = Style Enforcer**，来源：claude-code-design。

本迭代实现代码风格执行器：规则定义、违规检测、自动修复、风格报告。

## 功能规格

### 1. 风格执行器架构

```
RuleSet → ViolationDetector → AutoFixer → StyleReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/style/StyleEnforcer.ts` | 风格执行器 |
| `src/style/__tests__/StyleEnforcer.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface StyleRule {
  name: string;
  pattern: RegExp;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

interface Violation {
  rule: string;
  line: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

class StyleEnforcer {
  addRule(rule: StyleRule): void;
  check(code: string): Violation[];
  fix(code: string, ruleName: string, replacement: string): string;
  generateReport(): { total: number; errors: number; warnings: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/style/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/style/__tests__/StyleEnforcer.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v246-style-enforcer` 分支