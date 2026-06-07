# PRD: PixelPal V555 — Claude Code Comparator Engine (Direction A Iteration 74)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-222 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v555-comparator-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 74 = Comparator Engine**，来源：claude-code-design。

本迭代实现比较器引擎：添加、比较、统计（6 种操作：eq/ne/gt/lt/le/ge）。

## 功能规格

### 1. 比较器引擎架构

```
Compararor → Comparator → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/cre2/ComparatorEngine.ts` | 比较器引擎 |
| `src/cre2/__tests__/ComparatorEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type CompareOp = 'eq' | 'ne' | 'gt' | 'lt' | 'le' | 'ge';

class ComparatorEngine {
  add(a: number, b: number, op: CompareOp): string;
  compare(id: string, a: number, b: number): boolean;
  remove(id: string): boolean;
  getStats(): { comparisons: number; totalAdded: number; totalCompared: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/cre2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/cre2/__tests__/ComparatorEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v555-comparator-engine` 分支