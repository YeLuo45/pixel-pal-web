# PRD: PixelPal V505 — Claude Code Composer Engine (Direction A Iteration 64)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-206 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v505-composer-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 64 = Composer Engine**，来源：claude-code-design。

本迭代实现组合引擎：组合、构建、统计（3 种组合类型：sequence/parallel/conditional）。

## 功能规格

### 1. 组合引擎架构

```
Composer → Builder → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/cpe/ComposerEngine.ts` | 组合引擎 |
| `src/cpe/__tests__/ComposerEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type CompositionType = 'sequence' | 'parallel' | 'conditional';

class ComposerEngine {
  compose(name: string, type: CompositionType, parts: number): string;
  build(id: string): boolean;
  getStats(): { compositions: number; totalComposed: number; totalBuilt: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/cpe/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/cpe/__tests__/ComposerEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v505-composer-engine` 分支