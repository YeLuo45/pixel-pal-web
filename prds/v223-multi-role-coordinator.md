# PRD: PixelPal V223 — Chatdev Multi-Role Coordinator v2 (Direction C Iteration 7/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-023 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v223-multi-role-coordinator |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 7/9 = Multi-Role Coordinator v2**，来源：chatdev-design。

本迭代实现多角色协调器v2：角色分配、消息路由、协调评分、冲突解决。

## 功能规格

### 1. 多角色协调器v2架构

```
RoleAssigner → MessageRouter → CoordinatorScorer → ConflictResolver
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/coordinator/MultiRoleCoordinator.ts` | 多角色协调器 |
| `src/coordinator/__tests__/MultiRoleCoordinator.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Participant {
  id: string;
  role: string;
  active: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  messages: number;
  status: 'active' | 'paused' | 'completed';
}

class MultiRoleCoordinator {
  addParticipant(participant: Participant): void;
  assignRole(participantId: string, role: string): boolean;
  startConversation(participants: string[]): string;
  routeMessage(convId: string, from: string, message: string): string[];
  resolveConflict(participantId1: string, participantId2: string): string | null;
  getCoordinationScore(convId: string): number;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/coordinator/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/coordinator/__tests__/MultiRoleCoordinator.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v223-multi-role-coordinator` 分支