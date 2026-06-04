# PRD: PixelPal V215 — Chatdev Role Specialization v2 (Direction C Iteration 4/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-009 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v215-role-specialization-v2 |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 4/9 = Role Specialization v2**，来源：chatdev-design。

本迭代实现角色专业化v2：动态角色分配、技能匹配、协作评分、角色进化。

## 功能规格

### 1. 角色专业化v2架构

```
RoleRegistry → SkillMatcher → CollaborationScorer → RoleEvolver
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/roles/RoleSpecialist.ts` | 角色专业化v2 |
| `src/roles/__tests__/RoleSpecialist.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Agent {
  id: string;
  role: string;
  skills: string[];
  score: number;
}

class RoleSpecialist {
  register(agent: Agent): void;
  matchRole(agentId: string, task: string): string[];
  scoreCollaboration(agentIds: string[]): number;
  evolveRole(agentId: string): void;
  getSpecializations(agentId: string): string[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/roles/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/roles/__tests__/RoleSpecialist.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v215-role-specialization-v2` 分支