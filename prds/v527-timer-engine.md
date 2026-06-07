# PRD: PixelPal V527 — Chatdev Timer Engine (Direction C Iteration 68)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-080 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v527-timer-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 68 = Timer Engine**，来源：chatdev-design。

本迭代实现计时器引擎：计时器创建、滴答、暂停、恢复、停止、统计（3 种状态：running/paused/finished）。

## 功能规格

### 1. 计时器引擎架构

```
TimerCreator → TimerTicker → TimerStopper
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/tme/TimerEngine.ts` | 计时器引擎 |
| `src/tme/__tests__/TimerEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type TimerStatus = 'running' | 'paused' | 'finished';

class TimerEngine {
  create(name: string, duration: number): string;
  tick(id: string, amount: number): boolean;
  pause(id: string): boolean;
  resume(id: string): boolean;
  stop(id: string): boolean;
  getStats(): { timers: number; totalCreated: number; totalTicked: number; totalStopped: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/tme/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/tme/__tests__/TimerEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v527-timer-engine` 分支