import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AIConfig, Message, Event, Task, DocumentFile, PetStatus, EmailAccount, InteractionSettings, InteractionCooldowns } from '../types';

interface AppState {
  // AI Config
  aiConfig: AIConfig;
  setAIConfig: (config: AIConfig) => void;

  // Chat
  messages: Message[];
  addMessage: (msg: Omit<Message, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  isAIThinking: boolean;
  setAIThinking: (thinking: boolean) => void;

  // Events / Calendar
  events: Event[];
  addEvent: (event: Event) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;

  // Documents
  documents: DocumentFile[];
  addDocument: (doc: DocumentFile) => void;
  removeDocument: (id: string) => void;

  // Email
  emailAccount: EmailAccount | null;
  setEmailAccount: (account: EmailAccount | null) => void;
  emailRefreshToken: (token: string) => void;

  // Pet
  petStatus: PetStatus;
  setPetStatus: (status: Partial<PetStatus>) => void;
  setPetMessage: (message?: string) => void;

  // Interaction Settings
  interactionSettings: InteractionSettings;
  setInteractionSettings: (settings: Partial<InteractionSettings>) => void;

  // Interaction Cooldowns
  cooldowns: InteractionCooldowns;
  setCooldown: (key: keyof InteractionCooldowns, value: number) => void;

  // Last activity (for inactivity detection)
  lastActivityTime: number;
  updateLastActivity: () => void;

  // UI
  activePanel: 'chat' | 'calendar' | 'tasks' | 'document' | 'email' | 'writing' | 'settings';
  setActivePanel: (panel: AppState['activePanel']) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // AI Config defaults
      aiConfig: {
        provider: 'openai',
        apiKey: '',
        baseURL: '',
        model: 'gpt-4o-mini',
      },
      setAIConfig: (config) => set({ aiConfig: config }),

      // Chat
      messages: [],
      addMessage: (msg) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...msg,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
          ],
        })),
      clearMessages: () => set({ messages: [] }),
      isAIThinking: false,
      setAIThinking: (thinking) => set({ isAIThinking: thinking }),

      // Events
      events: [],
      addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      deleteEvent: (id) => set((state) => ({ events: state.events.filter((e) => e.id !== id) })),

      // Tasks
      tasks: [],
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),
      deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      toggleTaskComplete: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: t.status === 'completed' ? 'pending' : 'completed',
                  completedAt: t.status === 'completed' ? undefined : new Date().toISOString(),
                }
              : t
          ),
        })),

      // Documents
      documents: [],
      addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
      removeDocument: (id) => set((state) => ({ documents: state.documents.filter((d) => d.id !== id) })),

      // Email
      emailAccount: null,
      setEmailAccount: (account) => set({ emailAccount: account }),
      emailRefreshToken: (token) =>
        set((state) => ({
          emailAccount: state.emailAccount
            ? { ...state.emailAccount, refreshToken: token }
            : null,
        })),

      // Pet
      petStatus: {
        state: 'idle',
        position: 'bottom-right',
        x: 0,
        y: 0,
      },
      setPetStatus: (status) =>
        set((state) => ({ petStatus: { ...state.petStatus, ...status } })),
      setPetMessage: (message) =>
        set((state) => ({ petStatus: { ...state.petStatus, message } })),

      // Interaction Settings
      interactionSettings: {
        greetingFrequency: 'medium',
        sleepTimeStart: '23:00',
        sleepTimeEnd: '07:00',
      },
      setInteractionSettings: (settings) =>
        set((state) => ({
          interactionSettings: { ...state.interactionSettings, ...settings },
        })),

      // Interaction Cooldowns
      cooldowns: {
        lastGreetingTime: 0,
        lastInactivityNoticeTime: 0,
        lastScheduleNoticeTime: 0,
        lastEmailNoticeTime: 0,
      },
      setCooldown: (key, value) =>
        set((state) => ({
          cooldowns: { ...state.cooldowns, [key]: value },
        })),

      // Last Activity
      lastActivityTime: Date.now(),
      updateLastActivity: () => set({ lastActivityTime: Date.now() }),

      // UI
      activePanel: 'chat',
      setActivePanel: (panel) => set({ activePanel: panel }),
    }),
    {
      name: 'pixelpal-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        aiConfig: state.aiConfig,
        events: state.events,
        tasks: state.tasks,
        documents: state.documents,
        emailAccount: state.emailAccount,
        messages: state.messages,
        petStatus: state.petStatus,
        interactionSettings: state.interactionSettings,
        cooldowns: state.cooldowns,
      }),
    }
  )
);
