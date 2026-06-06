# PRD: PixelPal V369 — Generic-Agent Skill Manager (Direction D Iteration 36)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-238 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v369-skill-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 36 = Skill Manager**，来源：generic-agent-design。

本迭代实现技能管理器：技能注册、技能执行、技能学习、技能统计。

## 功能规格

### 1. 技能管理器架构

```
SkillRegistrar → SkillExecutor → SkillLearner → SkillReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/sm/SkillManager.ts` | 技能管理器 |
| `src/sm/__tests__/SkillManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Skill {
  id: string;
  name: string;
  level: number;
  used: number;
  success: number;
}

class SkillManager {
  register(name: string, level: number): string;
  execute(id: string, success: boolean): boolean;
  learn(id: string, amount: number): boolean;
  getStats(): { skills: number; totalUses: number; avgLevel: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/sm/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/sm/__tests__/SkillManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v369-skill-manager` 分支