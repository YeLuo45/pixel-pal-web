# PRD: PixelPal V293 — Chatdev Conversation Buffer (Direction C Iteration 21)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-013 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v293-conversation-buffer |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 21 = Conversation Buffer**，来源：chatdev-design。

本迭代实现对话缓冲区：消息缓存、消息刷新、消息检索、消息统计。

## 功能规格

### 1. 对话缓冲区架构

```
MessageBuffer → MessageFlusher → MessageRetriever → MessageCounter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/buffer/ConversationBuffer.ts` | 对话缓冲区 |
| `src/buffer/__tests__/ConversationBuffer.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface BufferMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

class ConversationBuffer {
  push(sender: string, content: string): string;
  flush(): BufferMessage[];
  retrieve(since: number): BufferMessage[];
  getStats(): { total: number; size: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/buffer/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/buffer/__tests__/ConversationBuffer.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v293-conversation-buffer` 分支