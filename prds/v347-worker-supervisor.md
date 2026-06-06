# PRD: PixelPal V347 — Nanobot Worker Supervisor (Direction B Iteration 32)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-162 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v347-worker-supervisor |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 32 = Worker Supervisor**，来源：nanobot-design。

本迭代实现 Worker 监管器：worker监控、worker重启、worker告警、worker报告。

## 功能规格

### 1. Worker 监管器架构

```
WorkerMonitor → WorkerRestarter → WorkerAlerter → WorkerReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sup/WorkerSupervisor.ts` | Worker 监管器 |
| `src/sup/__tests__/WorkerSupervisor.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface SupervisedWorker {
  id: string;
  workerId: string;
  status: 'running' | 'stopped' | 'failed';
  restarts: number;
  alerts: number;
}

class WorkerSupervisor {
  supervise(workerId: string): string;
  restart(id: string): boolean;
  alert(id: string): boolean;
  getStats(): { workers: number; running: number; failed: number; totalRestarts: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sup/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sup/__tests__/WorkerSupervisor.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v347-worker-supervisor` 分支