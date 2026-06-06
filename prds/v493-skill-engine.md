# PRD: PixelPal V493 — Generic-Agent Skill Engine (Direction D Iteration 61)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-155 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v493-skill-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 61 = Skill Engine**，来源：generic-agent-design。

本迭代实现技能引擎：技能添加、技能升级、技能使用、统计。

## 功能规格

### 1. 技能引擎架构

```
SkillAdder → SkillUpgrader → SkillUser
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/ske/SkillEngine.ts` | 技能引擎 |
| `src/ske/__tests__/SkillEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type SkillLevel = 'novice' | 'beginner' | 'intermediate' | 'advanced' | 'expert';

class SkillEngine {
  add(name: string, level: SkillLevel, proficiency: number): string;
  upgrade(id: string, amount: number): boolean;
  use(id: string): boolean;
  getStats(): { skills: number; totalAdded: number; totalUpgrades: number; totalUsed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/ske/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/ske/__tests__/SkillEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v493-skill-engine` 分支