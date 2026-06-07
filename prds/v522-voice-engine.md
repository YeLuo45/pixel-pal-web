# PRD: PixelPal V522 — Chatdev Voice Engine (Direction C Iteration 67)

## 基本信息

| 字段 | 内容 |
|------|------|
| 提案ID | P-20260607-273 |
| 项目ID | PRJ-20260420-002 |
| 项目名 | pixel-pal-web |
| 仓库 | https://github.com/YeLuo45/pixel-pal-web |
| 开发分支 | v522-voice-engine |
| 部署分支 | gh-pages |
| 访问链接 | https://yeluo45.github.io/pixel-pal-web/ |

## 迭代目标

**Direction C iteration 67 = Voice Engine**，来源：chatdev-design。

本迭代实现语音引擎：语音消息、静音、收听、统计（3 种模式：loud/normal/whisper）。

## 功能规格

### 1. 语音引擎架构

```
VoiceSpeaker → VoiceMuter → VoiceListener
```

### 2. 核心模块

| 文件 | 职责 |
|------|------|
| `src/vce/VoiceEngine.ts` | 语音引擎 |
| `src/vce/__tests__/VoiceEngine.test.ts` | 测试 |

### 3. 接口设计

```typescript
type VoiceMode = 'loud' | 'normal' | 'whisper';

class VoiceEngine {
  speak(speaker: string, text: string, mode: VoiceMode): string;
  mute(id: string): boolean;
  listen(id: string): boolean;
  getStats(): { messages: number; totalSpoken: number; totalMuted: number; totalListened: number };
}
```

## 测试要求

- 覆盖率 ≥ 99%
- 通过率 100%
- 测试位置：`src/vce/__tests__/`

## 验收标准

- [ ] `npx vitest run "src/vce/__tests__/VoiceEngine.test.ts" --config vitest.config.test.ts` 全部通过
- [ ] 覆盖率报告 ≥ 99%
- [ ] `pnpm run build` 成功
- [ ] Git commit 到 `v522-voice-engine` 分支