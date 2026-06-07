# PRD: PixelPal V540 — Claude Code Splitter Engine (Direction A Iteration 71)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-110 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v540-splitter-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 71 = Splitter Engine**，来源：claude-code-design。

本迭代实现分割器引擎：分割、合并、统计（4 种模式：char/word/line/sentence）。

## 功能规格

### 1. 分割器引擎架构

```
Text → Splitter → Chunks
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sle/SplitterEngine.ts` | 分割器引擎 |
| `src/sle/__tests__/SplitterEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type SplitMode = 'char' | 'word' | 'line' | 'sentence';

class SplitterEngine {
  split(text: string, mode: SplitMode): string;
  merge(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { splits: number; totalSplit: number; totalMerged: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sle/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sle/__tests__/SplitterEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v540-splitter-engine` 分支