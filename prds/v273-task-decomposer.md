# PRD: PixelPal V273 — Chatdev Task Decomposer (Direction C Iteration 17)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-122 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v273-task-decomposer |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 17 = Task Decomposer**，来源：chatdev-design。

本迭代实现任务分解器：任务定义、任务拆分、任务依赖、任务调度。

## 功能规格

### 1. 任务分解器架构

```
TaskDefiner → TaskSplitter → TaskDependencyMapper → TaskScheduler
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/decompose/TaskDecomposer.ts` | 任务分解器 |
| `src/decompose/__tests__/TaskDecomposer.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface SubTask {
  id: string;
  name: string;
  parent: string | null;
  dependencies: string[];
  order: number;
}

class TaskDecomposer {
  defineTask(name: string): string;
  decompose(taskId: string, subtaskNames: string[]): string[];
  addDependency(subtaskId: string, dependsOn: string): boolean;
  getOrder(taskId: string): SubTask[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/decompose/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/decompose/__tests__/TaskDecomposer.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v273-task-decomposer` 分支