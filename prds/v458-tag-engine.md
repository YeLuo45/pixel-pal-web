# PRD: PixelPal V458 — Chatdev Tag Engine (Direction C Iteration 54)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-573 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v458-tag-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 54 = Tag Engine**，来源：chatdev-design。

本迭代实现标签引擎：标签添加、标签移除、标签查询、标签统计。

## 功能规格

### 1. 标签引擎架构

```
TagAdder → TagIncrementer → TagReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/tge/TagEngine.ts` | 标签引擎 |
| `src/tge/__tests__/TagEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Tag {
  id: string;
  itemId: string;
  name: string;
  count: number;
}

class TagEngine {
  tag(itemId: string, name: string): string;
  untag(id: string): boolean;
  increment(id: string): boolean;
  getByItem(itemId: string): Tag[];
  getStats(): { tags: number; totalTags: number; uniqueNames: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/tge/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/tge/__tests__/TagEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v458-tag-engine` 分支