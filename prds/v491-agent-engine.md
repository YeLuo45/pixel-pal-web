# PRD: PixelPal V491 — Nanobot Agent Engine (Direction B Iteration 61)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-153 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v491-agent-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 61 = Agent Engine**，来源：nanobot-design。

本迭代实现分布式代理引擎：代理创建、任务分配、代理释放、上线/下线、统计。

## 功能规格

### 1. 代理引擎架构

```
AgentSpawner → TaskAssigner → AgentReleaser
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/age/AgentEngine.ts` | 代理引擎 |
| `src/age/__tests__/AgentEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type AgentState = 'idle' | 'busy' | 'offline';

class AgentEngine {
  spawn(name: string): string;
  assign(id: string, task: string): boolean;
  release(id: string): boolean;
  goOffline(id: string): boolean;
  goOnline(id: string): boolean;
  getStats(): { agents: number; totalSpawned: number; totalReleased: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/age/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/age/__tests__/AgentEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v491-agent-engine` 分支