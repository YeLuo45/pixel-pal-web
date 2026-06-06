# PRD: PixelPal V338 — Chatdev Knowledge Base (Direction C Iteration 30)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-146 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v338-knowledge-base |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 30 = Knowledge Base**，来源：chatdev-design。

本迭代实现知识库：知识条目、知识查询、知识更新、知识统计。

## 功能规格

### 1. 知识库架构

```
KnowledgeAdder → KnowledgeQuerier → KnowledgeUpdater → KnowledgeReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/kb/KnowledgeBase.ts` | 知识库 |
| `src/kb/__tests__/KnowledgeBase.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Knowledge {
  id: string;
  topic: string;
  content: string;
  confidence: number;
  hits: number;
}

class KnowledgeBase {
  add(topic: string, content: string, confidence: number): string;
  query(topic: string): Knowledge[];
  update(id: string, content: string): boolean;
  getStats(): { entries: number; totalHits: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/kb/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/kb/__tests__/KnowledgeBase.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v338-knowledge-base` 分支