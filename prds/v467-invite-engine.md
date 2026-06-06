# PRD: PixelPal V467 — Chatdev Invite Engine (Direction C Iteration 56)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-077 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v467-invite-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 56 = Invite Engine**，来源：chatdev-design。

本迭代实现邀请引擎：邀请发送、邀请接受、邀请拒绝、邀请过期、统计。

## 功能规格

### 1. 邀请引擎架构

```
Inviter → Accepter → Decliner
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ine3/InviteEngine.ts` | 邀请引擎 |
| `src/ine3/__tests__/InviteEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired';

class InviteEngine {
  invite(from: string, to: string, room: string): string;
  accept(id: string): boolean;
  decline(id: string): boolean;
  expire(id: string): boolean;
  getStats(): { invites: number; totalAccepted: number; totalDeclined: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ine3/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ine3/__tests__/InviteEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v467-invite-engine` 分支