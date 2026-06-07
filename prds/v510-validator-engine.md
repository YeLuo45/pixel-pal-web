# PRD: PixelPal V510 — Claude Code Validator Engine (Direction A Iteration 65)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-241 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v510-validator-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 65 = Validator Engine**，来源：claude-code-design。

本迭代实现验证器引擎：字段验证（email/url/number/non-empty）、统计。

## 功能规格

### 1. 验证器引擎架构

```
ValidationAdder → Validator → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/vle/ValidatorEngine.ts` | 验证器引擎 |
| `src/vle/__tests__/ValidatorEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type ValidationResult = 'pending' | 'valid' | 'invalid';

class ValidatorEngine {
  add(field: string, value: string): string;
  validate(id: string): boolean;
  getStats(): { validations: number; totalAdded: number; totalValid: number; totalInvalid: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/vle/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/vle/__tests__/ValidatorEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v510-validator-engine` 分支