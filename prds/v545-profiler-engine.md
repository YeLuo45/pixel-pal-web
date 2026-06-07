# PRD: PixelPal V545 — Claude Code Profiler Engine (Direction A Iteration 72)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-160 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v545-profiler-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 72 = Profiler Engine**，来源：claude-code-design。

本迭代实现分析器引擎：开始、停止、采样、统计（4 种类型：cpu/memory/network/disk）。

## 功能规格

### 1. 分析器引擎架构

```
ProfilerStarter → ProfilerStopper → Profiler
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pre2/ProfilerEngine.ts` | 分析器引擎 |
| `src/pre2/__tests__/ProfilerEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ProfileType = 'cpu' | 'memory' | 'network' | 'disk';

class ProfilerEngine {
  start(name: string, type: ProfileType): string;
  stop(id: string, duration: number): boolean;
  profile(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { profiles: number; totalStarted: number; totalStopped: number; totalProfiled: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pre2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pre2/__tests__/ProfilerEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v545-profiler-engine` 分支