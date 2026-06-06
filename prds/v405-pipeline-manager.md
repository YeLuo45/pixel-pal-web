# PRD: PixelPal V405 — Thunderbolt Pipeline Manager (Direction E Iteration 43)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-370 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v405-pipeline-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 43 = Pipeline Manager**，来源：thunderbolt-design。

本迭代实现管道管理器：管道创建、阶段执行、管道统计。

## 功能规格

### 1. 管道管理器架构

```
PipelineCreator → StageRunner → PipelineReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pm/PipelineManager.ts` | 管道管理器 |
| `src/pm/__tests__/PipelineManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Pipeline {
  id: string;
  name: string;
  steps: string[];
  currentStep: number;
  status: 'pending' | 'running' | 'success' | 'failed';
}

class PipelineManager {
  create(name: string, steps: string[]): string;
  runStep(id: string, success: boolean): boolean;
  getCurrentStep(id: string): string;
  getStats(): { pipelines: number; success: number; failed: number; pending: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pm/__tests__/PipelineManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v405-pipeline-manager` 分支