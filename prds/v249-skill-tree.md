# PRD: PixelPal V249 — Generic-Agent Skill Tree (Direction D Iteration 12)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-074 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v249-skill-tree |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 12 = Skill Tree**，来源：generic-agent-design。

本迭代实现技能树：技能节点、技能解锁、技能依赖、技能升级。

## 功能规格

### 1. 技能树架构

```
SkillNodeRegistry → UnlockManager → DependencyResolver → UpgradeEngine
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/skills/SkillTree.ts` | 技能树 |
| `src/skills/__tests__/SkillTree.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface SkillNode {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  dependencies: string[];
}

class SkillTree {
  addSkill(skill: SkillNode): void;
  unlock(id: string): boolean;
  upgrade(id: string): boolean;
  isUnlocked(id: string): boolean;
  getPrerequisites(id: string): string[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/skills/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/skills/__tests__/SkillTree.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v249-skill-tree` 分支