# PRD: PixelPal V421 — Claude Code Diff Engine (Direction A Iteration 47)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-460 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v421-diff-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 47 = Diff Engine**，来源：claude-code-design。

本迭代实现 Diff 引擎：Diff 创建、Diff 比较、Diff 统计。

## 功能规格

### 1. Diff 引擎架构

```
DiffCreator → DiffComparer → DiffReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/de3/DiffEngine.ts` | Diff 引擎 |
| `src/de3/__tests__/DiffEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Diff {
  id: string;
  name: string;
  oldText: string;
  newText: string;
  changes: number;
}

class DiffEngine {
  create(name: string, oldText: string, newText: string): string;
  update(id: string, newText: string): boolean;
  getChanges(id: string): number;
  getStats(): { diffs: number; totalChanges: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/de3/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/de3/__tests__/DiffEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v421-diff-engine` 分支