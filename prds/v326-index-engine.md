# PRD: PixelPal V326 — Claude Code Index Engine (Direction A Iteration 28)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-099 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v326-index-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 28 = Index Engine**，来源：claude-code-design。

本迭代实现索引引擎：索引构建、索引查询、索引更新、索引重建。

## 功能规格

### 1. 索引引擎架构

```
IndexBuilder → IndexQuerier → IndexUpdater → IndexRebuilder
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/idx/IndexEngine.ts` | 索引引擎 |
| `src/idx/__tests__/IndexEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface IndexEntry {
  id: string;
  key: string;
  value: unknown;
  hits: number;
}

class IndexEngine {
  build(key: string, value: unknown): string;
  query(key: string): IndexEntry[];
  rebuild(): boolean;
  getStats(): { entries: number; keys: number; totalHits: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/idx/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/idx/__tests__/IndexEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v326-index-engine` 分支