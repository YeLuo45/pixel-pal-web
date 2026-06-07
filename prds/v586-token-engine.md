# PRD: PixelPal V586 — Nanobot Token Engine (Direction B Iteration 80)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-341 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v586-token-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction B iteration 80 = Token Engine**，来源：nanobot-design。

本迭代实现令牌引擎：签发、验证、撤销、过期、统计（3 种状态：valid/expired/revoked）。

## 功能规格

### 1. 令牌引擎架构

```
TokenIssuer → Verifier → Revoker → Expirer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/tke/TokenEngine.ts` | 令牌引擎 |
| `src/tke/__tests__/TokenEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type TokenState = 'valid' | 'expired' | 'revoked';

class TokenEngine {
  issue(subject: string, expiresIn: number): string;
  verify(id: string): boolean;
  revoke(id: string): boolean;
  expire(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { tokens: number; totalIssued: number; totalVerified: number; totalRevoked: number; totalExpired: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/tke/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/tke/__tests__/TokenEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v586-token-engine` 分支