# PRD: PixelPal V209 — Nanobot Network Topology Visualizer (Direction B Iteration 3/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260604-061 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v209-topology-visualizer |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 3/9 = Network Topology Visualizer**，来源：nanobot-design。

本迭代实现网络拓扑可视化器：节点图可视化、连接状态、热力图、时序动画。

## 功能规格

### 1. 网络拓扑可视化器架构

```
NetworkData → TopologyGraph → LayoutEngine → Renderer → SVG/Canvas
                      ↓
               InteractiveLayer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/topology/TopologyVisualizer.ts` | 拓扑可视化器 |
| `src/topology/__tests__/TopologyVisualizer.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  status: 'active' | 'inactive' | 'warning';
  metadata?: Record<string, unknown>;
}

interface Edge {
  source: string;
  target: string;
  weight: number;
  status: 'connected' | 'disconnected';
}

interface TopologyGraph {
  nodes: Node[];
  edges: Edge[];
}

class TopologyVisualizer {
  setGraph(graph: TopologyGraph): void;
  getNode(id: string): Node | null;
  getNodes(): Node[];
  getEdges(): Edge[];
  getActiveNodes(): Node[];
  calculateLoad(): Map<string, number>;
  getHotNodes(threshold: number): Node[];
  exportSVG(): string;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/topology/__tests__/`

## 验收标准

- [ ] `npx vitest run src/topology --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v209-topology-visualizer` 分支