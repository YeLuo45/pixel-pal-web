# PRD: PixelPal V360 — Thunderbolt Queue Manager (Direction E Iteration 34)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-222 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v360-queue-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 34 = Queue Manager**，来源：thunderbolt-design。

本迭代实现队列管理器：队列入队、队列出队、队列优先级、队列统计。

## 功能规格

### 1. 队列管理器架构

```
QueueEnqueuer → QueueDequeuer → QueuePrioritizer → QueueReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/qm/QueueManager.ts` | 队列管理器 |
| `src/qm/__tests__/QueueManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface QueueItem {
  id: string;
  name: string;
  priority: number;
  processed: boolean;
}

class QueueManager {
  enqueue(name: string, priority: number): string;
  dequeue(): string | null;
  getStats(): { items: number; processed: number; pending: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/qm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/qm/__tests__/QueueManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v360-queue-manager` 分支