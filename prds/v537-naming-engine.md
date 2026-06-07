# PRD: PixelPal V537 — Chatdev Naming Engine (Direction C Iteration 70)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-090 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v537-naming-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 70 = Naming Engine**，来源：chatdev-design。

本迭代实现命名引擎：生成、分配、释放、统计（4 种风格：camel/snake/kebab/pascal）。

## 功能规格

### 1. 命名引擎架构

```
Namer → Allocator → Freer
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/nae/NamingEngine.ts` | 命名引擎 |
| `src/nae/__tests__/NamingEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type NamingStyle = 'camel' | 'snake' | 'kebab' | 'pascal';

class NamingEngine {
  generate(word: string, style: NamingStyle): string;
  allocate(id: string): boolean;
  free(id: string): boolean;
  getStats(): { names: number; totalGenerated: number; totalAllocated: number; totalFreed: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/nae/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/nae/__tests__/NamingEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v537-naming-engine` 分支