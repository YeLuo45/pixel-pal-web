# PRD: PixelPal V386 — Claude Code Build Engine (Direction A Iteration 40)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-297 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v386-build-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 40 = Build Engine**，来源：claude-code-design。

本迭代实现构建引擎：构建定义、构建执行、构建报告、构建统计。

## 功能规格

### 1. 构建引擎架构

```
BuildDefiner → BuildExecutor → BuildReporter → BuildAggregator
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/be/BuildEngine.ts` | 构建引擎 |
| `src/be/__tests__/BuildEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Build {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration: number;
  started: number | null;
  finished: number | null;
}

class BuildEngine {
  define(name: string): string;
  start(id: string): boolean;
  finish(id: string, success: boolean): boolean;
  getStats(): { builds: number; success: number; failed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/be/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/be/__tests__/BuildEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v386-build-engine` 分支