# PRD: PixelPal V348 — Chatdev Workflow Tracker (Direction C Iteration 32)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-178 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v348-workflow-tracker |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 32 = Workflow Tracker**，来源：chatdev-design。

本迭代实现工作流跟踪器：工作流定义、阶段跟踪、进度统计、工作流报告。

## 功能规格

### 1. 工作流跟踪器架构

```
WorkflowDefiner → StageTracker → ProgressCalculator → WorkflowReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/wf/WorkflowTracker.ts` | 工作流跟踪器 |
| `src/wf/__tests__/WorkflowTracker.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Workflow {
  id: string;
  name: string;
  totalSteps: number;
  currentStep: number;
  completed: boolean;
}

class WorkflowTracker {
  define(name: string, steps: number): string;
  advance(id: string): boolean;
  getProgress(id: string): number;
  getStats(): { workflows: number; completed: number; avgProgress: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/wf/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/wf/__tests__/WorkflowTracker.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v348-workflow-tracker` 分支