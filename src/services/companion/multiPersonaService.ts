/**
 * Multi-Persona Collaboration Service
 * 
 * Allows multiple AI personas to collaborate, discuss, and respond together.
 * Each persona has its own personality, expertise, and communication style.
 */

import type { Message } from '../../types';
import type { PersonaId, PersonaConfig } from './personalityTypes';
import { getPersona, PERSONAS } from './personalityTypes';
import { buildCompanionSystemPrompt } from './companionService';

export interface PersonaMember {
  personaId: PersonaId;
  name: string;
  color: string;
  role: 'primary' | 'contributor' | 'observer';
  expertise: string[];        // Topics this persona specializes in
  isActive: boolean;          // Currently participating
  lastMessage?: string;       // Last thing this persona said
  avatar?: string;            // Emoji or icon
}

export interface CollaborationMessage {
  id: string;
  personaId: PersonaId;
  personaName: string;
  content: string;
  timestamp: number;
  type: 'contribution' | 'question' | 'agreement' | 'disagreement' | 'summary';
}

export interface TeamDiscussion {
  id: string;
  topic: string;
  messages: CollaborationMessage[];
  startedAt: number;
  activePersonas: PersonaId[];
  status: 'active' | 'concluded' | 'summarized';
  summary?: string;
}

// ----- Team Configuration -----

export interface TeamConfig {
  teamName: string;
  members: PersonaMember[];
  maxActiveMembers: number;    // How many can actively contribute
  allowDebate: boolean;        // Allow personas to disagree
  summarizeOnConclude: boolean;
}

const DEFAULT_TEAM_CONFIG: TeamConfig = {
  teamName: 'PixelPal Team',
  members: [],
  maxActiveMembers: 3,
  allowDebate: true,
  summarizeOnConclude: true,
};

// ----- Active Team State -----

let currentTeam: TeamConfig = { ...DEFAULT_TEAM_CONFIG };
let activeDiscussion: TeamDiscussion | null = null;

/**
 * Get all available personas that can join the team
 */
export function getAvailablePersonasForTeam(): PersonaConfig[] {
  return Object.values(PERSONAS);
}

/**
 * Get current team configuration
 */
export function getTeamConfig(): TeamConfig {
  return { ...currentTeam };
}

/**
 * Set the team configuration
 */
export function setTeamConfig(config: Partial<TeamConfig>): void {
  currentTeam = { ...currentTeam, ...config };
}

/**
 * Add a persona to the team
 */
export function addPersonaToTeam(personaId: PersonaId, role: PersonaMember['role'] = 'contributor'): boolean {
  const persona = getPersona(personaId);
  const alreadyMember = currentTeam.members.some(m => m.personaId === personaId);
  
  if (alreadyMember) return false;
  
  const member: PersonaMember = {
    personaId,
    name: persona.name,
    color: persona.color,
    role,
    expertise: persona.traits.map(t => t.id),
    isActive: currentTeam.members.filter(m => m.isActive).length < currentTeam.maxActiveMembers,
  };
  
  currentTeam.members = [...currentTeam.members, member];
  return true;
}

/**
 * Remove a persona from the team
 */
export function removePersonaFromTeam(personaId: PersonaId): void {
  currentTeam.members = currentTeam.members.filter(m => m.personaId !== personaId);
}

/**
 * Set a persona's active status
 */
export function setPersonaActive(personaId: PersonaId, isActive: boolean): void {
  const currentlyActive = currentTeam.members.filter(m => m.isActive).length;
  
  if (isActive && currentlyActive >= currentTeam.maxActiveMembers) {
    // Deactivate the first active member if needed
    const firstActive = currentTeam.members.find(m => m.isActive && m.personaId !== personaId);
    if (firstActive) {
      firstActive.isActive = false;
    }
  }
  
  currentTeam.members = currentTeam.members.map(m =>
    m.personaId === personaId ? { ...m, isActive } : m
  );
}

/**
 * Set persona role in team
 */
export function setPersonaRole(personaId: PersonaId, role: PersonaMember['role']): void {
  currentTeam.members = currentTeam.members.map(m =>
    m.personaId === personaId ? { ...m, role } : m
  );
}

/**
 * Get team members
 */
export function getTeamMembers(): PersonaMember[] {
  return [...currentTeam.members];
}

/**
 * Get active team members (those who can contribute)
 */
export function getActiveMembers(): PersonaMember[] {
  return currentTeam.members.filter(m => m.isActive);
}

/**
 * Get primary persona (the main AI companion)
 */
export function getPrimaryPersona(): PersonaMember | undefined {
  return currentTeam.members.find(m => m.role === 'primary') || currentTeam.members[0];
}

/**
 * Set primary persona
 */
export function setPrimaryPersona(personaId: PersonaId): void {
  currentTeam.members = currentTeam.members.map(m => ({
    ...m,
    role: m.personaId === personaId ? 'primary' : (m.role === 'primary' ? 'contributor' : m.role),
  }));
}

/**
 * Build system prompt for a specific persona within a team context
 */
export async function buildTeamSystemPrompt(personaId: PersonaId): Promise<string> {
  const persona = getPersona(personaId);
  const teamContext = buildTeamContext();
  const basePrompt = await buildCompanionSystemPrompt(teamContext);
  
  // Add team-specific instructions
  const member = currentTeam.members.find(m => m.personaId === personaId);
  const roleContext = member ? getRoleContext(member) : '';
  
  return `${basePrompt}\n\n${roleContext}`;
}

/**
 * Build team context description for system prompts
 */
function buildTeamContext(): string {
  if (currentTeam.members.length <= 1) {
    return 'You are working alone as the sole AI companion.';
  }
  
  const activeMembers = currentTeam.members.filter(m => m.isActive);
  const observerMembers = currentTeam.members.filter(m => !m.isActive);
  
  let context = `You are part of a collaborative team called "${currentTeam.teamName}".\n\n`;
  context += `Team members:\n`;
  
  for (const member of currentTeam.members) {
    const status = member.isActive ? '🟢 Active' : '⚪ Observing';
    const roleLabel = member.role === 'primary' ? '(Team Lead)' : member.role === 'contributor' ? '(Contributor)' : '(Observer)';
    context += `  - ${member.name} ${roleLabel} ${status}: ${member.expertise.join(', ')}\n`;
  }
  
  context += `\n`;
  
  if (activeMembers.length > 1) {
    context += `Active collaborators: ${activeMembers.map(m => m.name).join(', ')}.\n`;
    context += `When another team member contributes, acknowledge their input and build upon it when appropriate.\n`;
    
    if (currentTeam.allowDebate) {
      context += `Healthy debate is encouraged - if you disagree with another member's view, respectfully state your perspective.\n`;
    }
  }
  
  if (observerMembers.length > 0) {
    context += `Observers (may join later): ${observerMembers.map(m => m.name).join(', ')}.\n`;
  }
  
  return context;
}

/**
 * Get role-specific context for a team member
 */
function getRoleContext(member: PersonaMember): string {
  switch (member.role) {
    case 'primary':
      return `As the Team Lead, you should:
- Synthesize inputs from all active members
- Ensure the discussion remains productive and on-topic
- Provide the final balanced response to the user
- Coordinate team contributions`;
    case 'contributor':
      return `As a Contributor, you should:
- Share your perspective and expertise on the topic
- Respond to prompts when your expertise is relevant
- Engage with other members' ideas constructively
- Keep responses focused and concise`;
    case 'observer':
      return `As an Observer, you are silently watching the discussion.
You may contribute if explicitly asked by the Team Lead or if you have a particularly important insight.`;
    default:
      return '';
  }
}

// ----- Discussion Management -----

/**
 * Start a new team discussion
 */
export function startDiscussion(topic: string): TeamDiscussion {
  const activeIds = getActiveMembers().map(m => m.personaId);
  
  activeDiscussion = {
    id: crypto.randomUUID(),
    topic,
    messages: [],
    startedAt: Date.now(),
    activePersonas: activeIds,
    status: 'active',
  };
  
  return activeDiscussion;
}

/**
 * Add a message to the current discussion
 */
export function addDiscussionMessage(
  personaId: PersonaId,
  content: string,
  type: CollaborationMessage['type'] = 'contribution'
): CollaborationMessage | null {
  if (!activeDiscussion || activeDiscussion.status !== 'active') return null;
  
  const persona = getPersona(personaId);
  
  const message: CollaborationMessage = {
    id: crypto.randomUUID(),
    personaId,
    personaName: persona.name,
    content,
    timestamp: Date.now(),
    type,
  };
  
  activeDiscussion.messages.push(message);
  
  // Update member's last message
  currentTeam.members = currentTeam.members.map(m =>
    m.personaId === personaId ? { ...m, lastMessage: content.slice(0, 100) } : m
  );
  
  return message;
}

/**
 * Get current discussion
 */
export function getCurrentDiscussion(): TeamDiscussion | null {
  return activeDiscussion;
}

/**
 * Conclude the current discussion
 */
export function concludeDiscussion(summary?: string): TeamDiscussion | null {
  if (!activeDiscussion) return null;
  
  activeDiscussion.status = summary ? 'summarized' : 'concluded';
  if (summary) {
    activeDiscussion.summary = summary;
  }
  
  const concluded = activeDiscussion;
  // Don't nullify activeDiscussion immediately so UI can show the concluded state
  return concluded;
}

/**
 * Clear the current discussion
 */
export function clearDiscussion(): void {
  activeDiscussion = null;
}

/**
 * Get discussion history
 */
export function getDiscussionHistory(): TeamDiscussion[] {
  return activeDiscussion ? [activeDiscussion] : [];
}

// ----- Quick Team Setup Helpers -----

/**
 * Set up a balanced team with multiple personas
 */
export function setupBalancedTeam(primaryId: PersonaId = 'default'): void {
  // Reset team
  currentTeam = { ...DEFAULT_TEAM_CONFIG };
  
  // Set primary
  addPersonaToTeam(primaryId, 'primary');
  
  // Add a few others based on primary
  const allIds: PersonaId[] = ['default', 'playful', 'professional', 'gentle', 'witty'];
  const others = allIds.filter(id => id !== primaryId);
  
  // Add one complementary persona
  if (primaryId === 'professional') {
    addPersonaToTeam('default', 'contributor');
  } else if (primaryId === 'playful') {
    addPersonaToTeam('gentle', 'contributor');
  } else {
    addPersonaToTeam('witty', 'contributor');
  }
}

/**
 * Get a description of the current team setup
 */
export function getTeamDescription(): string {
  if (currentTeam.members.length === 0) {
    return 'No team configured yet.';
  }
  
  const primary = getPrimaryPersona();
  const actives = getActiveMembers();
  
  let desc = `**${currentTeam.teamName}**\n`;
  desc += `Lead: ${primary?.name || 'None'}\n`;
  desc += `Active: ${actives.map(m => m.name).join(', ') || 'None'}\n`;
  desc += `Total members: ${currentTeam.members.length}`;
  
  return desc;
}

// ----- State Persistence -----

/**
 * Export team state for persistence
 */
export function exportTeamState(): { team: TeamConfig; discussion: TeamDiscussion | null } {
  return {
    team: { ...currentTeam },
    discussion: activeDiscussion,
  };
}

/**
 * Import team state from persistence
 */
export function importTeamState(state: { team?: TeamConfig; discussion?: TeamDiscussion | null }): void {
  if (state.team) {
    currentTeam = { ...state.team };
  }
  if (state.discussion !== undefined) {
    activeDiscussion = state.discussion;
  }
}
