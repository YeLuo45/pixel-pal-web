# PRD: PixelPal V210 — Chatdev Multi-Agent Studio v2 (Direction C Iteration 3/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260604-062 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v210-multi-agent-studio-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 3/9 = Multi-Agent Studio v2**，来源：chatdev-design。

本迭代实现多Agent工作室v2：Agent协作空间、消息总线、任务分配、状态追踪。

## 功能规格

### 1. 多Agent工作室v2架构

```
AgentStudio → WorkspaceManager + MessageBus + TaskScheduler + StateTracker
                    ↓
              AgentCanvas (React)
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/studio/AgentStudio.ts` | 多Agent工作室 |
| `src/studio/__tests__/AgentStudio.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'busy' | 'offline';
}

interface Task {
  id: string;
  description: string;
  assignee?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: number;
}

interface Message {
  from: string;
  to: string;
  content: string;
  timestamp: number;
}

class AgentStudio {
  createAgent(name: string, role: string): Agent;
  assignTask(agentId: string, task: Task): boolean;
  sendMessage(from: string, to: string, content: string): void;
  getAgentTasks(agentId: string): Task[];
  getMessages(agentId: string): Message[];
  getWorkspaceStats(): { agentCount: number; taskCount: number; messageCount: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/studio/__tests__/`

## 验收标准

- [ ] `npx vitest run src/studio --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v210-multi-agent-studio-v2` 分支