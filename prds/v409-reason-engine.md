# PRD: PixelPal V409 — Generic-Agent Reason Engine (Direction D Iteration 44)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-381 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v409-reason-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 44 = Reason Engine**，来源：generic-agent-design。

本迭代实现推理引擎：推理注册、推理执行、推理统计。

## 功能规格

### 1. 推理引擎架构

```
ReasonRegistrar → ReasonExecutor → ReasonReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/re/ReasonEngine.ts` | 推理引擎 |
| `src/re/__tests__/ReasonEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Reason {
  id: string;
  name: string;
  premises: string[];
  conclusion: string;
  valid: boolean;
}

class ReasonEngine {
  register(name: string, premises: string[], conclusion: string): string;
  validate(id: string, allPremisesTrue: boolean): boolean;
  getStats(): { reasons: number; totalValid: number; totalInvalid: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/re/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/re/__tests__/ReasonEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v409-reason-engine` 分支