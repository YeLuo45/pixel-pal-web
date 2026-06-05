# PRD: PixelPal V335 — Thunderbolt Resource Manager (Direction E Iteration 29)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-123 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v335-resource-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 29 = Resource Manager**，来源：thunderbolt-design。

本迭代实现资源管理器：资源分配、容量规划、限额控制、容量报告。

## 功能规格

### 1. 资源管理器架构

```
ResourceAllocator → CapacityPlanner → QuotaEnforcer → CapacityReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/rm/ResourceManager.ts` | 资源管理器 |
| `src/rm/__tests__/ResourceManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Resource {
  id: string;
  name: string;
  capacity: number;
  used: number;
}

class ResourceManager {
  add(name: string, capacity: number): string;
  allocate(id: string, amount: number): boolean;
  release(id: string, amount: number): boolean;
  getStats(): { total: number; used: number; available: number; utilization: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/rm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/rm/__tests__/ResourceManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v335-resource-manager` 分支