/**
 * Persona Storage — localStorage persistence for personas
 * Storage keys:
 *   pixelpal_personas — all personas array
 *   pixelpal_active_persona_id — current active persona ID
 */

export interface Persona {
  id: string;
  name: string;
  avatar: string;        // emoji
  bio: string;            // short description
  voice: 'warm' | 'rational' | 'humorous' | 'serious';
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

const PERSONAS_KEY = 'pixelpal_personas';
const ACTIVE_KEY = 'pixelpal_active_persona_id';

// Default preset personas
const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'preset-friend',
    name: '朋友',
    avatar: '😊',
    bio: '温暖友善的朋友，随时陪伴你',
    voice: 'warm',
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'preset-teacher',
    name: '老师',
    avatar: '📚',
    bio: '耐心的老师，帮你解答问题',
    voice: 'rational',
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'preset-coach',
    name: '教练',
    avatar: '💪',
    bio: '激励型教练，帮你达成目标',
    voice: 'humorous',
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'preset-lover',
    name: '恋人',
    avatar: '💕',
    bio: '浪漫贴心的伴侣，情感支持',
    voice: 'warm',
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export function getAllPersonas(): Persona[] {
  try {
    const data = localStorage.getItem(PERSONAS_KEY);
    if (!data) {
      // First time: initialize with defaults
      saveAllPersonas(DEFAULT_PERSONAS);
      setActivePersonaId(DEFAULT_PERSONAS[0].id);
      return DEFAULT_PERSONAS;
    }
    return JSON.parse(data) as Persona[];
  } catch {
    return DEFAULT_PERSONAS;
  }
}

export function saveAllPersonas(personas: Persona[]): void {
  localStorage.setItem(PERSONAS_KEY, JSON.stringify(personas));
}

export function getActivePersonaId(): string {
  return localStorage.getItem(ACTIVE_KEY) || 'preset-friend';
}

export function setActivePersonaId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

export function getActivePersona(): Persona {
  const personas = getAllPersonas();
  const activeId = getActivePersonaId();
  return personas.find(p => p.id === activeId) || personas[0];
}

export function createPersona(data: Omit<Persona, 'id' | 'isDefault' | 'createdAt' | 'updatedAt'>): Persona {
  const persona: Persona = {
    ...data,
    id: `persona-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    isDefault: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const personas = getAllPersonas();
  personas.push(persona);
  saveAllPersonas(personas);
  return persona;
}

export function updatePersona(id: string, updates: Partial<Omit<Persona, 'id' | 'isDefault' | 'createdAt'>>): Persona | null {
  const personas = getAllPersonas();
  const idx = personas.findIndex(p => p.id === id);
  if (idx === -1) return null;
  // Cannot modify preset personas
  if (personas[idx].isDefault) return null;
  personas[idx] = { ...personas[idx], ...updates, updatedAt: Date.now() };
  saveAllPersonas(personas);
  return personas[idx];
}

export function deletePersona(id: string): boolean {
  const personas = getAllPersonas();
  const persona = personas.find(p => p.id === id);
  if (!persona || persona.isDefault) return false;
  const filtered = personas.filter(p => p.id !== id);
  saveAllPersonas(filtered);
  // If deleted was active, switch to first default
  if (getActivePersonaId() === id) {
    setActivePersonaId(DEFAULT_PERSONAS[0].id);
  }
  return true;
}
