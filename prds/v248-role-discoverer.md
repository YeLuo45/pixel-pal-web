# PRD: PixelPal V248 — Chatdev Role Discoverer (Direction C Iteration 12)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-064 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v248-role-discoverer |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 12 = Role Discoverer**，来源：chatdev-design。

本迭代实现角色发现器：角色注册、角色匹配、角色推荐、角色分析。

## 功能规格

### 1. 角色发现器架构

```
RoleRegistry → RoleMatcher → RoleRecommender → RoleAnalyzer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/roles/RoleDiscoverer.ts` | 角色发现器 |
| `src/roles/__tests__/RoleDiscoverer.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Role {
  name: string;
  skills: string[];
  description: string;
}

class RoleDiscoverer {
  registerRole(role: Role): void;
  matchBySkill(skill: string): Role[];
  recommend(task: string): Role[];
  analyze(role: Role): { skillCount: number; complexity: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/roles/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/roles/__tests__/RoleDiscoverer.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v248-role-discoverer` 分支