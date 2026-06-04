# PRD: PixelPal V194 — Nanobot Distributed Mesh (Direction B Iteration 2/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260604-046 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v194-distributed-mesh |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 2/9 = Distributed Mesh**，来源：nanobot Distributed Mesh。

本迭代实现分布式Mesh拓扑：节点注册、邻居发现、消息路由、故障转移。

## 功能规格

### 1. Mesh拓扑架构

```
NodeA ←→ NodeB ←→ NodeC
   ↓         ↓
  NodeD ←→ NodeE
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mesh/DistributedMesh.ts` | Mesh拓扑管理 |
| `src/mesh/NodeRegistry.ts` | 节点注册表 |
| `src/mesh/__tests__/DistributedMesh.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface MeshNode {
  nodeId: string;
  neighbors: string[];
  status: 'online' | 'offline' | 'degraded';
  lastHeartbeat: number;
}

class DistributedMesh {
  registerNode(nodeId: string): void
  unregisterNode(nodeId: string): void
  addNeighbor(nodeId: string, neighborId: string): void
  removeNeighbor(nodeId: string, neighborId: string): void
  findPath(from: string, to: string): string[] | null
  getMeshTopology(): MeshNode[]
  getOnlineNodes(): string[]
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mesh/__tests__/`

## 验收标准

- [ ] `npx vitest run src/mesh --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v194-distributed-mesh` 分支