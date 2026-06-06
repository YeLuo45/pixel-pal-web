# PRD: PixelPal V451 — Claude Code Snippet Engine (Direction A Iteration 53)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-562 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v451-snippet-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 53 = Snippet Engine**，来源：claude-code-design。

本迭代实现代码片段引擎：片段创建、片段搜索、片段统计。

## 功能规格

### 1. 代码片段引擎架构

```
SnippetCreator → SnippetSearcher → SnippetReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sne/SnippetEngine.ts` | 代码片段引擎 |
| `src/sne/__tests__/SnippetEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Snippet {
  id: string;
  title: string;
  language: string;
  content: string;
  tags: string[];
}

class SnippetEngine {
  create(title: string, language: string, content: string, tags: string[]): string;
  get(id: string): Snippet;
  search(query: string): Snippet[];
  getStats(): { snippets: number; totalTags: number; uniqueLanguages: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sne/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sne/__tests__/SnippetEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v451-snippet-engine` 分支