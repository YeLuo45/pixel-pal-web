/**
 * Persona Prompt Generator — V23
 *
 * Generates persona-specific system prompts based on the persona's voice/tone.
 * This is prepended to AI chat calls to ensure the AI responds in the
 * intended persona voice (warm, rational, humorous, serious).
 */

import type { Persona } from './personaStorage';

const VOICE_INSTRUCTIONS: Record<Persona['voice'], string> = {
  warm: '多用鼓励性语言，适当使用 emoji，保持温暖友好的氛围',
  rational: '结构化输出，逻辑清晰，避免无关情绪化表达',
  humorous: '轻松幽默的语气，可以适当调侃，但不失专业',
  serious: '严谨正式，简洁直接，避免废话和 emoji',
};

/**
 * Generate a persona-specific system prompt string.
 * Template: 你是一个${persona.bio}。\n语气要求：${voiceInstructions[persona.voice]}
 */
export function getPersonaSystemPrompt(persona: Persona): string {
  return `你是一个${persona.bio}。\n语气要求：${VOICE_INSTRUCTIONS[persona.voice]}`;
}
