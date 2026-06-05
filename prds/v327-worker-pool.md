# PRD: PixelPal V327 — Nanobot Worker Pool (Direction B Iteration 28)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-100 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v327-worker-pool |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 28 = Worker Pool**，来源：nanobot-design。

本迭代实现工作池：worker注册、worker分配、worker回收、worker统计。

## 功能规格

### 1. 工作池架构

```
WorkerRegistrar → WorkerAssigner → WorkerRecycler → WorkerReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/worker/WorkerPool.ts` | 工作池 |
| `src/worker/__tests__/WorkerPool.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Worker {
  id: string;
  name: string;
  busy: boolean;
  tasks: number;
}

class WorkerPool {
  register(name: string): string;
  assign(id: string): boolean;
  release(id: string): boolean;
  getStats(): { workers: number; busy: number; idle: number; totalTasks: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/worker/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/worker/__tests__/WorkerPool.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v327-worker-pool` 分支