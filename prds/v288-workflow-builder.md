# PRD: PixelPal V288 — Chatdev Workflow Builder (Direction C Iteration 20)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-168 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v288-workflow-builder |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 20 = Workflow Builder**，来源：chatdev-design。

本迭代实现工作流构建器：步骤定义、步骤连接、步骤验证、步骤编译。

## 功能规格

### 1. 工作流构建器架构

```
StepDefiner → StepConnector → StepValidator → StepCompiler
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/build/WorkflowBuilder.ts` | 工作流构建器 |
| `src/build/__tests__/WorkflowBuilder.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Step {
  id: string;
  name: string;
  action: string;
  next: string[];
}

interface WorkflowDef {
  steps: Step[];
  start: string;
  end: string[];
}

class WorkflowBuilder {
  addStep(step: Omit<Step, 'next'>): boolean;
  connect(from: string, to: string): boolean;
  validate(workflow: WorkflowDef): boolean;
  compile(workflow: WorkflowDef): string;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/build/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/build/__tests__/WorkflowBuilder.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v288-workflow-builder` 分支