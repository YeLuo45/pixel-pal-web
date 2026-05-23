/**
 * V134: SocialGraph — leaderboard data + "X users also use" badge
 * Uses localStorage for persistence; leaderboard data from marketplace.
 */

export interface LeaderboardEntry {
  skillId: string;
  version: string;
  author: string;
  downloadCount: number;
  rating: number;
  ratingCount: number;
}

export interface SocialBadge {
  skillId: string;
  userCount: number;
}

/** Simulated leaderboard — in production this would fetch from marketplace API */
export function getLeaderboard(limit = 10): LeaderboardEntry[] {
  const stored = localStorage.getItem('pixelpal_leaderboard');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fall through to default
    }
  }
  return [
    { skillId: 'taro-drawing', version: '2.1.0', author: 'anon', downloadCount: 142, rating: 4.7, ratingCount: 38 },
    { skillId: 'emoji-reply', version: '1.3.0', author: 'anon', downloadCount: 98, rating: 4.5, ratingCount: 22 },
    { skillId: 'mood tracker', version: '1.0.0', author: 'anon', downloadCount: 76, rating: 4.3, ratingCount: 15 },
  ].slice(0, limit);
}

export function recordDownload(skillId: string): void {
  const stored = localStorage.getItem('pixelpal_downloads');
  const downloads: Record<string, number> = stored ? JSON.parse(stored) : {};
  downloads[skillId] = (downloads[skillId] || 0) + 1;
  localStorage.setItem('pixelpal_downloads', JSON.stringify(downloads));
}

export function getSocialBadge(skillId: string): SocialBadge {
  const stored = localStorage.getItem('pixelpal_social');
  const social: Record<string, number> = stored ? JSON.parse(stored) : {};
  return {
    skillId,
    userCount: social[skillId] || Math.floor(Math.random() * 50) + 1,
  };
}

export function recordSkillUse(skillId: string): void {
  const stored = localStorage.getItem('pixelpal_social');
  const social: Record<string, number> = stored ? JSON.parse(stored) : {};
  social[skillId] = (social[skillId] || 0) + 1;
  localStorage.setItem('pixelpal_social', JSON.stringify(social));
}