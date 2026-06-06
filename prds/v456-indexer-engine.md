# PRD: PixelPal V456 — Claude Code Indexer Engine (Direction A Iteration 54)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-569 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v456-indexer-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 54 = Indexer Engine**，来源：claude-code-design。

本迭代实现索引器引擎：词条索引、词条搜索、索引统计。

## 功能规格

### 1. 索引器引擎架构

```
IndexerAdder → IndexerSearcher → IndexerReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ine/IndexerEngine.ts` | 索引器引擎 |
| `src/ine/__tests__/IndexerEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface IndexEntry {
  id: string;
  term: string;
  documentId: string;
  position: number;
  frequency: number;
}

class IndexerEngine {
  index(term: string, documentId: string, position: number): string;
  search(term: string): IndexEntry[];
  increment(id: string): boolean;
  getStats(): { entries: number; uniqueTerms: number; totalSearches: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ine/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ine/__tests__/IndexerEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v456-indexer-engine` 分支