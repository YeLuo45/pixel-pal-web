# PRD: PixelPal V263 — Chatdev Role Manager v2 (Direction C Iteration 15)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-100 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v263-role-manager-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 15 = Role Manager v2**，来源：chatdev-design。

本迭代实现角色管理器v2：角色生命周期、角色同步、角色版本、角色分析。

## 功能规格

### 1. 角色管理器v2架构

```
RoleLifecycle → RoleSync → RoleVersioner → RoleAnalyzer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/role/RoleManagerV2.ts` | 角色管理器v2 |
| `src/role/__tests__/RoleManagerV2.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface RoleSpec {
  id: string;
  name: string;
  capabilities: string[];
  version: number;
  status: 'active' | 'inactive' | 'deprecated';
}

class RoleManagerV2 {
  createRole(spec: Omit<RoleSpec, 'id' | 'version'>): string;
  activate(id: string): boolean;
  deprecate(id: string): boolean;
  sync(id: string, capabilities: string[]): boolean;
  getStats(): { total: number; active: number; deprecated: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/role/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/role/__tests__/RoleManagerV2.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v263-role-manager-v2` 分支