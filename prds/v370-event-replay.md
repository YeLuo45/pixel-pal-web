# PRD: PixelPal V370 — Thunderbolt Event Replay (Direction E Iteration 36)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-241 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v370-event-replay |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 36 = Event Replay**，来源：thunderbolt-design。

本迭代实现事件回放：事件记录、事件回放、事件检查点、事件统计。

## 功能规格

### 1. 事件回放架构

```
EventRecorder → EventReplayer → EventCheckpointer → EventReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/er/EventReplay.ts` | 事件回放 |
| `src/er/__tests__/EventReplay.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface ReplayEvent {
  id: string;
  type: string;
  data: unknown;
  replayed: boolean;
}

class EventReplay {
  record(type: string, data: unknown): string;
  replay(id: string): boolean;
  checkpoint(): string;
  getStats(): { events: number; replayed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/er/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/er/__tests__/EventReplay.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v370-event-replay` 分支