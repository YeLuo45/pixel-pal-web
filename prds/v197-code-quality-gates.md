# PRD: PixelPal V197 — Claude Code Code Quality Gates (Direction A Iteration 3/9)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260604-048 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v197-code-quality-gates |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 3/9 = Code Quality Gates**，来源：claude-code Code Quality Gates。

本迭代实现代码质量门禁：自动化检查、lint规则、质量门槛。

## 功能规格

### 1. 质量门禁架构

```
代码提交 → 检查项 → 质量门槛 → 通过/拒绝
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/quality/CodeQualityGates.ts` | 质量门禁引擎 |
| `src/quality/__tests__/CodeQualityGates.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface QualityCheck {
  name: string;
  passed: boolean;
  score: number;
  message?: string;
}

interface QualityGate {
  name: string;
  threshold: number;
  weight: number;
}

class CodeQualityGates {
  // 运行质量检查
  async runChecks(code: string): Promise<QualityCheck[]>

  // 评估是否通过门槛
  evaluate(checks: QualityCheck[], gates: QualityGate[]): {
    passed: boolean;
    overallScore: number;
    failedGates: string[];
  }

  // 设置门槛
  setGate(gate: QualityGate): void

  // 获取当前门槛
  getGates(): QualityGate[]
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/quality/__tests__/`

## 验收标准

- [ ] `npx vitest run src/quality --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v197-code-quality-gates` 分支