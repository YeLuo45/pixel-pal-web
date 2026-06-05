# PRD: PixelPal V252 — Nanobot Topology Mapper (Direction B Iteration 13)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-077 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v252-topology-mapper |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 13 = Topology Mapper**，来源：nanobot-design。

本迭代实现拓扑映射器：节点映射、连接映射、子网检测、拓扑分析。

## 功能规格

### 1. 拓扑映射器架构

```
NodeMapper → ConnectionMapper → SubnetDetector → TopologyAnalyzer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/topology/TopologyMapper.ts` | 拓扑映射器 |
| `src/topology/__tests__/TopologyMapper.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface TopologyNode {
  id: string;
  type: 'gateway' | 'service' | 'database' | 'cache';
  subnet: string;
}

interface TopologyLink {
  source: string;
  target: string;
  weight: number;
}

class TopologyMapper {
  addNode(node: TopologyNode): void;
  addLink(link: TopologyLink): void;
  getSubnets(): string[];
  getNodesInSubnet(subnet: string): TopologyNode[];
  getStats(): { nodes: number; links: number; subnets: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/topology/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/topology/__tests__/TopologyMapper.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v252-topology-mapper` 分支