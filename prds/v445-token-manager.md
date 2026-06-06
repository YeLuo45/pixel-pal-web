# PRD: PixelPal V445 — Thunderbolt Token Manager (Direction E Iteration 51)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260606-525 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v445-token-manager |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction E iteration 51 = Token Manager**，来源：thunderbolt-design。

本迭代实现令牌管理器：令牌生成、令牌验证、令牌统计。

## 功能规格

### 1. 令牌管理器架构

```
TokenIssuer → TokenValidator → TokenReporter
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/tke/TokenManager.ts` | 令牌管理器 |
| `src/tke/__tests__/TokenManager.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Token {
  id: string;
  value: string;
  scope: string;
  valid: boolean;
  created: number;
  expires: number;
}

class TokenManager {
  issue(scope: string, expires: number): string;
  validate(token: string): boolean;
  revoke(token: string): boolean;
  getStats(): { tokens: number; valid: number; revoked: number; expired: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/tke/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/tke/__tests__/TokenManager.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v445-token-manager` 分支