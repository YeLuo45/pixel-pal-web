# PRD: PixelPal V323 — Chatdev Role Coordinator (Direction C Iteration 27)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-093 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v323-role-coordinator |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 27 = Role Coordinator**，来源：chatdev-design。

本迭代实现角色协调器：角色注册、角色分配、角色协作、角色退出。

## 功能规格

### 1. 角色协调器架构

```
RoleRegistrar → RoleAssigner → RoleCollaborator → RoleExiter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/role/RoleCoordinator.ts` | 角色协调器 |
| `src/role/__tests__/RoleCoordinator.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Role {
  id: string;
  name: string;
  capabilities: string[];
  assigned: string | null;
}

class RoleCoordinator {
  register(name: string, capabilities: string[]): string;
  assign(roleId: string, member: string): boolean;
  release(roleId: string): boolean;
  getStats(): { roles: number; assigned: number; available: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/role/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/role/__tests__/RoleCoordinator.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v323-role-coordinator` 分支