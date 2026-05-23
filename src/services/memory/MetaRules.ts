/**
 * V131 L0 MetaRules — hard constraints always in context
 * These rules are never filtered, never ignored, always loaded first.
 */

export const META_RULES = [
  '只建议不替代用户做决定',
  '每项任务必须有独立完成判据',
  '禁止凭记忆执行未确认的操作',
  '跨 Persona 知识共享需用户授权',
] as const;

export type MetaRule = (typeof META_RULES)[number];