# PRD: PixelPal V253 — Chatdev Permission Manager (Direction C Iteration 13)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-078 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v253-permission-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 13 = Permission Manager**，来源：chatdev-design。

本迭代实现权限管理器：角色权限、权限检查、权限继承、权限审计。

## 功能规格

### 1. 权限管理器架构

```
RoleStore → PermissionChecker → PermissionInheritance → PermissionAuditor
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/perm/PermissionManager.ts` | 权限管理器 |
| `src/perm/__tests__/PermissionManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Permission {
  resource: string;
  action: string;
}

interface Role {
  name: string;
  permissions: Permission[];
  parent?: string;
}

class PermissionManager {
  addRole(role: Role): void;
  grant(role: string, permission: Permission): void;
  revoke(role: string, permission: Permission): void;
  check(role: string, permission: Permission): boolean;
  getAuditLog(): { role: string; permission: Permission; granted: boolean; timestamp: number }[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/perm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/perm/__tests__/PermissionManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v253-permission-manager` 分支