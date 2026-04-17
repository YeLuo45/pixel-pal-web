import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper,
  FormControl, InputLabel, Select, MenuItem,
  Alert, Divider, Stack,
} from '@mui/material';
import { Visibility, VisibilityOff, Save as SaveIcon } from '@mui/icons-material';
import { useStore } from '../../store';
import {
  PRESET_MODELS,
  DEFAULT_MODELS,
  PROVIDER_BASE_URLS,
} from '../../services/ai/openaiAdapter';
import type { AIConfig, GreetingFrequency } from '../../types';

const PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  'azure-openai': 'Azure OpenAI',
  custom: 'Custom Endpoint',
  minimax: 'MiniMax',
  xiaomi: 'Xiaomi (Mimo)',
  zhipu: 'Zhipu (GLM)',
  qwen: 'Qwen (Alibaba)',
};

export const Settings: React.FC = () => {
  const aiConfig = useStore((s) => s.aiConfig);
  const setAIConfig = useStore((s) => s.setAIConfig);
  const emailAccount = useStore((s) => s.emailAccount);
  const setEmailAccount = useStore((s) => s.setEmailAccount);
  const interactionSettings = useStore((s) => s.interactionSettings);
  const setInteractionSettings = useStore((s) => s.setInteractionSettings);

  const [formData, setFormData] = useState<AIConfig>(aiConfig);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleProviderChange = (provider: AIConfig['provider']) => {
    const defaultModel = DEFAULT_MODELS[provider] || 'gpt-4o-mini';
    const defaultBaseURL = PROVIDER_BASE_URLS[provider] || '';
    setFormData({
      ...formData,
      provider,
      model: defaultModel,
      baseURL: defaultBaseURL,
    });
  };

  const handleSave = () => {
    if (!formData.apiKey.trim()) {
      setError('API Key is required to use AI features.');
      return;
    }
    setAIConfig(formData);
    setSaved(true);
    setError('');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDisconnectGmail = () => {
    setEmailAccount(null);
    localStorage.removeItem('pixelpal_gmail_client_id');
  };

  const filteredModels = PRESET_MODELS.filter((m) => m.provider === formData.provider);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 600 }}>
          ⚙️ Settings
        </Typography>
      </Box>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Pet Interaction Settings */}
        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontSize: 13, fontWeight: 600, mb: 2 }}>
            🐾 Pet Interaction
          </Typography>

          <Stack gap={2}>
            {/* Greeting Frequency */}
            <FormControl size="small" fullWidth>
              <InputLabel>Periodic Greetings</InputLabel>
              <Select
                value={interactionSettings.greetingFrequency}
                label="Periodic Greetings"
                onChange={(e) =>
                  setInteractionSettings({ greetingFrequency: e.target.value as GreetingFrequency })}
              >
                <MenuItem value="high">High (every 30 minutes)</MenuItem>
                <MenuItem value="medium">Medium (hourly)</MenuItem>
                <MenuItem value="low">Low (2x daily: morning & afternoon)</MenuItem>
                <MenuItem value="off">Off</MenuItem>
              </Select>
            </FormControl>

            {/* Sleep Schedule */}
            <Box>
              <Typography variant="body2" sx={{ fontSize: 12, mb: 1, color: 'text.secondary' }}>
                Sleep Schedule
              </Typography>
              <Stack direction="row" gap={1} alignItems="center">
                <TextField
                  label="Start"
                  type="time"
                  size="small"
                  value={interactionSettings.sleepTimeStart}
                  onChange={(e) =>
                    setInteractionSettings({ sleepTimeStart: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  sx={{ flex: 1 }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>to</Typography>
                <TextField
                  label="End"
                  type="time"
                  size="small"
                  value={interactionSettings.sleepTimeEnd}
                  onChange={(e) =>
                    setInteractionSettings({ sleepTimeEnd: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  sx={{ flex: 1 }}
                />
              </Stack>
              <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled', mt: 0.5, display: 'block' }}>
                During this time, PixelPal will be in sleep mode with ZZZ animation.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Divider sx={{ opacity: 0.1 }} />

        {/* AI Settings */}
        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontSize: 13, fontWeight: 600, mb: 2 }}>
            🤖 AI Configuration
          </Typography>

          <Stack gap={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Provider</InputLabel>
              <Select
                value={formData.provider}
                label="Provider"
                onChange={(e) => handleProviderChange(e.target.value as AIConfig['provider'])}
              >
                <MenuItem value="openai">{PROVIDER_LABELS.openai}</MenuItem>
                <MenuItem value="anthropic">{PROVIDER_LABELS.anthropic}</MenuItem>
                <MenuItem value="azure-openai">{PROVIDER_LABELS['azure-openai']}</MenuItem>
                <MenuItem value="custom">{PROVIDER_LABELS.custom}</MenuItem>
                <MenuItem value="minimax">{PROVIDER_LABELS.minimax}</MenuItem>
                <MenuItem value="xiaomi">{PROVIDER_LABELS.xiaomi}</MenuItem>
                <MenuItem value="zhipu">{PROVIDER_LABELS.zhipu}</MenuItem>
                <MenuItem value="qwen">{PROVIDER_LABELS.qwen}</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                value={formData.model}
                label="Model"
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              >
                {filteredModels.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
                <MenuItem value="__custom__">Custom model name...</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="API Key"
              type={showKey ? 'text' : 'password'}
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              size="small"
              fullWidth
              placeholder="sk-..."
              InputProps={{
                endAdornment: (
                  <Button size="small" onClick={() => setShowKey(!showKey)} sx={{ minWidth: 'auto', p: 0.5 }}>
                    {showKey ? <VisibilityOff sx={{ fontSize: 16 }} /> : <Visibility sx={{ fontSize: 16 }} />}
                  </Button>
                ),
              }}
              helperText={
                <Typography variant="caption" sx={{ fontSize: 10 }}>
                  Stored locally in your browser. Never sent to our servers.
                </Typography>
              }
            />

            {(formData.provider === 'custom' || formData.provider === 'azure-openai') && (
              <TextField
                label="Base URL"
                value={formData.baseURL || ''}
                onChange={(e) => setFormData({ ...formData, baseURL: e.target.value })}
                size="small"
                fullWidth
                placeholder="https://api.openai.com/v1"
              />
            )}
          </Stack>
        </Paper>

        {/* Gmail Settings */}
        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontSize: 13, fontWeight: 600, mb: 2 }}>
            📧 Gmail Integration
          </Typography>

          {emailAccount ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" sx={{ fontSize: 12 }}>
                  Connected: <strong>{emailAccount.email}</strong>
                </Typography>
              </Box>
              <Button
                size="small"
                color="error"
                variant="outlined"
                onClick={handleDisconnectGmail}
                sx={{ fontSize: 11 }}
              >
                Disconnect
              </Button>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ fontSize: 12, color: 'text.secondary' }}>
              Connect Gmail from the Email panel using OAuth.
            </Typography>
          )}
        </Paper>

        {/* About */}
        <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontSize: 13, fontWeight: 600, mb: 2 }}>
            ℹ️ About PixelPal
          </Typography>
          <Typography variant="body2" sx={{ fontSize: 12, color: 'text.secondary', lineHeight: 1.6 }}>
            PixelPal v0.2.0 — A pixel art AI companion and productivity assistant.
            <br />
            All AI features use your own API key. No data leaves your browser except to the AI provider you configure.
          </Typography>
        </Paper>

        {error && <Alert severity="error" sx={{ fontSize: 12 }}>{error}</Alert>}
        {saved && <Alert severity="success" sx={{ fontSize: 12 }}>Settings saved!</Alert>}

        <Button
          variant="contained"
          startIcon={<SaveIcon sx={{ fontSize: 16 }} />}
          onClick={handleSave}
          fullWidth
          sx={{ fontSize: 13 }}
        >
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default Settings;
