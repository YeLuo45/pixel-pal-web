# PRD: PixelPal V500 — Claude Code Watcher Engine (Direction A Iteration 63)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-197 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v500-watcher-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 63 = Watcher Engine**，来源：claude-code-design。

本迭代实现监视器引擎：监视、触发、停止、重置、统计。

## 功能规格

### 1. 监视器引擎架构

```
WatcherCreator → TriggerExecuter → WatcherStopper
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/wte/WatcherEngine.ts` | 监视器引擎 |
| `src/wte/__tests__/WatcherEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
class WatcherEngine {
  watch(name: string, condition: string): string;
  trigger(id: string): boolean;
  stop(id: string): boolean;
  reset(id: string): boolean;
  getStats(): { watchers: number; totalTriggered: number; totalStopped: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/wte/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/wte/__tests__/WatcherEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v500-watcher-engine` 分支