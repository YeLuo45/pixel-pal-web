# PRD: PixelPal V257 — Nanobot Node Registry (Direction B Iteration 14)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-091 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v257-node-registry |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 14 = Node Registry**，来源：nanobot-design。

本迭代实现节点注册表：节点注册、节点查询、节点健康、节点发现。

## 功能规格

### 1. 节点注册表架构

```
NodeRegistrar → NodeQueryEngine → HealthMonitor → DiscoveryService
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/registry/NodeRegistry.ts` | 节点注册表 |
| `src/registry/__tests__/NodeRegistry.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Node {
  id: string;
  host: string;
  port: number;
  status: 'online' | 'offline' | 'busy';
  tags: string[];
}

class NodeRegistry {
  register(node: Node): void;
  find(id: string): Node | null;
  findByTag(tag: string): Node[];
  getHealthy(): Node[];
  deregister(id: string): boolean;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/registry/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/registry/__tests__/NodeRegistry.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v257-node-registry` 分支