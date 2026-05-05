/**
 * Persona Command Parser — parses slash commands and @mentions for persona switching
 */

export interface ParseResult {
  type: 'switch' | 'help' | 'list' | 'unknown';
  personaId?: string;
  rawCommand?: string;
}

// Preset persona command mappings
const PRESET_COMMANDS: Record<string, string> = {
  '/friend': 'preset-friend',
  '/朋友': 'preset-friend',
  '/teacher': 'preset-teacher',
  '/老师': 'preset-teacher',
  '/coach': 'preset-coach',
  '/教练': 'preset-coach',
  '/lover': 'preset-lover',
  '/恋人': 'preset-lover',
  '/help': 'help',
  '/帮助': 'help',
  '/list': 'list',
  '/列表': 'list',
};

/**
 * Parse a user input string for persona commands.
 * Returns ParseResult if command detected, null otherwise.
 */
export function parsePersonaCommand(input: string): ParseResult | null {
  const trimmed = input.trim();

  if (!trimmed) return null;

  // Check slash commands
  for (const [cmd, personaId] of Object.entries(PRESET_COMMANDS)) {
    if (trimmed === cmd || trimmed.startsWith(cmd + ' ')) {
      if (personaId === 'help') {
        return { type: 'help' };
      }
      if (personaId === 'list') {
        return { type: 'list' };
      }
      return { type: 'switch', personaId };
    }
  }

  // Check @mention for fuzzy name matching
  const atMatch = trimmed.match(/^@(.+)$/);
  if (atMatch) {
    return { type: 'switch', rawCommand: atMatch[1] };
  }

  return null;
}

/**
 * Fuzzy match a persona by name from the personas array.
 * Returns the matched persona's id, or null if no match.
 */
export function fuzzyMatchPersona(personas: Array<{ id: string; name: string; avatar: string }>, name: string): string | null {
  const lowerName = name.toLowerCase();
  const matched = personas.find(p => p.name.toLowerCase().includes(lowerName));
  return matched ? matched.id : null;
}
