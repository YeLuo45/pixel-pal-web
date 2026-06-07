# PRD: PixelPal V525 — Claude Code Hash Engine (Direction A Iteration 68)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-078 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v525-hash-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 68 = Hash Engine**，来源：claude-code-design。

本迭代实现哈希引擎：哈希计算、验证、重算、统计（4 种算法：md5/sha1/sha256/sha512）。

## 功能规格

### 1. 哈希引擎架构

```
Hasher → Verifier → Recomputer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/hse/HashEngine.ts` | 哈希引擎 |
| `src/hse/__tests__/HashEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type HashAlgo = 'md5' | 'sha1' | 'sha256' | 'sha512';

class HashEngine {
  hash(input: string, algo: HashAlgo): string;
  verify(id: string, input: string): boolean;
  recompute(id: string, input: string): boolean;
  getStats(): { hashes: number; totalHashed: number; totalVerified: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/hse/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/hse/__tests__/HashEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v525-hash-engine` 分支