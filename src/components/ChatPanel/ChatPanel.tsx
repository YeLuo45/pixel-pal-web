import React, { useState, useRef, useEffect } from 'react';
import {
  Box, TextField, IconButton,
  Typography, Paper, Divider,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useStore } from '../../store';
import { chatCompletion } from '../../services/ai/openaiAdapter';
import type { Message } from '../../types';

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
  const [input, setInput] = useState('');
  const messages = useStore((s) => s.messages);
  const addMessage = useStore((s) => s.addMessage);
  const clearMessages = useStore((s) => s.clearMessages);
  const isAIThinking = useStore((s) => s.isAIThinking);
  const setAIThinking = useStore((s) => s.setAIThinking);
  const aiConfig = useStore((s) => s.aiConfig);
  const setPetStatus = useStore((s) => s.setPetStatus);
  const updateLastActivity = useStore((s) => s.updateLastActivity);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAIThinking]);

  const handleSend = async () => {
    if (!input.trim() || isAIThinking) return;

    const userMsg = input.trim();
    setInput('');

    // Add user message
    addMessage({ role: 'user', content: userMsg });
    updateLastActivity();

    // Set pet to thinking
    setPetStatus({ state: 'thinking', message: undefined });

    // Add placeholder for AI
    let aiContent = '';
    let errorOccurred = false;

    try {
      setAIThinking(true);

      // Build messages for API
      const apiMessages: Message[] = [
        ...messages,
        { id: 'temp', role: 'user', content: userMsg, timestamp: Date.now() },
      ];

      aiContent = await chatCompletion(apiMessages, aiConfig);
      addMessage({ role: 'assistant', content: aiContent });
    } catch (err) {
      errorOccurred = true;
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      addMessage({ role: 'assistant', content: `⚠️ Error: ${errorMsg}` });
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
          💬 AI Chat
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
          {aiConfig.model} · {aiConfig.provider}
        </Typography>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {messages.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 4, opacity: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: 13 }}>
              👋 Hi! I'm PixelPal. Ask me anything!
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                  PixelPal is thinking
                </Typography>
                <TypingIndicator />
              </Box>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input */}
      <Box sx={{ p: 1.5, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Ask me anything... (Enter to send)"
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
