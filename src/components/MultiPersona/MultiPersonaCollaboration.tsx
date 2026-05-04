/**
 * Multi-Persona Collaboration Panel
 *
 * UI for team management and collaborative discussion.
 * Shows team members, allows switching personas, and displays team chat.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  Avatar,
  Collapse,
  Divider,
  Tooltip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon,
  Person as PersonIcon,
  Visibility as VisibilityIcon,
  Chat as ChatIcon,
  Clear as ClearIcon,
  Summarize as SummarizeIcon,
} from '@mui/icons-material';
import { useStore } from '../../store';
import {
  type PersonaMember,
  type TeamDiscussion,
  type CollaborationMessage,
  getAvailablePersonasForTeam,
  getTeamConfig,
  setTeamConfig,
  addPersonaToTeam,
  removePersonaFromTeam,
  setPersonaActive,
  getTeamMembers,
  getActiveMembers,
  setPrimaryPersona,
  setupBalancedTeam,
  getTeamDescription,
  startDiscussion,
  addDiscussionMessage,
  getCurrentDiscussion,
  concludeDiscussion,
  clearDiscussion,
} from '../../services/companion/multiPersonaService';
import type { PersonaId } from '../../services/companion/personalityTypes';
import { getPersona } from '../../services/companion/personalityTypes';

export const MultiPersonaCollaboration: React.FC = () => {
  const { t } = useTranslation();
  const [teamExpanded, setTeamExpanded] = useState(true);
  const [addPersonaOpen, setAddPersonaOpen] = useState(false);
  const [selectedNewPersona, setSelectedNewPersona] = useState<PersonaId | ''>('');
  const [chatExpanded, setChatExpanded] = useState(false);
  const [localDiscussion, setLocalDiscussion] = useState<TeamDiscussion | null>(null);
  const [teamInput, setTeamInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const companion = useStore((s) => s.companion);
  const setPersona = useStore((s) => s.setPersona);

  // Sync with current discussion
  useEffect(() => {
    const discussion = getCurrentDiscussion();
    if (discussion) {
      setLocalDiscussion({ ...discussion });
    }
  }, [localDiscussion?.messages.length]);

  // Auto-scroll to bottom of discussion
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localDiscussion?.messages.length]);

  const availablePersonas = getAvailablePersonasForTeam();
  const teamMembers = getTeamMembers();
  const activeMembers = getActiveMembers();
  const teamConfig = getTeamConfig();

  const handleAddPersona = () => {
    if (selectedNewPersona) {
      const success = addPersonaToTeam(selectedNewPersona, 'contributor');
      if (success) {
        setSelectedNewPersona('');
        setAddPersonaOpen(false);
      }
    }
  };

  const handleRemovePersona = (personaId: PersonaId) => {
    removePersonaFromTeam(personaId);
  };

  const handleToggleActive = (personaId: PersonaId, currentActive: boolean) => {
    setPersonaActive(personaId, !currentActive);
  };

  const handleSetPrimary = (personaId: PersonaId) => {
    setPrimaryPersona(personaId);
    // Also update the main companion
    setPersona(personaId);
  };

  const handleSetupBalanced = () => {
    setupBalancedTeam(companion.personaId);
  };

  const handleStartDiscussion = () => {
    if (teamInput.trim()) {
      const discussion = startDiscussion(teamInput.trim());
      setLocalDiscussion(discussion);
      setTeamInput('');
      addDiscussionMessage(companion.personaId, `Starting discussion about: ${discussion.topic}`, 'contribution');
    }
  };

  const handleConcludeDiscussion = () => {
    if (localDiscussion) {
      const summary = `Team discussed: ${localDiscussion.topic}. ${localDiscussion.messages.length} messages exchanged.`;
      concludeDiscussion(summary);
      setLocalDiscussion(prev => prev ? { ...prev, status: 'summarized', summary } : null);
    }
  };

  const handleClearTeamChat = () => {
    clearDiscussion();
    setLocalDiscussion(null);
  };

  const getRoleIcon = (role: PersonaMember['role']) => {
    switch (role) {
      case 'primary': return <StarIcon sx={{ fontSize: 14, color: 'gold' }} />;
      case 'contributor': return <PersonIcon sx={{ fontSize: 14 }} />;
      case 'observer': return <VisibilityIcon sx={{ fontSize: 14, opacity: 0.6 }} />;
    }
  };

  const getStatusColor = (isActive: boolean) => isActive ? 'success' : 'default';
  const getStatusLabel = (isActive: boolean) => isActive ? t('team.active') : t('team.observing');

  const getMessageTypeColor = (type: CollaborationMessage['type']) => {
    switch (type) {
      case 'contribution': return '#9B7FD4';
      case 'question': return '#64B5F6';
      case 'agreement': return '#81C784';
      case 'disagreement': return '#FF8A65';
      case 'summary': return '#FFD54F';
      default: return '#9B7FD4';
    }
  };

  const personaColors: Record<PersonaId, string> = {
    default: '#9C27B0',
    playful: '#FF9800',
    professional: '#2196F3',
    gentle: '#E91E63',
    witty: '#4CAF50',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Team Management Section */}
      <Paper sx={{ p: 2, bgcolor: 'rgba(30, 20, 55, 0.95)', borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="subtitle1" sx={{ fontSize: 14, fontWeight: 600 }}>
              {t('team.title')}
            </Typography>
            <Chip
              size="small"
              label={`${teamMembers.length} ${teamMembers.length !== 1 ? t('team.members') : t('team.members')}`}
              sx={{ height: 20, fontSize: 10 }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={t('team.setupBalanced')}>
              <Button size="small" onClick={handleSetupBalanced} sx={{ minWidth: 0, p: 0.5 }}>
                <SummarizeIcon sx={{ fontSize: 16 }} />
              </Button>
            </Tooltip>
            <IconButton size="small" onClick={() => setTeamExpanded(!teamExpanded)}>
              {teamExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={teamExpanded}>
          <Divider sx={{ my: 1.5 }} />

          {/* Team Description */}
          <Typography variant="body2" sx={{ fontSize: 12, color: 'text.secondary', mb: 2, whiteSpace: 'pre-line' }}>
            {getTeamDescription()}
          </Typography>

          {/* Active Members Quick View */}
          {activeMembers.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ fontSize: 11, color: 'text.secondary', mb: 0.5, display: 'block' }}>
                {t('team.activeCollaborators')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {activeMembers.map(member => (
                  <Chip
                    key={member.personaId}
                    size="small"
                    avatar={
                      <Avatar sx={{ bgcolor: member.color, fontSize: 10, width: 20, height: 20 }}>
                        {member.name[0]}
                      </Avatar>
                    }
                    label={member.name}
                    icon={getRoleIcon(member.role)}
                    sx={{ 
                      height: 24, 
                      fontSize: 11,
                      border: member.role === 'primary' ? `1px solid ${member.color}` : 'none',
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* All Team Members */}
          {teamMembers.length > 0 ? (
            <List dense disablePadding>
              {teamMembers.map(member => {
                return (
                  <ListItem
                    key={member.personaId}
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      mb: 0.5,
                      bgcolor: member.role === 'primary' ? 'rgba(155, 127, 212, 0.1)' : 'transparent',
                    }}
                  >
                    <ListItemAvatar sx={{ minWidth: 32 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: member.color, 
                          width: 24, 
                          height: 24, 
                          fontSize: 11,
                          opacity: member.isActive ? 1 : 0.5,
                        }}
                      >
                        {member.name[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography sx={{ fontSize: 12, fontWeight: member.role === 'primary' ? 600 : 400 }}>
                            {member.name}
                          </Typography>
                          {getRoleIcon(member.role)}
                          <Chip
                            size="small"
                            label={getStatusLabel(member.isActive)}
                            color={getStatusColor(member.isActive)}
                            sx={{ height: 16, fontSize: 9 }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography sx={{ fontSize: 10, color: 'text.secondary' }}>
                          {member.expertise.slice(0, 3).join(', ')}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction sx={{ right: 0 }}>
                      <Box sx={{ display: 'flex', gap: 0.25 }}>
                        {member.role !== 'primary' && (
                          <Tooltip title={t('team.setAsTeamLead')}>
                            <IconButton
                              size="small"
                              onClick={() => handleSetPrimary(member.personaId)}
                              sx={{ p: 0.25 }}
                            >
                              <StarIcon sx={{ fontSize: 14, color: 'grey.500' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title={member.isActive ? t('team.setAsObserver') : t('team.setAsActive')}>
                          <Switch
                            size="small"
                            checked={member.isActive}
                            onChange={() => handleToggleActive(member.personaId, member.isActive)}
                            sx={{ '& .MuiSwitch-thumb': { width: 12, height: 12 } }}
                          />
                        </Tooltip>
                        <Tooltip title={t('team.removeFromTeam')}>
                          <IconButton
                            size="small"
                            onClick={() => handleRemovePersona(member.personaId)}
                            sx={{ p: 0.25, color: 'error.light' }}
                          >
                            <RemoveIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2, opacity: 0.6 }}>
              <Typography variant="body2" sx={{ fontSize: 12 }}>
                {t('team.noMembers')}
              </Typography>
            </Box>
          )}

          {/* Add Persona Button */}
          <Button
            startIcon={<AddIcon />}
            size="small"
            fullWidth
            onClick={() => setAddPersonaOpen(true)}
            sx={{ mt: 1.5 }}
          >
            {t('team.addTeamMember')}
          </Button>

          {/* Team Settings */}
          <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={teamConfig.allowDebate}
                  onChange={(_, checked) => setTeamConfig({ allowDebate: checked })}
                />
              }
              label={
                <Typography sx={{ fontSize: 11 }}>
                  {t('team.allowDebate')}
                </Typography>
              }
              sx={{ mb: 0.5 }}
            />
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel sx={{ fontSize: 12 }}>{t('team.maxActiveMembers')}</InputLabel>
              <Select
                value={teamConfig.maxActiveMembers}
                label={t('team.maxActiveMembers')}
                onChange={(e) => setTeamConfig({ maxActiveMembers: Number(e.target.value) })}
                sx={{ fontSize: 12 }}
              >
                {[1, 2, 3, 4].map(n => (
                  <MenuItem key={n} value={n} sx={{ fontSize: 12 }}>{n}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Collapse>
      </Paper>

      {/* Team Chat Section */}
      {teamMembers.length > 1 && (
        <Paper sx={{ p: 2, bgcolor: 'rgba(30, 20, 55, 0.95)', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ChatIcon sx={{ fontSize: 18, color: 'primary.main' }} />
              <Typography variant="subtitle1" sx={{ fontSize: 14, fontWeight: 600 }}>
                {t('team.teamDiscussion')}
              </Typography>
              {localDiscussion && (
                <Chip 
                  size="small" 
                  label={localDiscussion.status}
                  color={localDiscussion.status === 'active' ? 'primary' : 'default'}
                  sx={{ height: 18, fontSize: 9, textTransform: 'capitalize' }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {localDiscussion && localDiscussion.status === 'active' && (
                <Tooltip title={t('team.concludeDiscussion')}>
                  <IconButton size="small" onClick={handleConcludeDiscussion}>
                    <SummarizeIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
              {localDiscussion && (
                <Tooltip title={t('team.clear')}>
                  <IconButton size="small" onClick={handleClearTeamChat}>
                    <ClearIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton size="small" onClick={() => setChatExpanded(!chatExpanded)}>
                {chatExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          </Box>

          <Collapse in={chatExpanded}>
            <Divider sx={{ my: 1.5 }} />

            {/* Discussion Topic Input */}
            {!localDiscussion && (
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('team.discussionPlaceholder')}
                  value={teamInput}
                  onChange={(e) => setTeamInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStartDiscussion()}
                  sx={{
                    '& .MuiInputBase-input': { fontSize: 12 },
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleStartDiscussion}
                  disabled={!teamInput.trim()}
                >
                  {t('team.start')}
                </Button>
              </Box>
            )}

            {/* Discussion Topic Display */}
            {localDiscussion && (
              <Box sx={{ mb: 1.5, p: 1, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                <Typography variant="caption" sx={{ fontSize: 10, color: 'text.secondary' }}>
                  {t('team.topic')}
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 12, fontWeight: 500 }}>
                  {localDiscussion.topic}
                </Typography>
              </Box>
            )}

            {/* Messages */}
            <Box sx={{ 
              maxHeight: 300, 
              overflowY: 'auto', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1,
              mb: 1.5,
            }}>
              {localDiscussion?.messages.map(msg => {
                const personaColor = personaColors[msg.personaId] || '#9B7FD4';
                return (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.personaId === companion.personaId ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: personaColor,
                        }}
                      />
                      <Typography sx={{ fontSize: 10, color: 'text.secondary', fontWeight: 500 }}>
                        {msg.personaName}
                      </Typography>
                      <Chip
                        size="small"
                        label={msg.type}
                        sx={{
                          height: 14,
                          fontSize: 8,
                          bgcolor: getMessageTypeColor(msg.type),
                          color: 'black',
                          textTransform: 'capitalize',
                        }}
                      />
                    </Box>
                    <Paper
                      sx={{
                        p: 1,
                        bgcolor: 'rgba(0,0,0,0.3)',
                        borderRadius: 1,
                        borderLeft: `2px solid ${personaColor}`,
                        maxWidth: '90%',
                      }}
                    >
                      <Typography sx={{ fontSize: 12, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                        {msg.content}
                      </Typography>
                    </Paper>
                  </Box>
                );
              })}
              {(!localDiscussion || localDiscussion.messages.length === 0) && (
                <Box sx={{ textAlign: 'center', py: 2, opacity: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: 12 }}>
                    {t('team.noMessagesYet')}
                  </Typography>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Summary if concluded */}
            {localDiscussion?.summary && (
              <Box sx={{ p: 1.5, bgcolor: 'rgba(255, 213, 79, 0.1)', borderRadius: 1, mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontSize: 10, color: '#FFD54F', fontWeight: 600 }}>
                  {t('team.summary')}
                </Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  {localDiscussion.summary}
                </Typography>
              </Box>
            )}

            {/* Continue Discussion Input */}
            {localDiscussion && localDiscussion.status === 'active' && (
              <TextField
                fullWidth
                size="small"
                placeholder={t('team.addToDiscussion')}
                value={teamInput}
                onChange={(e) => setTeamInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && teamInput.trim()) {
                    addDiscussionMessage(
                      companion.personaId,
                      teamInput.trim(),
                      'contribution'
                    );
                    setTeamInput('');
                  }
                }}
                sx={{ '& .MuiInputBase-input': { fontSize: 12 } }}
              />
            )}

            {/* New Discussion Button */}
            {localDiscussion && localDiscussion.status !== 'active' && (
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={() => {
                  setLocalDiscussion(null);
                  setTeamInput('');
                }}
                sx={{ fontSize: 11 }}
              >
                {t('team.startNewDiscussion')}
              </Button>
            )}
          </Collapse>
        </Paper>
      )}

      {/* Add Persona Dialog */}
      <Dialog open={addPersonaOpen} onClose={() => setAddPersonaOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: 14 }}>{t('team.addTeamMember')}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel sx={{ fontSize: 12 }}>{t('team.selectPersona')}</InputLabel>
            <Select
              value={selectedNewPersona}
              label={t('team.selectPersona')}
              onChange={(e) => setSelectedNewPersona(e.target.value as PersonaId)}
              sx={{ fontSize: 12 }}
            >
              {availablePersonas
                .filter(p => !teamMembers.some(m => m.personaId === p.id))
                .map(persona => (
                  <MenuItem key={persona.id} value={persona.id} sx={{ fontSize: 12 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: persona.color }} />
                      {persona.name} - {persona.description}
                    </Box>
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          {selectedNewPersona && (
            <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontSize: 11, fontWeight: 600, mb: 0.5 }}>
                {getPersona(selectedNewPersona).name}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 11, color: 'text.secondary' }}>
                {getPersona(selectedNewPersona).description}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {getPersona(selectedNewPersona).traits.map(trait => (
                  <Chip
                    key={trait.id}
                    size="small"
                    label={trait.id}
                    sx={{ height: 18, fontSize: 9 }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button size="small" onClick={() => setAddPersonaOpen(false)} sx={{ fontSize: 11 }}>
            {t('common.cancel')}
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleAddPersona}
            disabled={!selectedNewPersona}
            sx={{ fontSize: 11 }}
          >
            {t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MultiPersonaCollaboration;
