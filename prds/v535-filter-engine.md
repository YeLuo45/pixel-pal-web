# PRD: PixelPal V535 — Claude Code Filter Engine (Direction A Iteration 70)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-088 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v535-filter-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 70 = Filter Engine**，来源：claude-code-design。

本迭代实现过滤器引擎：添加、应用、删除、统计（5 种操作：eq/ne/gt/lt/contains）。

## 功能规格

### 1. 过滤器引擎架构

```
FilterAdder → FilterApplier → FilterRemover
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/fle/FilterEngine.ts` | 过滤器引擎 |
| `src/fle/__tests__/FilterEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type FilterOp = 'eq' | 'ne' | 'gt' | 'lt' | 'contains';

class FilterEngine {
  add(name: string, field: string, op: FilterOp, value: string): string;
  apply(id: string, data: Record<string, string>): boolean;
  remove(id: string): boolean;
  getStats(): { filters: number; totalAdded: number; totalApplied: number; totalMatched: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/fle/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/fle/__tests__/FilterEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v535-filter-engine` 分支