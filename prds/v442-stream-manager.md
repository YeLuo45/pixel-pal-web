# PRD: PixelPal V442 — Nanobot Stream Manager (Direction B Iteration 51)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-520 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v442-stream-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 51 = Stream Manager**，来源：nanobot-design。

本迭代实现流管理器：流创建、流推送、流统计。

## 功能规格

### 1. 流管理器架构

```
StreamCreator → StreamPusher → StreamReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/stm/StreamManager.ts` | 流管理器 |
| `src/stm/__tests__/StreamManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Stream {
  id: string;
  name: string;
  chunks: string[];
  subscribers: number;
  active: boolean;
}

class StreamManager {
  create(name: string): string;
  push(id: string, chunk: string): boolean;
  subscribe(id: string): boolean;
  unsubscribe(id: string): boolean;
  getStats(): { streams: number; totalChunks: number; totalSubscribers: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/stm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/stm/__tests__/StreamManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v442-stream-manager` 分支