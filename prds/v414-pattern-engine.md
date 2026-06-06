# PRD: PixelPal V414 — Generic-Agent Pattern Engine (Direction D Iteration 45)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-422 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v414-pattern-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 45 = Pattern Engine**，来源：generic-agent-design。

本迭代实现模式引擎：模式定义、模式匹配、模式统计。

## 功能规格

### 1. 模式引擎架构

```
PatternDefiner → PatternMatcher → PatternReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pe5/PatternEngine.ts` | 模式引擎 |
| `src/pe5/__tests__/PatternEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Pattern {
  id: string;
  name: string;
  template: string;
  matches: number;
}

class PatternEngine {
  define(name: string, template: string): string;
  match(id: string): boolean;
  getStats(): { patterns: number; totalMatches: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pe5/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pe5/__tests__/PatternEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v414-pattern-engine` 分支