# PRD: PixelPal V298 — Chatdev Skill Library (Direction C Iteration 22)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-021 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v298-skill-library |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 22 = Skill Library**，来源：chatdev-design。

本迭代实现技能库：技能注册、技能调用、技能更新、技能统计。

## 功能规格

### 1. 技能库架构

```
SkillRegistrar → SkillInvoker → SkillUpdater → SkillStatistics
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/skill/SkillLibrary.ts` | 技能库 |
| `src/skill/__tests__/SkillLibrary.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  handler: (...args: unknown[]) => unknown;
}

class SkillLibrary {
  register(skill: Skill): boolean;
  invoke(id: string, ...args: unknown[]): unknown;
  update(id: string, handler: Skill['handler']): boolean;
  getStats(): { skills: number; invocations: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/skill/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/skill/__tests__/SkillLibrary.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v298-skill-library` 分支