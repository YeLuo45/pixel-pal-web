# PRD: PixelPal V292 — Nanobot Mesh Network (Direction B Iteration 21)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-002 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v292-mesh-network |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 21 = Mesh Network**，来源：nanobot-design。

本迭代实现网格网络：节点连接、消息传递、路由发现、网络拓扑。

## 功能规格

### 1. 网格网络架构

```
NodeConnector → MessagePasser → RouteDiscoverer → TopologyBuilder
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mesh/MeshNetwork.ts` | 网格网络 |
| `src/mesh/__tests__/MeshNetwork.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface MeshNode {
  id: string;
  peers: string[];
  reachable: boolean;
}

class MeshNetwork {
  addNode(id: string): boolean;
  connect(from: string, to: string): boolean;
  send(from: string, to: string, message: string): boolean;
  getTopology(): Map<string, string[]>;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mesh/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/mesh/__tests__/MeshNetwork.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v292-mesh-network` 分支