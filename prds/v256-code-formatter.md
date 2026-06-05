# PRD: PixelPal V256 — Claude Code Code Formatter (Direction A Iteration 14)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-081 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v256-code-formatter |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 14 = Code Formatter**，来源：claude-code-design。

本迭代实现代码格式化器：缩进处理、空格处理、换行处理、格式化预设。

## 功能规格

### 1. 代码格式化器架构

```
IndentHandler → SpaceHandler → LineBreakHandler → FormatPreset
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/format/CodeFormatter.ts` | 代码格式化器 |
| `src/format/__tests__/CodeFormatter.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface FormatOptions {
  indentSize: number;
  useTabs: boolean;
  maxLineLength: number;
  trimTrailingWhitespace: boolean;
}

class CodeFormatter {
  format(code: string, options?: Partial<FormatOptions>): string;
  setOptions(options: FormatOptions): void;
  getOptions(): FormatOptions;
  registerPreset(name: string, options: FormatOptions): void;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/format/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/format/__tests__/CodeFormatter.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v256-code-formatter` 分支