# PRD: PixelPal V278 — Chatdev Plugin Registry (Direction C Iteration 18)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260605-137 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v278-plugin-registry |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 18 = Plugin Registry**，来源：chatdev-design。

本迭代实现插件注册表：插件注册、插件查询、插件启用、插件版本。

## 功能规格

### 1. 插件注册表架构

```
PluginRegistrar → PluginQueryEngine → PluginActivator → PluginVersioner
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/plugin/PluginRegistry.ts` | 插件注册表 |
| `src/plugin/__tests__/PluginRegistry.test.ts` | 测试 |

### 3. 接口设计

```typescript
interface Plugin {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  dependencies: string[];
}

class PluginRegistry {
  register(plugin: Omit<Plugin, 'enabled'>): boolean;
  enable(id: string): boolean;
  disable(id: string): boolean;
  find(id: string): Plugin | null;
  getByName(name: string): Plugin | null;
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/plugin/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/plugin/__tests__/PluginRegistry.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v278-plugin-registry` 分支