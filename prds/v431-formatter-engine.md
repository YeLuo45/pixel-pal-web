# PRD: PixelPal V431 — Claude Code Formatter Engine (Direction A Iteration 49)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-480 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v431-formatter-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 49 = Formatter Engine**，来源：claude-code-design。

本迭代实现格式化引擎：格式化定义、格式化应用、格式化统计。

## 功能规格

### 1. 格式化引擎架构

```
FormatterDefiner → FormatterApplier → FormatterReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/fme/FormatterEngine.ts` | 格式化引擎 |
| `src/fme/__tests__/FormatterEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Formatter {
  id: string;
  name: string;
  format: 'json' | 'xml' | 'yaml' | 'csv';
  input: string;
  output: string;
  applications: number;
}

class FormatterEngine {
  define(name: string, format: 'json' | 'xml' | 'yaml' | 'csv'): string;
  format(id: string, input: string): string | null;
  getStats(): { formatters: number; totalApplications: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/fme/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/fme/__tests__/FormatterEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v431-formatter-engine` 分支