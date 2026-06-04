# PRD: PixelPal V236 — Claude Code Refactor Engine (Direction A Iteration)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-038 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v236-refactor-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 10 (final) = Refactor Engine**，来源：claude-code-design。

本迭代实现重构引擎：模式识别、自动重构、风险评估、重构历史。

## 功能规格

### 1. 重构引擎架构

```
PatternRecognizer → AutoRefactor → RiskAssessor → RefactorHistory
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/refactor/RefactorEngine.ts` | 重构引擎 |
| `src/refactor/__tests__/RefactorEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface RefactorPattern {
  name: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
}

interface RefactorRecord {
  id: string;
  pattern: string;
  timestamp: number;
  success: boolean;
}

class RefactorEngine {
  addPattern(pattern: RefactorPattern): void;
  recognize(code: string): RefactorPattern[];
  refactor(code: string, pattern: string): string;
  assessRisk(pattern: string): 'low' | 'medium' | 'high';
  getHistory(): RefactorRecord[];
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/refactor/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/refactor/__tests__/RefactorEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v236-refactor-engine` 分支