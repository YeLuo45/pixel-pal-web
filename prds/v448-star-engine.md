# PRD: PixelPal V448 — Chatdev Star Engine (Direction C Iteration 52)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-552 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v448-star-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 52 = Star Engine**，来源：chatdev-design。

本迭代实现星标引擎：星标操作、星标查询、星标统计。

## 功能规格

### 1. 星标引擎架构

```
StarToggler → StarQuerier → StarReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ste/StarEngine.ts` | 星标引擎 |
| `src/ste/__tests__/StarEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Star {
  id: string;
  itemId: string;
  user: string;
  starred: boolean;
}

class StarEngine {
  star(itemId: string, user: string): string;
  unstar(id: string): boolean;
  getByItem(itemId: string): Star[];
  getStats(): { stars: number; totalStars: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ste/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ste/__tests__/StarEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v448-star-engine` 分支