# PRD: PixelPal V310 — Thunderbolt Stream Aggregator (Direction E Iteration 24)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-049 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v310-stream-aggregator |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 24 = Stream Aggregator**，来源：thunderbolt-design。

本迭代实现流式聚合器：流创建、批聚合、滑动窗口、水位线。

## 功能规格

### 1. 流式聚合器架构

```
StreamCreator → BatchAggregator → WindowedBuffer → WatermarkTracker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sa/StreamAggregator.ts` | 流式聚合器 |
| `src/sa/__tests__/StreamAggregator.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Stream {
  id: string;
  events: unknown[];
  watermark: number;
  windowSize: number;
}

class StreamAggregator {
  createStream(id: string, windowSize?: number): boolean;
  emit(streamId: string, event: unknown): boolean;
  flush(streamId: string): unknown[];
  getStats(): { streams: number; events: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sa/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sa/__tests__/StreamAggregator.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v310-stream-aggregator` 分支