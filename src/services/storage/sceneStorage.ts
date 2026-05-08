import { TriggerRule } from '../../types/scene';

const RULES_KEY = 'scene_rules';

export async function getRules(): Promise<TriggerRule[]> {
  try {
    const raw = localStorage.getItem(RULES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as TriggerRule[];
  } catch {
    return [];
  }
}

export async function saveRules(rules: TriggerRule[]): Promise<void> {
  localStorage.setItem(RULES_KEY, JSON.stringify(rules));
}

export async function updateRule(id: string, updates: Partial<TriggerRule>): Promise<void> {
  const rules = await getRules();
  const idx = rules.findIndex(r => r.id === id);
  if (idx === -1) return;
  rules[idx] = { ...rules[idx], ...updates };
  await saveRules(rules);
}

export async function addRule(rule: TriggerRule): Promise<void> {
  const rules = await getRules();
  rules.push(rule);
  await saveRules(rules);
}

export async function deleteRule(id: string): Promise<void> {
  const rules = await getRules();
  const filtered = rules.filter(r => r.id !== id);
  await saveRules(filtered);
}
