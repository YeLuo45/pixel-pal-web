# PRD: PixelPal V316 — Claude Code Profiler (Direction A Iteration 26)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-070 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v316-profiler |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 26 = Profiler**，来源：claude-code-design。

本迭代实现性能分析器：性能采样、性能分析、瓶颈检测、报告生成。

## 功能规格

### 1. 性能分析器架构

```
PerfSampler → PerfAnalyzer → BottleneckDetector → ReportBuilder
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/prof/Profiler.ts` | 性能分析器 |
| `src/prof/__tests__/Profiler.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface ProfileSample {
  id: string;
  name: string;
  duration: number;
  timestamp: number;
}

class Profiler {
  start(name: string): string;
  stop(id: string): number;
  getReport(): ProfileSample[];
  getStats(): { samples: number; total: number; avg: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/prof/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/prof/__tests__/Profiler.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v316-profiler` 分支