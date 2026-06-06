# PRD: PixelPal V403 — Chatdev Workflow Engine (Direction C Iteration 43)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-364 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v403-workflow-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 43 = Workflow Engine**，来源：chatdev-design。

本迭代实现工作流引擎：工作流定义、阶段执行、工作流统计。

## 功能规格

### 1. 工作流引擎架构

```
WorkflowDefiner → StageExecutor → WorkflowReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/wf/WorkflowEngine.ts` | 工作流引擎 |
| `src/wf/__tests__/WorkflowEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Workflow {
  id: string;
  name: string;
  stages: string[];
  currentStage: number;
  completed: boolean;
}

class WorkflowEngine {
  define(name: string, stages: string[]): string;
  advance(id: string): boolean;
  getCurrentStage(id: string): string;
  getStats(): { workflows: number; completed: number; inProgress: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/wf/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/wf/__tests__/WorkflowEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v403-workflow-engine` 分支