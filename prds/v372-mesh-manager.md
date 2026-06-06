# PRD: PixelPal V372 — Nanobot Mesh Manager (Direction B Iteration 37)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-265 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v372-mesh-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 37 = Mesh Manager**，来源：nanobot-design。

本迭代实现网格管理器：网格节点、节点连接、节点发现、网格统计。

## 功能规格

### 1. 网格管理器架构

```
MeshNodeRegistrar → MeshConnector → MeshDiscoverer → MeshReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mm/MeshManager.ts` | 网格管理器 |
| `src/mm/__tests__/MeshManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface MeshNode {
  id: string;
  name: string;
  address: string;
  connections: string[];
}

class MeshManager {
  register(name: string, address: string): string;
  connect(id1: string, id2: string): boolean;
  discover(id: string): string[];
  getStats(): { nodes: number; connections: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/mm/__tests__/MeshManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v372-mesh-manager` 分支