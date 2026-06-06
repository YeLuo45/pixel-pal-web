# PRD: PixelPal V437 — Nanobot Queue Manager (Direction B Iteration 50)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-510 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v437-queue-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 50 = Queue Manager**，来源：nanobot-design。

本迭代实现队列管理器：任务入队、任务出队、队列统计。

## 功能规格

### 1. 队列管理器架构

```
TaskEnqueuer → TaskDequeuer → QueueReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/qm3/QueueManager.ts` | 队列管理器 |
| `src/qm3/__tests__/QueueManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface QueueItem {
  id: string;
  task: string;
  priority: number;
  status: 'queued' | 'processing' | 'done';
}

class QueueManager {
  enqueue(task: string, priority?: number): string;
  dequeue(): string | null;
  peek(): string | null;
  size(): number;
  getStats(): { queued: number; processing: number; done: number; totalTasks: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/qm3/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/qm3/__tests__/QueueManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v437-queue-manager` 分支