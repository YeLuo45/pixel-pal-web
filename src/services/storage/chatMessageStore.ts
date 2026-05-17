/**
 * ChatMessageStore - SQLite-backed chat message storage
 * 
 * Replaces localStorage-based chat message storage with SQLite.
 * Uses drizzle-orm for type-safe queries.
 */

import { getDB } from '../db';
import { messages, type Message, type NewMessage } from '../db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  channel: string;
  timestamp: number;
  metadata?: string;
  personaId?: string;
}

/**
 * Get all messages for a channel, ordered by timestamp
 */
export async function getMessages(channel: string = 'web', limit: number = 100): Promise<ChatMessage[]> {
  const db = getDB();
  const results = await db
    .select()
    .from(messages)
    .where(eq(messages.channel, channel))
    .orderBy(desc(messages.timestamp))
    .limit(limit);

  return results.map(r => ({
    id: r.id,
    role: r.role as 'user' | 'assistant' | 'system',
    content: r.content,
    channel: r.channel,
    timestamp: r.timestamp.getTime(),
    metadata: r.metadata || undefined,
    personaId: r.personaId || undefined,
  })).reverse(); // Oldest first for display
}

/**
 * Save a new message
 */
export async function saveMessage(msg: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
  const db = getDB();
  const id = msg.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  
  const newMsg: NewMessage = {
    id,
    role: msg.role,
    content: msg.content,
    channel: msg.channel || 'web',
    timestamp: new Date(msg.timestamp),
    metadata: msg.metadata || null,
    personaId: msg.personaId || null,
  };

  await db.insert(messages).values(newMsg);

  return { ...newMsg, id, timestamp: msg.timestamp };
}

/**
 * Delete a message by ID
 */
export async function deleteMessage(id: string): Promise<void> {
  const db = getDB();
  await db.delete(messages).where(eq(messages.id, id));
}

/**
 * Clear all messages for a channel
 */
export async function clearChannel(channel: string = 'web'): Promise<void> {
  const db = getDB();
  await db.delete(messages).where(eq(messages.channel, channel));
}

/**
 * Get message count for a channel
 */
export async function getMessageCount(channel: string = 'web'): Promise<number> {
  const db = getDB();
  const results = await db
    .select()
    .from(messages)
    .where(eq(messages.channel, channel));
  return results.length;
}

/**
 * Search messages by content
 */
export async function searchMessages(query: string, channel?: string): Promise<ChatMessage[]> {
  const db = getDB();
  
  let conditions = [];
  if (channel) {
    conditions.push(eq(messages.channel, channel));
  }
  
  const results = await db
    .select()
    .from(messages)
    .where(
      conditions.length > 0 
        ? and(...conditions)
        : undefined
    );

  const queryLower = query.toLowerCase();
  return results
    .filter(r => r.content.toLowerCase().includes(queryLower))
    .map(r => ({
      id: r.id,
      role: r.role as 'user' | 'assistant' | 'system',
      content: r.content,
      channel: r.channel,
      timestamp: r.timestamp.getTime(),
      metadata: r.metadata || undefined,
      personaId: r.personaId || undefined,
    }))
    .sort((a, b) => b.timestamp - a.timestamp);
}