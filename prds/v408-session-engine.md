# PRD: PixelPal V408 — Chatdev Session Engine (Direction C Iteration 44)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-380 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v408-session-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 44 = Session Engine**，来源：chatdev-design。

本迭代实现会话引擎：会话创建、消息发送、会话统计。

## 功能规格

### 1. 会话引擎架构

```
SessionCreator → MessageDispatcher → SessionReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/se4/SessionEngine.ts` | 会话引擎 |
| `src/se4/__tests__/SessionEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Session {
  id: string;
  user: string;
  messages: number;
  active: boolean;
}

class SessionEngine {
  create(user: string): string;
  send(id: string): boolean;
  end(id: string): boolean;
  getStats(): { sessions: number; totalMessages: number; active: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/se4/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/se4/__tests__/SessionEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v408-session-engine` 分支