# PRD: PixelPal V534 — Thunderbolt Worker Engine (Direction E Iteration 69)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-087 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v534-worker-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 69 = Worker Engine**，来源：thunderbolt-design。

本迭代实现工作器引擎：生成、处理、完成、失败、停止、统计（4 种状态：idle/busy/stopped/errored）。

## 功能规格

### 1. 工作器引擎架构

```
WorkerSpawner → WorkerProcessor → WorkerStopper
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/wke/WorkerEngine.ts` | 工作器引擎 |
| `src/wke/__tests__/WorkerEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type WorkerStatus = 'idle' | 'busy' | 'stopped' | 'errored';

class WorkerEngine {
  spawn(name: string): string;
  process(id: string): boolean;
  done(id: string): boolean;
  fail(id: string): boolean;
  stop(id: string): boolean;
  getStats(): { workers: number; totalSpawned: number; totalProcessed: number; totalErrors: number; totalStopped: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/wke/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/wke/__tests__/WorkerEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v534-worker-engine` 分支