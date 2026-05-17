/**
 * SettingStore - SQLite-backed key-value settings
 */

import { getDB } from '../db';
import { settings } from '../db/schema';
import { eq } from 'drizzle-orm';

export type SettingValue = string | number | boolean | object;

/**
 * Get a setting value by key
 */
export async function getSetting<T = string>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = getDB();
    const results = await db.select().from(settings).where(eq(settings.key, key));
    if (results.length === 0) return defaultValue;
    
    const raw = results[0].value;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  } catch {
    return defaultValue;
  }
}

/**
 * Set a setting value
 */
export async function setSetting(key: string, value: SettingValue): Promise<void> {
  const db = getDB();
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  
  await db.insert(settings).values({
    key,
    value: serialized,
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: settings.key,
    set: {
      value: serialized,
      updatedAt: new Date(),
    },
  });
}

/**
 * Delete a setting
 */
export async function deleteSetting(key: string): Promise<void> {
  const db = getDB();
  await db.delete(settings).where(eq(settings.key, key));
}

/**
 * Get all settings
 */
export async function getAllSettings(): Promise<Record<string, SettingValue>> {
  const db = getDB();
  const results = await db.select().from(settings);
  
  const settingsObj: Record<string, SettingValue> = {};
  for (const row of results) {
    try {
      settingsObj[row.key] = JSON.parse(row.value);
    } catch {
      settingsObj[row.key] = row.value;
    }
  }
  return settingsObj;
}