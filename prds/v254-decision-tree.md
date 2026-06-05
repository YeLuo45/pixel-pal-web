# PRD: PixelPal V254 — Generic-Agent Decision Tree (Direction D Iteration 13)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-079 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v254-decision-tree |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 13 = Decision Tree**，来源：generic-agent-design。

本迭代实现决策树：树构建、树遍历、树评估、树剪枝。

## 功能规格

### 1. 决策树架构

```
TreeBuilder → TreeWalker → TreeEvaluator → TreePruner
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/tree/DecisionTree.ts` | 决策树 |
| `src/tree/__tests__/DecisionTree.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface TreeNode {
  id: string;
  condition: string;
  result?: string;
  children: string[];
}

class DecisionTree {
  addNode(node: TreeNode): void;
  setRoot(id: string): void;
  evaluate(context: Record<string, unknown>): string | null;
  prune(id: string): boolean;
  traverse(order: 'bfs' | 'dfs'): string[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/tree/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/tree/__tests__/DecisionTree.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v254-decision-tree` 分支