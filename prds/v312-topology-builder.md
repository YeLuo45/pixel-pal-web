# PRD: PixelPal V312 — Nanobot Topology Builder (Direction B Iteration 25)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-063 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v312-topology-builder |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 25 = Topology Builder**，来源：nanobot-design。

本迭代实现拓扑构建器：拓扑节点、拓扑边、布局算法、拓扑验证。

## 功能规格

### 1. 拓扑构建器架构

```
NodeBuilder → EdgeConnector → LayoutEngine → TopologyValidator
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/topo/TopologyBuilder.ts` | 拓扑构建器 |
| `src/topo/__tests__/TopologyBuilder.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface TopologyNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface TopologyEdge {
  from: string;
  to: string;
}

class TopologyBuilder {
  addNode(id: string, label: string): boolean;
  addEdge(from: string, to: string): boolean;
  layout(type: 'grid' | 'tree' | 'circle'): boolean;
  validate(): boolean;
  getStats(): { nodes: number; edges: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/topo/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/topo/__tests__/TopologyBuilder.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v312-topology-builder` 分支