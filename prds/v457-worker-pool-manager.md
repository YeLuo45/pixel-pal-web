# PRD: PixelPal V457 — Nanobot Worker Pool Manager (Direction B Iteration 54)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-571 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v457-worker-pool-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 54 = Worker Pool Manager**，来源：nanobot-design。

本迭代实现工作池管理器：池创建、worker 添加、worker 移除、池统计。

## 功能规格

### 1. 工作池管理器架构

```
PoolCreator → WorkerAdder → WorkerRemover
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/wpm/WorkerPoolManager.ts` | 工作池管理器 |
| `src/wpm/__tests__/WorkerPoolManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface WorkerPool {
  id: string;
  name: string;
  workers: string[];
  size: number;
}

class WorkerPoolManager {
  create(name: string, size: number): string;
  addWorker(id: string, worker: string): boolean;
  removeWorker(id: string, worker: string): boolean;
  getStats(): { pools: number; totalWorkers: number; emptyPools: number; fullPools: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/wpm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/wpm/__tests__/WorkerPoolManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v457-worker-pool-manager` 分支