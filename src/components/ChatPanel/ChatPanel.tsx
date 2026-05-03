import React, { useState, useRef, useEffect } from 'react';
import {
  Box, TextField, IconButton,
  Typography, Paper, Divider,
  Tooltip,
} from '@mui/material';
import { Send as SendIcon, Mic as MicIcon, MicOff as MicOffIcon, VolumeUp as VolumeUpIcon, VolumeOff as VolumeOffIcon } from '@mui/icons-material';
import { useStore } from '../../store';
import { chatCompletion, initModelRegistry, getDefaultModel } from '../../services/ai/model-registry-adapter';
import { injectCompanionContext, autoSummarizeChat, adjustMoodForInteraction } from '../../services/companion';
import { queryKnowledgeBase, buildRAGContext, isDocumentIndexed, reindexAllDocuments } from '../../services/rag';
import { voiceService } from '../../services/voice/voiceService';
import type { Message } from '../../types';
import { useTranslation } from 'react-i18next';

// Three-dot typing indicator component
const TypingIndicator: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, pl: 1 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            bgcolor: 'primary.light',
            animation: 'bounce 1.2s infinite ease-in-out',
            animationDelay: `${i * 0.16}s`,
            '@keyframes bounce': {
              '0%, 80%, 100%': { transform: 'translateY(0)', opacity: 0.4 },
              '40%': { transform: 'translateY(-5px)', opacity: 1 },
            },
          }}
        />
      ))}
    </Box>
  );
};

export const ChatPanel: React.FC = () => {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [showThinkingContent, setShowThinkingContent] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const messages = useStore((s) => s.messages);
  const models = useStore((s) => s.models);
  const addMessage = useStore((s) => s.addMessage);
  const clearMessages = useStore((s) => s.clearMessages);
  const isAIThinking = useStore((s) => s.isAIThinking);
  const aiThinkingContent = useStore((s) => s.aiThinkingContent);
  const setAIThinking = useStore((s) => s.setAIThinking);
  const setAIThinkingContent = useStore((s) => s.setAIThinkingContent);
  const aiConfig = useStore((s) => s.aiConfig);
  const setPetStatus = useStore((s) => s.setPetStatus);
  const updateLastActivity = useStore((s) => s.updateLastActivity);
  const voiceSettings = useStore((s) => s.voiceSettings);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceUnsubscribeRef = useRef<(() => void) | null>(null);

  // Initialize model registry when models change
  useEffect(() => {
    initModelRegistry(models);
  }, [models]);

  // Voice service initialization and subscription
  useEffect(() => {
    const support = voiceService.isSupported();
    setTtsSupported(support.tts);
    setTtsEnabled(voiceSettings.ttsEnabled);

    // Subscribe to voice service state changes
    const unsubscribe = voiceService.subscribe((event) => {
      if (event.type === 'stateChange' && event.state) {
        setIsListening(event.state.isListening);
      }
      if (event.type === 'transcription' && event.transcription) {
        setInput((prev) => {
          // Append transcription to existing input (or replace if empty)
          return prev ? `${prev} ${event.transcription}` : event.transcription || prev;
        });
      }
    });

    voiceUnsubscribeRef.current = unsubscribe;

    return () => {
      unsubscribe();
    };
  }, [voiceSettings.ttsEnabled]);

  // Sync ttsEnabled with voiceSettings
  useEffect(() => {
    setTtsEnabled(voiceSettings.ttsEnabled);
  }, [voiceSettings.ttsEnabled]);

  // Get default model for display
  const defaultModel = getDefaultModel();
  const displayModel = defaultModel ? `${defaultModel.name} (${defaultModel.provider})` : `${aiConfig.model} · ${aiConfig.provider}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAIThinking]);

  // Voice: Toggle listening
  const handleVoiceToggle = () => {
    if (isListening) {
      voiceService.stopListening();
    } else {
      if (voiceSettings.sttEnabled) {
        voiceService.startListening();
      }
    }
  };

  // Voice: Toggle TTS for AI responses
  const handleTtsToggle = () => {
    const newTtsEnabled = !ttsEnabled;
    setTtsEnabled(newTtsEnabled);
    useStore.getState().setVoiceSettings({ ttsEnabled: newTtsEnabled });
  };

  // Speak text via TTS
  const speakText = async (text: string) => {
    if (ttsEnabled && ttsSupported) {
      try {
        await voiceService.speak(text);
      } catch (err) {
        console.warn('[Voice] TTS error:', err);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isAIThinking) return;

    const userMsg = input.trim();
    setInput('');

    // Add user message
    addMessage({ role: 'user', content: userMsg });
    updateLastActivity();
    adjustMoodForInteraction('chat');

    // Set pet to thinking
    setPetStatus({ state: 'thinking', message: undefined });
    setAIThinkingContent(null);
    setShowThinkingContent(false);

    // Add placeholder for AI
    let aiContent = '';
    let thinkingContent: string | null = null;
    let errorOccurred = false;

    try {
      setAIThinking(true);

      // Build messages with companion context (personality + memory)
      const apiMessages: Message[] = [
        ...messages,
        { id: 'temp', role: 'user', content: userMsg, timestamp: Date.now() },
      ];

      // Inject companion context (personality system prompt + memory)
      const messagesWithContext = await injectCompanionContext(apiMessages);

      // RAG Enhancement: Query knowledge base and add relevant context
      let ragContext = '';
      try {
        // Check if we have indexed documents
        const docs = useStore.getState().documents;
        if (docs.length > 0) {
          // Ensure documents are indexed (reindex if needed)
          const needsReindex = docs.some(doc => !isDocumentIndexed(doc.id));
          if (needsReindex) {
            reindexAllDocuments(docs);
          }

          // Query the knowledge base
          const ragResults = queryKnowledgeBase({ query: userMsg, topK: 3, minScore: 0.5 });
          if (ragResults.chunks.length > 0) {
            ragContext = buildRAGContext(ragResults, 2000);
          }
        }
      } catch (ragErr) {
        console.warn('[RAG] Knowledge base query failed:', ragErr);
      }

      // Add RAG context as additional system context if available
      let finalMessages = messagesWithContext;
      if (ragContext) {
        const ragSystemMessage: Message = {
          id: crypto.randomUUID(),
          role: 'system',
          content: `\n[KNOWLEDGE BASE - Answer using this information when relevant]\n${ragContext}\n[/KNOWLEDGE BASE]`,
          timestamp: Date.now(),
        };
        // Insert RAG context right after the existing system prompt
        finalMessages = [messagesWithContext[0], ragSystemMessage, ...messagesWithContext.slice(1)];
      }

      const result = await chatCompletion(finalMessages, aiConfig);

      // Extract thinking content if present (format: <thinking>...</thinking> or 【思考】...【/思考】)
      const thinkingMatch = result.match(/<(?:think(?:ing)?|thought)>([\s\S]*?)<\/(?:think(?:ing)?|thought)>/i)
        || result.match(/【思考】([\s\S]*?)【\/思考】/)
        || result.match(/\[(?:思考|thinking|reasoning)\]([\s\S]*?)\[\/(?:思考|thinking|reasoning)\]/i);

      if (thinkingMatch) {
        thinkingContent = thinkingMatch[1].trim();
        aiContent = result.replace(thinkingMatch[0], '').trim();
        setAIThinkingContent(thinkingContent);
      } else {
        aiContent = result;
        setAIThinkingContent(null);
      }

      addMessage({ role: 'assistant', content: aiContent });

      // TTS: Speak AI response aloud if enabled
      if (ttsEnabled && ttsSupported && aiContent) {
        speakText(aiContent);
      }

      // Auto-summarize chat to memory if enabled
      const companionState = useStore.getState().companion;
      if (companionState.autoSummarize && messagesWithContext.length > 10) {
        autoSummarizeChat(messagesWithContext).catch(() => {});
      }
    } catch (err) {
      errorOccurred = true;
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      addMessage({ role: 'assistant', content: `${t('chat.errorPrefix')}: ${errorMsg}` });
    } finally {
      setAIThinking(false);
      updateLastActivity();
      if (!errorOccurred && aiContent) {
        setPetStatus({ state: 'speaking', message: aiContent.slice(0, 50) + (aiContent.length > 50 ? '...' : '') });
        setTimeout(() => {
          setPetStatus({ state: 'idle' });
        }, 3000);
      } else {
        setPetStatus({ state: 'idle' });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 600 }}>
          💬 {t('chat.title')}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
          {displayModel}
        </Typography>
      </Box>

      {/* Messages */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        p: { xs: 1.5, md: 2 },
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        minHeight: 0,
        // Center chat on wide screens
        maxWidth: { lg: 800 },
        mx: 'auto',
        width: '100%',
      }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: 13 }}>
              {t('chat.emptyState')}
            </Typography>
          </Box>
        )}
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Paper
              sx={{
                maxWidth: '80%',
                p: 1.5,
                borderRadius: 2,
                // User: right-aligned, primary color bg
                // AI: left-aligned, dark elevated bg
                bgcolor: msg.role === 'user'
                  ? 'primary.main'
                  : 'rgba(30, 20, 55, 0.95)',
                color: 'white',
                fontSize: 13,
                borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 16,
                boxShadow: msg.role === 'assistant'
                  ? '0 2px 8px rgba(0,0,0,0.3)'
                  : 'none',
                border: msg.role === 'assistant'
                  ? '1px solid rgba(155, 127, 212, 0.2)'
                  : 'none',
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.6 }}>
                {msg.content}
              </Typography>
            </Paper>
          </Box>
        ))}
        {isAIThinking && (
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column', gap: 0.5 }}>
            <Paper
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(30, 20, 55, 0.95)',
                color: 'white',
                border: '1px solid rgba(155, 127, 212, 0.2)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                borderBottomLeftRadius: 4,
                borderBottomRightRadius: 16,
                width: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                  {t('chat.thinking')}
                </Typography>
                <TypingIndicator />
              </Box>

              {/* Thinking content toggle */}
              {aiThinkingContent && (
                <Box sx={{ mt: 1 }}>
                  <Box
                    component="button"
                    onClick={() => setShowThinkingContent(!showThinkingContent)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(155, 127, 212, 0.8)',
                      fontSize: 11,
                      p: 0,
                      '&:hover': { color: 'rgba(155, 127, 212, 1)' },
                    }}
                  >
                    <Typography variant="caption" sx={{ fontSize: 10, color: 'inherit' }}>
                      {showThinkingContent ? t('chat.hideReasoning') : t('chat.showReasoning')}
                    </Typography>
                  </Box>

                  {showThinkingContent && (
                    <Box
                      sx={{
                        mt: 1,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(155, 127, 212, 0.1)',
                        maxHeight: 120,
                        overflowY: 'auto',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.7)',
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'monospace',
                          lineHeight: 1.5,
                        }}
                      >
                        {aiThinkingContent}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input — sticky on mobile */}
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          gap: 1,
          alignItems: 'flex-end',
          flexShrink: 0,
          // Sticky bottom on mobile for thumb-friendly typing
          position: { xs: 'sticky', md: 'relative' },
          bottom: { xs: 0, md: 'auto' },
          zIndex: { xs: 10, md: 0 },
          bgcolor: { xs: 'rgba(15, 10, 30, 0.98)', md: 'transparent' },
          borderTop: { xs: '1px solid rgba(255,255,255,0.06)', md: 'none' },
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder={t('chat.placeholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isAIThinking}
          sx={{
            '& .MuiInputBase-root': {
              fontSize: 13,
              borderRadius: 2,
              transition: 'box-shadow 0.2s ease',
              '&.Mui-focused': {
                boxShadow: '0 0 0 2px rgba(155, 127, 212, 0.4)',
              },
            },
            '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
            '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          }}
        />

        {/* Voice Input Button (Mic) */}
        <Tooltip title={isListening ? t('chat.stopListening') : voiceSettings.sttEnabled ? t('chat.voiceInput') : t('chat.voiceDisabled')}>
          <span>
            <IconButton
              color={isListening ? 'error' : 'default'}
              onClick={handleVoiceToggle}
              disabled={!voiceSettings.sttEnabled || isAIThinking}
              size="small"
              sx={{
                alignSelf: 'flex-end',
                flexShrink: 0,
                bgcolor: isListening ? 'rgba(255, 80, 80, 0.15)' : 'transparent',
                '&:hover': { bgcolor: isListening ? 'rgba(255, 80, 80, 0.25)' : 'rgba(255,255,255,0.08)' },
              }}
            >
              {isListening ? <MicOffIcon sx={{ fontSize: 18 }} /> : <MicIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </span>
        </Tooltip>

        {/* TTS Toggle Button */}
        {ttsSupported && (
          <Tooltip title={ttsEnabled ? t('chat.disableVoiceOutput') : t('chat.enableVoiceOutput')}>
            <span>
              <IconButton
                color={ttsEnabled ? 'primary' : 'default'}
                onClick={handleTtsToggle}
                size="small"
                sx={{
                  alignSelf: 'flex-end',
                  flexShrink: 0,
                  bgcolor: ttsEnabled ? 'rgba(155, 127, 212, 0.15)' : 'transparent',
                  '&:hover': { bgcolor: ttsEnabled ? 'rgba(155, 127, 212, 0.25)' : 'rgba(255,255,255,0.08)' },
                }}
              >
                {ttsEnabled ? <VolumeUpIcon sx={{ fontSize: 18 }} /> : <VolumeOffIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </span>
          </Tooltip>
        )}

        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!input.trim() || isAIThinking}
          size="small"
          sx={{ alignSelf: 'flex-end', flexShrink: 0 }}
        >
          <SendIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {messages.length > 0 && (
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Typography
            variant="caption"
            component="button"
            onClick={clearMessages}
            sx={{
              color: 'text.secondary',
              fontSize: 11,
              cursor: 'pointer',
              opacity: 0.6,
              background: 'none',
              border: 'none',
              '&:hover': { opacity: 1 },
            }}
          >
            Clear chat
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ChatPanel;
