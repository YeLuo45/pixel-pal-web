# PRD: PixelPal V380 — Thunderbolt Streaming Engine (Direction E Iteration 38)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-291 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v380-streaming-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 38 = Streaming Engine**，来源：thunderbolt-design。

本迭代实现流式引擎：流创建、数据推送、流订阅、流统计。

## 功能规格

### 1. 流式引擎架构

```
StreamCreator → DataPusher → StreamSubscriber → StreamReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/se/StreamingEngine.ts` | 流式引擎 |
| `src/se/__tests__/StreamingEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Stream {
  id: string;
  name: string;
  chunks: number;
  subscribers: string[];
}

class StreamingEngine {
  create(name: string): string;
  push(id: string, data: unknown): boolean;
  subscribe(id: string, handler: string): boolean;
  getStats(): { streams: number; totalChunks: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/se/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/se/__tests__/StreamingEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v380-streaming-engine` 分支