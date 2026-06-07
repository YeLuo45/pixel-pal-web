# PRD: PixelPal V497 — Chatdev Search Engine (Direction C Iteration 62)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-158 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v497-search-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 62 = Search Engine**，来源：chatdev-design。

本迭代实现搜索引擎：索引、搜索、建议、统计。

## 功能规格

### 1. 搜索引擎架构

```
ResultIndexer → SearchQuerier → SuggestionMaker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sre/SearchEngine.ts` | 搜索引擎 |
| `src/sre/__tests__/SearchEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
class SearchEngine {
  index(result: string, score: number): string;
  search(query: string): string[];
  suggest(prefix: string, limit: number): string[];
  getStats(): { results: number; totalIndexed: number; totalSearched: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sre/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sre/__tests__/SearchEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v497-search-engine` 分支