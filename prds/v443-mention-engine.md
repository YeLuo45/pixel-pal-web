# PRD: PixelPal V443 — Chatdev Mention Engine (Direction C Iteration 51)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-521 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v443-mention-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 51 = Mention Engine**，来源：chatdev-design。

本迭代实现提及引擎：提及注册、提及通知、提及统计。

## 功能规格

### 1. 提及引擎架构

```
MentionRegistrar → MentionNotifier → MentionReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mne/MentionEngine.ts` | 提及引擎 |
| `src/mne/__tests__/MentionEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Mention {
  id: string;
  from: string;
  to: string;
  message: string;
  read: boolean;
  created: number;
}

class MentionEngine {
  mention(from: string, to: string, message: string): string;
  read(id: string): boolean;
  unread(id: string): boolean;
  getByUser(user: string): Mention[];
  getStats(): { mentions: number; read: number; unread: number; totalMessages: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mne/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/mne/__tests__/MentionEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v443-mention-engine` 分支