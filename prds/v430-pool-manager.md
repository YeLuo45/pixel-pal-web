# PRD: PixelPal V430 — Thunderbolt Pool Manager (Direction E Iteration 48)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-479 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v430-pool-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 48 = Pool Manager**，来源：thunderbolt-design。

本迭代实现连接池管理器：池创建、池分配、池统计。

## 功能规格

### 1. 连接池管理器架构

```
PoolCreator → PoolAllocator → PoolReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/plm/PoolManager.ts` | 连接池管理器 |
| `src/plm/__tests__/PoolManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Pool {
  id: string;
  name: string;
  size: number;
  allocated: number;
  available: number;
}

class PoolManager {
  create(name: string, size: number): string;
  allocate(id: string): boolean;
  release(id: string): boolean;
  getStats(): { pools: number; totalAllocated: number; totalAvailable: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/plm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/plm/__tests__/PoolManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v430-pool-manager` 分支