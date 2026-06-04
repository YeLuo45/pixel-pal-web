# PRD: PixelPal V188 — Self-Crystallization Engine (Direction D Iteration 1/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260604-038 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v188-self-crystallization-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D = Self-Crystallization Engine**，来源：generic-agent Self-Evolution + claude-code Budget Mode。

本迭代 (1/9) 实现技能结晶核心：从交互痕迹中提取模式，生成可执行技能规则。

## 功能规格

### 1. 技能结晶流程

```
交互痕迹 → 模式分析 → 结晶判定 → 技能规则 → 存储/淘汰
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/evolution/SkillCrystallizer.ts` | 技能结晶引擎：模式提取、规则生成、质量评估 |
| `src/evolution/__tests__/SkillCrystallizer.test.ts` | 结晶引擎测试 |

### 3. 接口设计

```typescript
interface InteractionTrace {
  id: string;
  timestamp: number;
  type: 'task' | 'query' | 'response' | 'feedback';
  input: string;
  output: string;
  success: boolean;
  latency?: number;
}

interface CrystallizedSkill {
  skillId: string;
  trigger: string;        // 触发条件
  action: string;         // 执行动作
  successRate: number;    // 历史成功率
  usageCount: number;
  confidence: number;     // 结晶置信度 0-1
  createdAt: number;
  expiresAt?: number;
}

class SkillCrystallizer {
  // 从痕迹中提取模式
  async extractPatterns(traces: InteractionTrace[]): Promise<Pattern[]>

  // 判定是否结晶
  shouldCrystallize(pattern: Pattern, threshold?: number): boolean

  // 生成技能规则
  async crystallize(pattern: Pattern): Promise<CrystallizedSkill>

  // 评估技能质量
  evaluateSkill(skill: CrystallizedSkill): SkillQuality

  // 遗忘低质量技能
  async pruneLowQuality(minConfidence: number): Promise<number>
}
```

### 4. generic-agent Self-Evolution 映射

- L3 程序记忆 → 结晶技能存储
- Self-Evolution → 技能质量迭代
- 技能结晶 → 行为模式固化

### 5. Budget Mode 映射

- 调用次数限制 → 结晶阈值
- 速率限制 → 技能过期策略
- 配额警告 → 低置信度警告

## 技术约束

- 零新增依赖
- 复用 `src/evolution/` 下已有模块
- 存储在 IndexedDB（复用 DreamMemoryStore）

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 使用 vi.mock 模拟依赖
- 测试位置：`src/evolution/__tests__/`

## 验收标准

- [x] `npx vitest run src/evolution --config vitest.config.test.ts` 全部通过
- [x] 覆盖率报告 ≥ 99%
- [x] `pnpm run build` 成功
- [x] Git commit 到 `v188-self-crystallization-engine` 分支
- [x] PR 创建到 master

**Acceptance: accepted** (P-20260604-038)