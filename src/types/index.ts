// Core types for PixelPal

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'azure-openai' | 'custom' | 'minimax' | 'xiaomi' | 'zhipu' | 'qwen';
  apiKey: string;
  baseURL?: string;
  model: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface Event {
  id: string;
  title: string;
  startTime: string; // ISO date string
  endTime: string;
  location?: string;
  description?: string;
  reminders: number[];
  source: 'local' | 'google';
  syncId?: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate?: string; // ISO date string
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'txt';
  size: number;
  content: string;
  uploadedAt: string;
}

export interface EmailAccount {
  type: 'gmail';
  email: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number; // Unix timestamp in ms
}

export interface EmailMessage {
  id: string;
  from: { name?: string; address: string };
  to: { name?: string; address: string }[];
  subject: string;
  body: string;
  date: string;
  read: boolean;
  snippet: string;
}

export interface WritingDraft {
  id: string;
  title: string;
  outline: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export type PetState = 'idle' | 'speaking' | 'thinking' | 'notification' | 'sleep';
export type PetPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

export interface PetStatus {
  state: PetState;
  position: PetPosition;
  x: number;
  y: number;
  message?: string;
}

export type GreetingFrequency = 'high' | 'medium' | 'low' | 'off';

export interface InteractionSettings {
  greetingFrequency: GreetingFrequency;
  sleepTimeStart: string; // "HH:mm" format, e.g. "23:00"
  sleepTimeEnd: string;   // "HH:mm" format, e.g. "07:00"
}

export interface InteractionCooldowns {
  lastGreetingTime: number;       // timestamp
  lastInactivityNoticeTime: number; // timestamp
  lastScheduleNoticeTime: number; // timestamp
  lastEmailNoticeTime: number;    // timestamp
}

export type PersonaId = 'default' | 'playful' | 'professional' | 'gentle' | 'witty';

export interface CompanionState {
  personaId: PersonaId;
  moodId: string;
  customName: string;
  memoryEnabled: boolean;   // Whether memory persistence is active
  autoSummarize: boolean;  // Whether to auto-summarize chat history
}
