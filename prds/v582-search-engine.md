# PRD: PixelPal V582 — Chatdev Search Engine (Direction C Iteration 79)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-324 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v582-search-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 79 = Search Engine**，来源：chatdev-design。

本迭代实现搜索引擎：索引、查询、统计（4 种字段：title/body/tags/all）。

## 功能规格

### 1. 搜索引擎架构

```
Indexer → Querier → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sce2/SearchEngine.ts` | 搜索引擎 |
| `src/sce2/__tests__/SearchEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type SearchField = 'title' | 'body' | 'tags' | 'all';

class SearchEngine {
  index(title: string, body: string, tags: string[]): string;
  query(text: string, field: SearchField): SearchResult[];
  remove(id: string): boolean;
  getStats(): { docs: number; totalIndexed: number; totalQueried: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sce2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sce2/__tests__/SearchEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v582-search-engine` 分支