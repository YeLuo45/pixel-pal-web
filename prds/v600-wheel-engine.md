# PRD: PixelPal V600 — Claude Code Wheel Engine (Direction A Iteration 83)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260608-046 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v600-wheel-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction A iteration 83 = Wheel Engine**，来源：claude-code-design。

本迭代实现轮盘引擎：添加选项、旋转、统计（4 种 type：number/string/boolean/object）。

## 功能规格

### 1. 轮盘引擎架构

```
OptionAdder → Spinner → Stats
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/wle/WheelEngine.ts` | 轮盘引擎 |
| `src/wle/__tests__/WheelEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type WheelType = 'number' | 'string' | 'boolean' | 'object';

class WheelEngine {
  addOption(label: string, type: WheelType, weight?: number): string;
  spin(id: string): boolean;
  remove(id: string): boolean;
  getStats(): { options: number; totalAdded: number; totalSpun: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/wle/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/wle/__tests__/WheelEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v600-wheel-engine` 分支