# PRD: PixelPal V195 — Chatdev Role Communication Bus (Direction C Iteration 3/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260604-047 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v195-role-comm-bus |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 3/9 = Role Communication Bus**，来源：chatdev Multi-Agent Communication。

本迭代实现角色通信总线：Agent间消息传递、角色间通信协议、消息队列管理。

## 功能规格

### 1. 通信总线架构

```
Agent A → MessageBus → Agent B
            ↓
         Agent C
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/agents/RoleCommBus.ts` | 角色通信总线 |
| `src/agents/__tests__/RoleCommBus.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'task' | 'result' | 'review' | 'error' | 'notification';
  payload: unknown;
  timestamp: number;
  priority?: 'low' | 'normal' | 'high';
}

interface Subscription {
  agentId: string;
  messageTypes: AgentMessage['type'][];
  callback: (message: AgentMessage) => void;
}

class RoleCommBus {
  publish(message: Omit<AgentMessage, 'id' | 'timestamp'>): void
  subscribe(sub: Subscription): () => void
  send(from: string, to: string, type: AgentMessage['type'], payload: unknown): void
  getHistory(from?: string, to?: string, limit?: number): AgentMessage[]
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/agents/__tests__/`

## 验收标准

- [ ] `npx vitest run src/agents --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v195-role-comm-bus` 分支