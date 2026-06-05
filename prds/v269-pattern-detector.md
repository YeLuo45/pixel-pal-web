# PRD: PixelPal V269 — Generic-Agent Pattern Detector (Direction D Iteration 16)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-109 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v269-pattern-detector |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction D iteration 16 = Pattern Detector**，来源：generic-agent-design。

本迭代实现模式检测器：模式定义、模式匹配、模式学习、模式评估。

## 功能规格

### 1. 模式检测器架构

```
PatternDefiner → PatternMatcher → PatternLearner → PatternEvaluator
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/pattern/PatternDetector.ts` | 模式检测器 |
| `src/pattern/__tests__/PatternDetector.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Pattern {
  id: string;
  name: string;
  regex: string;
  confidence: number;
}

interface PatternMatch {
  pattern: string;
  text: string;
  confidence: number;
}

class PatternDetector {
  registerPattern(pattern: Pattern): boolean;
  detect(text: string): PatternMatch[];
  learn(text: string, label: string): void;
  evaluate(patternId: string): number;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/pattern/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/pattern/__tests__/PatternDetector.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v269-pattern-detector` 分支