# PRD: PixelPal V509 — Thunderbolt Watchdog Engine (Direction E Iteration 64)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-238 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v509-watchdog-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 64 = Watchdog Engine**，来源：thunderbolt-design。

本迭代实现看门狗引擎：看门狗注册、喂食、检查、统计（3 种状态：healthy/sick/dead）。

## 功能规格

### 1. 看门狗引擎架构

```
WatchdogRegistrar → WatchdogFeeder → WatchdogChecker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/wde/WatchdogEngine.ts` | 看门狗引擎 |
| `src/wde/__tests__/WatchdogEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type WatchdogState = 'healthy' | 'sick' | 'dead';

class WatchdogEngine {
  register(name: string, threshold: number): string;
  feed(id: string): boolean;
  check(id: string): WatchdogState;
  getStats(): { watchdogs: number; totalFed: number; totalDead: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/wde/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/wde/__tests__/WatchdogEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v509-watchdog-engine` 分支