# PRD: PixelPal V351 — Claude Code Snippet Manager (Direction A Iteration 33)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-182 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v351-snippet-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 33 = Snippet Manager**，来源：claude-code-design。

本迭代实现代码片段管理器：片段添加、片段查询、片段版本、片段统计。

## 功能规格

### 1. 代码片段管理器架构

```
SnippetAdder → SnippetQuerier → SnippetVersioner → SnippetReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/snip/SnippetManager.ts` | 代码片段管理器 |
| `src/snip/__tests__/SnippetManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Snippet {
  id: string;
  name: string;
  code: string;
  language: string;
  version: number;
  hits: number;
}

class SnippetManager {
  add(name: string, code: string, language: string): string;
  update(id: string, code: string): boolean;
  search(query: string): Snippet[];
  getStats(): { snippets: number; languages: number; totalHits: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/snip/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/snip/__tests__/SnippetManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v351-snippet-manager` 分支