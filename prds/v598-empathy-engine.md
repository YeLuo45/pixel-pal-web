# PRD: PixelPal V598 — Generic-Agent Empathy Engine (Direction D Iteration 82)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-035 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v598-empathy-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 82 = Empathy Engine**，来源：generic-agent-design。

本迭代实现共情引擎：添加、响应、统计（5 种 tone：warm/caring/supportive/compassionate/neutral）。

## 功能规格

### 1. 共情引擎架构

```
EmpathyAdder → Responder → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/eme/EmpathyEngine.ts` | 共情引擎 |
| `src/eme/__tests__/EmpathyEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type EmpathyTone = 'warm' | 'caring' | 'supportive' | 'compassionate' | 'neutral';

class EmpathyEngine {
  add(trigger: string, tone: EmpathyTone, response: string): string;
  respond(id: string): string | null;
  remove(id: string): boolean;
  getStats(): { entries: number; totalAdded: number; totalResponded: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/eme/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/eme/__tests__/EmpathyEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v598-empathy-engine` 分支