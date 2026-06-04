# PRD: PixelPal V244 — Generic-Agent Knowledge Base (Direction D Iteration 11)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-058 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v244-knowledge-base |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 11 = Knowledge Base**，来源：generic-agent-design。

本迭代实现知识库：知识存储、知识检索、知识更新、知识版本。

## 功能规格

### 1. 知识库架构

```
KnowledgeStore → KnowledgeRetriever → KnowledgeUpdater → KnowledgeVersioner
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/knowledge/KnowledgeBase.ts` | 知识库 |
| `src/knowledge/__tests__/KnowledgeBase.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Knowledge {
  id: string;
  topic: string;
  content: string;
  version: number;
  updated: number;
  tags: string[];
}

class KnowledgeBase {
  addKnowledge(knowledge: Omit<Knowledge, 'id'>): string;
  update(id: string, content: string): Knowledge | null;
  search(query: string): Knowledge[];
  getByTag(tag: string): Knowledge[];
  getHistory(id: string): Knowledge[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/knowledge/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/knowledge/__tests__/KnowledgeBase.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v244-knowledge-base` 分支