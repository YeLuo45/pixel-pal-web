# PRD: PixelPal V425 — Thunderbolt Queue Manager v2 (Direction E Iteration 47)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-470 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v425-queue-manager-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 47 = Queue Manager v2**，来源：thunderbolt-design。

本迭代实现队列管理器 v2：队列创建、任务调度、队列统计。

## 功能规格

### 1. 队列管理器 v2 架构

```
QueueCreator → TaskScheduler → QueueReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/qm2/QueueManagerV2.ts` | 队列管理器 v2 |
| `src/qm2/__tests__/QueueManagerV2.test.ts` | 测试 |

### 3. 接口设计

```typescript
type QueuePriority = 'low' | 'medium' | 'high' | 'critical';

interface QueueItem {
  id: string;
  name: string;
  priority: QueuePriority;
  status: 'pending' | 'processing' | 'done' | 'failed';
}

class QueueManagerV2 {
  create(name: string, priority: QueuePriority): string;
  schedule(id: string): boolean;
  complete(id: string): boolean;
  fail(id: string): boolean;
  getStats(): { queues: number; pending: number; processing: number; done: number; failed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/qm2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/qm2/__tests__/QueueManagerV2.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v425-queue-manager-v2` 分支