# PRD: PixelPal V599 — Thunderbolt Stream Engine (Direction E Iteration 82)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-037 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v599-stream-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 82 = Stream Engine**，来源：thunderbolt-design。

本迭代实现流引擎：创建、写入、刷新、关闭、失败、统计（5 种 mode：idle/writing/flushing/closed/error）。

## 功能规格

### 1. 流引擎架构

```
StreamCreator → Writer → Flusher → Closer / Failer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ste/StreamEngine.ts` | 流引擎 |
| `src/ste/__tests__/StreamEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type StreamMode = 'idle' | 'writing' | 'flushing' | 'closed' | 'error';

class StreamEngine {
  create(name: string): string;
  write(id: string, bytes: number): boolean;
  flush(id: string): boolean;
  close(id: string): boolean;
  fail(id: string): boolean;
  reset(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { streams: number; totalAdded: number; totalWritten: number; totalFlushed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ste/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ste/__tests__/StreamEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v599-stream-engine` 分支