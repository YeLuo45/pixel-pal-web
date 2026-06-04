# PRD: PixelPal V250 — Thunderbolt Saga Orchestrator (Direction E Iteration 12)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-075 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v250-saga-orchestrator |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 12 = Saga Orchestrator**，来源：thunderbolt-design。

本迭代实现Saga编排器：事务定义、补偿动作、Saga执行、Saga状态追踪。

## 功能规格

### 1. Saga编排器架构

```
SagaDefinition → CompensationManager → SagaExecutor → SagaStateTracker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/saga/SagaOrchestrator.ts` | Saga编排器 |
| `src/saga/__tests__/SagaOrchestrator.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface SagaStep {
  name: string;
  action: () => Promise<boolean>;
  compensation: () => Promise<void>;
}

class SagaOrchestrator {
  defineSaga(name: string, steps: SagaStep[]): string;
  execute(sagaId: string): Promise<boolean>;
  compensate(sagaId: string): Promise<void>;
  getStatus(sagaId: string): 'pending' | 'running' | 'completed' | 'compensated' | 'failed';
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/saga/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/saga/__tests__/SagaOrchestrator.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v250-saga-orchestrator` 分支