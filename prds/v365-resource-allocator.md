# PRD: PixelPal V365 — Thunderbolt Resource Allocator (Direction E Iteration 35)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-229 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v365-resource-allocator |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 35 = Resource Allocator**，来源：thunderbolt-design。

本迭代实现资源分配器：资源添加、分配请求、分配执行、分配统计。

## 功能规格

### 1. 资源分配器架构

```
ResourceAdder → AllocationRequester → AllocationExecutor → AllocationReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ra/ResourceAllocator.ts` | 资源分配器 |
| `src/ra/__tests__/ResourceAllocator.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Allocation {
  id: string;
  resource: string;
  requester: string;
  amount: number;
  status: 'pending' | 'allocated' | 'denied';
}

class ResourceAllocator {
  add(resource: string, capacity: number): string;
  request(resource: string, requester: string, amount: number): string;
  execute(id: string): boolean;
  getStats(): { allocations: number; allocated: number; denied: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ra/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ra/__tests__/ResourceAllocator.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v365-resource-allocator` 分支