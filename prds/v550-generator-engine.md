# PRD: PixelPal V550 — Claude Code Generator Engine (Direction A Iteration 73)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-173 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v550-generator-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 73 = Generator Engine**，来源：claude-code-design。

本迭代实现生成器引擎：生成、验证、统计（5 种类型：uuid/token/password/code/slug）。

## 功能规格

### 1. 生成器引擎架构

```
Generator → Validator → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/gre/GeneratorEngine.ts` | 生成器引擎 |
| `src/gre/__tests__/GeneratorEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type GenType = 'uuid' | 'token' | 'password' | 'code' | 'slug';

class GeneratorEngine {
  generate(type: GenType, length: number): string;
  validate(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { results: number; totalGenerated: number; totalValidated: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/gre/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/gre/__tests__/GeneratorEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v550-generator-engine` 分支