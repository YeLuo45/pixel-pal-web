# PRD: PixelPal V490 — Claude Code Formatter Engine (Direction A Iteration 61)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-151 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v490-formatter-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 61 = Formatter Engine**，来源：claude-code-design。

本迭代实现格式化引擎：字符串格式化（upper/lower/title/camel/snake/kebab）、重新格式化、统计。

## 功能规格

### 1. 格式化引擎架构

```
StringFormatter → Reformatter → FormatterStats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/fte/FormatterEngine.ts` | 格式化引擎 |
| `src/fte/__tests__/FormatterEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type FormatType = 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab';

class FormatterEngine {
  format(name: string, type: FormatType, input: string): string;
  reFormat(id: string): string;
  getStats(): { formatters: number; totalFormatted: number; upper: number; lower: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/fte/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/fte/__tests__/FormatterEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v490-formatter-engine` 分支