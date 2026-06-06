# PRD: PixelPal V367 — Nanobot Service Mesh (Direction B Iteration 36)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-232 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v367-service-mesh |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 36 = Service Mesh**，来源：nanobot-design。

本迭代实现服务网格：网格定义、流量管理、安全策略、网格统计。

## 功能规格

### 1. 服务网格架构

```
MeshDefiner → TrafficManager → PolicyEnforcer → MeshReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mesh/ServiceMesh.ts` | 服务网格 |
| `src/mesh/__tests__/ServiceMesh.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface MeshNode {
  id: string;
  service: string;
  version: string;
  policies: string[];
}

class ServiceMesh {
  register(service: string, version: string): string;
  addPolicy(id: string, policy: string): boolean;
  getStats(): { nodes: number; totalPolicies: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mesh/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/mesh/__tests__/ServiceMesh.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v367-service-mesh` 分支