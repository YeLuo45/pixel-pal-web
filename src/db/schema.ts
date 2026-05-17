import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// Messages table - stores all chat messages
export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
  content: text('content').notNull(),
  channel: text('channel').notNull().default('web'),
  timestamp: integer('timestamp', { mode: 'timestamp_ms' }).notNull(),
  metadata: text('metadata'), // JSON string for additional data
  personaId: text('persona_id'), // which persona was active
});

// Memories table - stores memory entries with embeddings
export const memories = sqliteTable('memories', {
  id: text('id').primaryKey(),
  content: text('content').notNull(),
  embedding: text('embedding'), // vector as JSON string (for future RAG)
  tags: text('tags'), // comma-separated tags
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
});

// Settings table - key-value store for app settings
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(), // JSON string for complex values
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});

// Personas table - stores persona configurations
export const personas = sqliteTable('personas', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  avatar: text('avatar').notNull(),
  bio: text('bio').notNull().default(''),
  voice: text('voice', { enum: ['warm', 'rational', 'humorous', 'serious'] }).notNull().default('warm'),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  theme: text('theme'), // JSON string for theme colors
  systemPrompt: text('system_prompt'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});

// Skills table - stores custom skill configurations
export const skills = sqliteTable('skills', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  config: text('config').notNull().default('{}'), // JSON string
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});

// Migration tracking table
export const migrations = sqliteTable('migrations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  appliedAt: integer('applied_at', { mode: 'timestamp_ms' }).notNull(),
});

// Type exports for use in application code
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type Memory = typeof memories.$inferSelect;
export type NewMemory = typeof memories.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type Persona = typeof personas.$inferSelect;
export type NewPersona = typeof personas.$inferInsert;
export type Skill = typeof skills.$inferSelect;
export type NewSkill = typeof skills.$inferInsert;