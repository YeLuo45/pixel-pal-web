# PRD: PixelPal V533 — Generic-Agent Perception Engine (Direction D Iteration 69)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-086 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v533-perception-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 69 = Perception Engine**，来源：generic-agent-design。

本迭代实现感知引擎：感官输入、感知、遗忘、统计（5 种感官：visual/audio/touch/taste/smell）。

## 功能规格

### 1. 感知引擎架构

```
Senser → Perceiver → Forgetter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pce/PerceptionEngine.ts` | 感知引擎 |
| `src/pce/__tests__/PerceptionEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type SenseType = 'visual' | 'audio' | 'touch' | 'taste' | 'smell';

class PerceptionEngine {
  sense(type: SenseType, stimulus: string, intensity: number): string;
  perceive(id: string): boolean;
  forget(id: string): boolean;
  getStats(): { sensations: number; totalSensed: number; totalPerceived: number; totalForgotten: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pce/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pce/__tests__/PerceptionEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v533-perception-engine` 分支