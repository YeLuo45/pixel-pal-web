# PRD: PixelPal V447 — Nanobot Index Manager (Direction B Iteration 52)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-549 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v447-index-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 52 = Index Manager**，来源：nanobot-design。

本迭代实现索引管理器：索引创建、索引添加、索引查询、索引统计。

## 功能规格

### 1. 索引管理器架构

```
IndexCreator → IndexAdder → IndexQuerier
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ixm/IndexManager.ts` | 索引管理器 |
| `src/ixm/__tests__/IndexManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Index {
  id: string;
  name: string;
  field: string;
  entries: Map<string, string[]>;
  entries_count: number;
}

class IndexManager {
  create(name: string, field: string): string;
  add(id: string, key: string, value: string): boolean;
  query(id: string, key: string): string[];
  remove(id: string): boolean;
  getStats(): { indexes: number; totalEntries: number; totalQueries: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ixm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ixm/__tests__/IndexManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v447-index-manager` 分支