# PRD: PixelPal V376 — Claude Code Tree Engine (Direction A Iteration 38)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-283 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v376-tree-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 38 = Tree Engine**，来源：claude-code-design。

本迭代实现树引擎：节点添加、节点查找、节点遍历、树统计。

## 功能规格

### 1. 树引擎架构

```
NodeAdder → NodeFinder → NodeTraverser → TreeReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/te/TreeEngine.ts` | 树引擎 |
| `src/te/__tests__/TreeEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface TreeNode {
  id: string;
  name: string;
  parent: string | null;
  children: string[];
}

class TreeEngine {
  add(name: string, parent: string | null): string;
  find(id: string): TreeNode | null;
  traverse(id: string, order: 'pre' | 'post' | 'bfs'): string[];
  getStats(): { nodes: number; roots: number; maxDepth: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/te/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/te/__tests__/TreeEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v376-tree-engine` 分支