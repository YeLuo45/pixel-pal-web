# PRD: PixelPal V560 — Claude Code Normalizer Engine (Direction A Iteration 75)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-232 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v560-normalizer-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 75 = Normalizer Engine**，来源：claude-code-design。

本迭代实现归一化引擎：添加、归一化、统计（6 种操作：lowercase/uppercase/trim/collapse/strip/reverse）。

## 功能规格

### 1. 归一化引擎架构

```
NormalizeAdder → Normalizer → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/nre/NormalizerEngine.ts` | 归一化引擎 |
| `src/nre/__tests__/NormalizerEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type NormalizeOp = 'lowercase' | 'uppercase' | 'trim' | 'collapse' | 'strip' | 'reverse';

class NormalizerEngine {
  add(input: string, op: NormalizeOp): string;
  normalize(id: string, input: string): boolean;
  remove(id: string): boolean;
  getStats(): { normalizes: number; totalAdded: number; totalNormalized: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/nre/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/nre/__tests__/NormalizerEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v560-normalizer-engine` 分支