# PRD: PixelPal V204 — Nanobot Node Registry v2 (Direction B Iteration 2/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260604-052 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v204-node-registry-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 2/9 = Node Registry v2**，来源：nanobot Node Registry v2。

本迭代实现节点注册表v2：服务发现、负载均衡、节点健康追踪、元数据管理。

## 功能规格

### 1. 节点注册表架构

```
节点注册 → 服务发现 → 负载均衡 → 健康追踪 → 元数据管理
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/registry/NodeRegistry.ts` | 节点注册表 |
| `src/registry/__tests__/NodeRegistry.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface NodeMetadata {
  tags: Record<string, string>;
  region?: string;
  version?: string;
}

interface RegisteredNode {
  nodeId: string;
  address: string;
  status: 'active' | 'inactive' | 'draining';
  metadata: NodeMetadata;
  registeredAt: number;
  lastHeartbeat: number;
  loadFactor: number;
}

interface ServiceEndpoint {
  serviceName: string;
  nodes: RegisteredNode[];
}

class NodeRegistry {
  register(node: Omit<RegisteredNode, 'registeredAt' | 'lastHeartbeat' | 'loadFactor'>): void;
  deregister(nodeId: string): void;
  discover(serviceName: string): ServiceEndpoint | null;
  heartbeat(nodeId: string): void;
  updateLoadFactor(nodeId: string, load: number): void;
  getHealthyNodes(serviceName: string): RegisteredNode[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/registry/__tests__/`

## 验收标准

- [ ] `npx vitest run src/registry --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v204-node-registry-v2` 分支