# PRD: PixelPal V295 — Thunderbolt Saga Coordinator (Direction E Iteration 21)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-017 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v295-saga-coordinator |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 21 = Saga Coordinator**，来源：thunderbolt-design。

本迭代实现saga协调器：saga定义、saga执行、saga补偿、saga协调。

## 功能规格

### 1. saga协调器架构

```
SagaDefiner → SagaExecutor → SagaCompensator → SagaCoordinator
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/saga/SagaCoordinator.ts` | saga协调器 |
| `src/saga/__tests__/SagaCoordinator.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface SagaStep {
  name: string;
  action: () => Promise<boolean>;
  compensate: () => Promise<void>;
}

interface SagaInstance {
  id: string;
  steps: SagaStep[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'compensated';
  currentStep: number;
}

class SagaCoordinator {
  define(steps: SagaStep[]): string;
  execute(id: string): Promise<boolean>;
  compensate(id: string): Promise<boolean>;
  getStats(): { sagas: number; completed: number; failed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/saga/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/saga/__tests__/SagaCoordinator.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v295-saga-coordinator` 分支