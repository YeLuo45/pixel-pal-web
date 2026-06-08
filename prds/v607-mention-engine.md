# PRD: PixelPal V607 — Chatdev Mention Engine (Direction C Iteration 84)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-057 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v607-mention-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 84 = Mention Engine**，来源：chatdev-design。

本迭代实现提及引擎：添加、提及、统计（5 种 context：comment/post/reply/thread/bio）。

## 功能规格

### 1. 提及引擎架构

```
MentionAdder → Menter → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/mne2/MentionEngine.ts` | 提及引擎 |
| `src/mne2/__tests__/MentionEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type MentionContext = 'comment' | 'post' | 'reply' | 'thread' | 'bio';

class MentionEngine {
  add(user: string, context?: MentionContext): string;
  mention(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { mentions: number; totalAdded: number; totalMentioned: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/mne2/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/mne2/__tests__/MentionEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v607-mention-engine` 分支