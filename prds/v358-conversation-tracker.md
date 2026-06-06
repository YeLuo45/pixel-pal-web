# PRD: PixelPal V358 — Chatdev Conversation Tracker (Direction C Iteration 34)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-202 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v358-conversation-tracker |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 34 = Conversation Tracker**，来源：chatdev-design。

本迭代实现对话跟踪器：对话记录、消息轮次、对话摘要、对话统计。

## 功能规格

### 1. 对话跟踪器架构

```
ConversationRecorder → TurnTracker → ConversationSummarizer → ConversationReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/conv/ConversationTracker.ts` | 对话跟踪器 |
| `src/conv/__tests__/ConversationTracker.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Conversation {
  id: string;
  topic: string;
  participants: string[];
  turns: number;
  messages: string[];
}

class ConversationTracker {
  start(topic: string): string;
  addMessage(id: string, message: string): boolean;
  getTurns(id: string): number;
  getStats(): { conversations: number; totalTurns: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/conv/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/conv/__tests__/ConversationTracker.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v358-conversation-tracker` 分支