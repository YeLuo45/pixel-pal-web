# PRD: PixelPal V309 — Generic-Agent Skill Matcher (Direction D Iteration 24)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-048 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v309-skill-matcher |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 24 = Skill Matcher**，来源：generic-agent-design。

本迭代实现技能匹配器：技能索引、能力匹配、上下文分析、匹配评分。

## 功能规格

### 1. 技能匹配器架构

```
SkillIndexer → CapabilityMatcher → ContextAnalyzer → ScoreRanker
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/match/SkillMatcher.ts` | 技能匹配器 |
| `src/match/__tests__/SkillMatcher.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface MatchableSkill {
  id: string;
  name: string;
  capabilities: string[];
  context: string[];
  score: number;
}

class SkillMatcher {
  index(skill: MatchableSkill): boolean;
  match(capability: string, context: string[]): MatchableSkill[];
  getStats(): { skills: number; matches: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/match/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/match/__tests__/SkillMatcher.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v309-skill-matcher` 分支