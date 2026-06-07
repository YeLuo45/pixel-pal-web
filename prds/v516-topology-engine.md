# PRD: PixelPal V516 — Nanobot Topology Engine (Direction B Iteration 66)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-262 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v516-topology-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 66 = Topology Engine**，来源：nanobot-design。

本迭代实现拓扑引擎：节点添加、链接添加、查询、邻居、统计（3 种状态：online/offline/degraded）。

## 功能规格

### 1. 拓扑引擎架构

```
NodeAdder → LinkAdder → TopologyQuerier
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/toe/TopologyEngine.ts` | 拓扑引擎 |
| `src/toe/__tests__/TopologyEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type NodeStatus = 'online' | 'offline' | 'degraded';

class TopologyEngine {
  addNode(name: string, status: NodeStatus): string;
  addLink(from: string, to: string, weight: number): string;
  query(id: string): TopoNode;
  neighbors(id: string): TopoLink[];
  getStats(): { nodes: number; links: number; totalNodes: number; totalLinks: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/toe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/toe/__tests__/TopologyEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v516-topology-engine` 分支