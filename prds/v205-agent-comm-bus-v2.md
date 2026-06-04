# PRD: PixelPal V205 — Chatdev Agent Communication Bus v2 (Direction C Iteration 2/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260604-053 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v205-agent-comm-bus-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 2/9 = Agent Communication Bus v2**，来源：chatdev Agent Communication Bus v2。

本迭代实现多Agent通信总线v2：消息队列、事件驱动、订阅发布、优先级队列。

## 功能规格

### 1. Agent通信总线架构

```
Agent → Publisher → Message Queue → Router → Subscriber
                          ↓
                    Priority Queue
                          ↓
                    Dead Letter Queue
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/comm/AgentCommBus.ts` | Agent通信总线 |
| `src/comm/__tests__/AgentCommBus.test.ts` | 测试 |

### 3. 接口设计

```typescript
type MessagePriority = 'high' | 'normal' | 'low';
type MessageStatus = 'pending' | 'delivered' | 'failed';

interface AgentMessage {
  id: string;
  from: string;
  to: string | '*';
  topic: string;
  payload: unknown;
  priority: MessagePriority;
  timestamp: number;
  status: MessageStatus;
  retries: number;
}

interface Subscriber {
  agentId: string;
  topics: string[];
  callback: (msg: AgentMessage) => void;
}

class AgentCommBus {
  publish(msg: Omit<AgentMessage, 'id' | 'timestamp' | 'status' | 'retries'>): string;
  subscribe(subscriber: Subscriber): void;
  unsubscribe(agentId: string): void;
  getQueueSize(topic?: string): number;
  getMessages(agentId: string): AgentMessage[];
  retry(messageId: string): boolean;
  clear(agentId?: string): void;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/comm/__tests__/`

## 验收标准

- [ ] `npx vitest run src/comm --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v205-agent-comm-bus-v2` 分支