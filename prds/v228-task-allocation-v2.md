# PRD: PixelPal V228 — Chatdev Task Allocation v2 (Direction C Iteration 8/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-029 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v228-task-allocation-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 8/9 = Task Allocation v2**，来源：chatdev-design。

本迭代实现任务分配v2：任务队列、分配策略、工作量平衡、分配评分。

## 功能规格

### 1. 任务分配v2架构

```
TaskQueue → AllocationStrategy → WorkloadBalancer → AllocationScorer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/allocation/TaskAllocationV2.ts` | 任务分配v2 |
| `src/allocation/__tests__/TaskAllocationV2.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Worker {
  id: string;
  capacity: number;
  currentLoad: number;
  skills: string[];
}

interface Allocation {
  taskId: string;
  workerId: string;
  priority: number;
}

class TaskAllocationV2 {
  addWorker(worker: Worker): void;
  addTask(taskId: string, requiredSkills: string[]): void;
  allocate(): Allocation[];
  rebalance(): number;
  getWorkerLoad(id: string): number;
  getAllocationScore(): number;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/allocation/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/allocation/__tests__/TaskAllocationV2.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v228-task-allocation-v2` 分支