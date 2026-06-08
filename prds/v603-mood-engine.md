# PRD: PixelPal V603 — Generic-Agent Mood Engine (Direction D Iteration 83)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-051 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v603-mood-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 83 = Mood Engine**，来源：generic-agent-design。

本迭代实现心情引擎：添加、转换、统计（8 种 state：happy/sad/angry/calm/excited/neutral/tired/curious）。

## 功能规格

### 1. 心情引擎架构

```
MoodAdder → Shifter → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/moe/MoodEngine.ts` | 心情引擎 |
| `src/moe/__tests__/MoodEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type MoodState = 'happy' | 'sad' | 'angry' | 'calm' | 'excited' | 'neutral' | 'tired' | 'curious';

class MoodEngine {
  add(name: string, state?: MoodState, intensity?: number): string;
  shift(id: string, state: MoodState, intensity?: number): boolean;
  remove(id: string): boolean;
  getStats(): { entries: number; totalAdded: number; totalShifted: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/moe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/moe/__tests__/MoodEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v603-mood-engine` 分支