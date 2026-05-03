import React, { useState, useEffect } from 'react';
import { Box, Drawer, useMediaQuery, IconButton } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Sidebar } from '../components/Layout/Sidebar';
import { ChatPanel } from '../components/ChatPanel/ChatPanel';
import { Calendar } from '../components/Calendar/Calendar';
import { Tasks } from '../components/Tasks/Tasks';
import { DocumentUpload } from '../components/Document/DocumentUpload';
import { Writing } from '../components/Writing/Writing';
import { Email } from '../components/Email/Email';
import { Settings } from '../components/Settings/Settings';
import { PixelPal } from '../components/PixelPal/PixelPal';
import { CompanionCanvas } from '../components/PixelPal/CompanionCanvas';
import { useStore } from '../store';
import { fetchGmailMessages, type GmailMessageSummary } from '../services/email/gmailAdapter';

const PANEL_COMPONENTS = {
  chat: ChatPanel,
  calendar: Calendar,
  tasks: Tasks,
  document: DocumentUpload,
  writing: Writing,
  email: Email,
  settings: Settings,
} as const;

// Greeting messages library (10+ messages)
const GREETING_MESSAGES = [
  '早上好！☀️ 今天有什么计划吗？',
  '下午好！☀️ 工作还顺利吗？',
  '晚上好！🌙 今天过得怎么样？',
  'Hi there! 👋 有空聊聊吗？',
  '嘿！👋 休息一下，喝杯水吧~',
  'Hello! 😊 需要我帮忙做什么吗？',
  'Yo! 😄 今天的目标完成了吗？',
  '嘿！💪 别忘了照顾好自己~',
  'Hi! 🌤️ 今天天气不错呢',
  'Hey! ✨ 有什么新鲜事吗？',
  '早安！🌅 新的一天新的开始！',
  '下午好！🍵 茶歇时间到了吗？',
];

// Work rhythm reminder messages
const WORK_RHYTHM_MESSAGES: Record<number, string> = {
  10: '📋 今天有哪些待办要处理？',
  17: '📝 今日任务整理一下？',
};

// Cooldown in milliseconds (30 minutes)
const COOLDOWN_MS = 30 * 60 * 1000;

function isInSleepPeriod(start: string, end: string): boolean {
  if (!start || !end) return false;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes <= endMinutes) {
    // Normal range: e.g., 23:00 - 07:00 (crosses midnight)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } else {
    // Crosses midnight: e.g., 23:00 - 07:00
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

function isNearHourBoundary(minutes: number): boolean {
  // Within 5 minutes of the hour (either before or after)
  return minutes < 5 || minutes > 55;
}

// Interaction Engine Hook
function useInteractionEngine() {
  const petStatus = useStore((s) => s.petStatus);
  const setPetStatus = useStore((s) => s.setPetStatus);
  const setPetMessage = useStore((s) => s.setPetMessage);
  const events = useStore((s) => s.events);
  const interactionSettings = useStore((s) => s.interactionSettings);
  const cooldowns = useStore((s) => s.cooldowns);
  const setCooldown = useStore((s) => s.setCooldown);
  const lastActivityTime = useStore((s) => s.lastActivityTime);
  const updateLastActivity = useStore((s) => s.updateLastActivity);
  const emailAccount = useStore((s) => s.emailAccount);

  // Register activity listeners (mouse/keyboard)
  useEffect(() => {
    const handleActivity = () => updateLastActivity();
    window.addEventListener('mousemove', handleActivity, { passive: true });
    window.addEventListener('mousedown', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [updateLastActivity]);

  // Main interaction engine — runs every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const nowDate = new Date();
      const hour = nowDate.getHours();
      const minutes = nowDate.getMinutes();

      // === Sleep detection ===
      if (
        petStatus.state !== 'sleep' &&
        isInSleepPeriod(interactionSettings.sleepTimeStart, interactionSettings.sleepTimeEnd)
      ) {
        setPetStatus({ state: 'sleep', message: undefined });
        return;
      }

      // Wake up when sleep period ends
      if (
        petStatus.state === 'sleep' &&
        !isInSleepPeriod(interactionSettings.sleepTimeStart, interactionSettings.sleepTimeEnd)
      ) {
        setPetStatus({ state: 'idle', message: undefined });
      }

      // Don't interrupt if pet is speaking or already showing a message
      if (petStatus.state === 'speaking' || petStatus.state === 'thinking') return;

      // === Periodic Greetings (hourly check) ===
      if (
        interactionSettings.greetingFrequency !== 'off' &&
        now - cooldowns.lastGreetingTime > COOLDOWN_MS &&
        isNearHourBoundary(minutes)
      ) {
        let shouldGreet = false;
        if (interactionSettings.greetingFrequency === 'high') {
          // Every 30 min marks
          shouldGreet = minutes < 5 || (minutes >= 25 && minutes < 35) || (minutes >= 55 && minutes < 65);
        } else if (interactionSettings.greetingFrequency === 'medium') {
          shouldGreet = minutes < 5;
        } else if (interactionSettings.greetingFrequency === 'low') {
          // Morning (7-9) and afternoon (14-16)
          shouldGreet = (hour >= 7 && hour <= 9 && minutes < 5) || (hour >= 14 && hour <= 16 && minutes < 5);
        }

        if (shouldGreet) {
          const msg = GREETING_MESSAGES[Math.floor(Math.random() * GREETING_MESSAGES.length)];
          setPetStatus({ state: 'notification', message: msg });
          setCooldown('lastGreetingTime', now);
          return;
        }
      }

      // === Work Rhythm Reminders ===
      if (
        now - cooldowns.lastScheduleNoticeTime > COOLDOWN_MS &&
        WORK_RHYTHM_MESSAGES[hour] &&
        minutes < 5
      ) {
        const msg = WORK_RHYTHM_MESSAGES[hour];
        setPetStatus({ state: 'thinking', message: msg });
        setCooldown('lastScheduleNoticeTime', now);
        return;
      }

      // === Inactivity Reminder (30 min) ===
      if (
        now - cooldowns.lastInactivityNoticeTime > COOLDOWN_MS &&
        now - lastActivityTime > 30 * 60 * 1000
      ) {
        setPetStatus({
          state: 'thinking',
          message: '👀 休息一下？已经 30 分钟没活动了~',
        });
        setCooldown('lastInactivityNoticeTime', now);
        return;
      }

      // === Gmail Unread Email Reminder (30 min cooldown) ===
      if (
        emailAccount &&
        now - cooldowns.lastEmailNoticeTime > COOLDOWN_MS
      ) {
        fetchGmailMessages(emailAccount.accessToken, 20)
          .then((messages) => {
            const unreadCount = (messages as GmailMessageSummary[]).filter(
              (m) => m.labelIds?.includes('UNREAD')
            ).length;
            if (unreadCount > 0) {
              const msg = `📧 You have ${unreadCount} unread email${unreadCount > 1 ? 's' : ''}!`;
              setPetMessage(msg);
              setPetStatus({ state: 'notification' });
              setCooldown('lastEmailNoticeTime', now);
            }
          })
          .catch(() => {
            // Silently ignore email fetch errors in background check
          });
      }

      // === Upcoming Calendar Event Reminder ===
      if (now - cooldowns.lastScheduleNoticeTime > 15 * 60 * 1000) {
        const in15Min = new Date(now + 15 * 60 * 1000);
        const in5Min = new Date(now + 5 * 60 * 1000);

        const upcomingEvent = events.find((e) => {
          const start = new Date(e.startTime);
          return start >= in5Min && start <= in15Min;
        });

        if (upcomingEvent) {
          setPetStatus({
            state: 'notification',
            message: `📅 "${upcomingEvent.title}" 将在 15 分钟内开始`,
          });
          setCooldown('lastScheduleNoticeTime', now);
        }
      }
    }, 60_000); // Check every minute

    // Run immediately on mount
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [petStatus.state, interactionSettings, cooldowns, lastActivityTime, events, emailAccount]);
}

export const MainPage: React.FC = () => {
  const activePanel = useStore((s) => s.activePanel);
  const setPetStatus = useStore((s) => s.setPetStatus);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const ActivePanelComponent = PANEL_COMPONENTS[activePanel] || ChatPanel;

  // Activate interaction engine
  useInteractionEngine();

  const handlePetClick = () => {
    setPetStatus({ state: 'idle' });
    // Switch to chat if not already there
    if (activePanel !== 'chat') {
      useStore.getState().setActivePanel('chat');
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden', bgcolor: 'rgba(10, 5, 20, 1)' }}>
      {/* Desktop sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile drawer */}
      {isMobile && (
        <>
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ position: 'fixed', top: 8, left: 8, zIndex: 1300, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            sx={{ '& .MuiDrawer-paper': { bgcolor: 'rgba(15, 10, 30, 0.98)', width: 200 } }}
          >
            <Sidebar />
          </Drawer>
        </>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          ml: isMobile ? 0 : '0 !important',
        }}
      >
        {/* Panel */}
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: isMobile ? '100%' : 480,
            mx: 'auto',
            width: '100%',
            bgcolor: 'rgba(15, 10, 30, 0.92)',
            borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,0.06)',
            borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.06)',
            // Layered background for depth
            backgroundImage: 'linear-gradient(180deg, rgba(20,10,40,0.3) 0%, rgba(15,10,30,0.95) 100%)',
          }}
        >
          {/* Top divider line */}
          <Box sx={{ height: 1, bgcolor: 'rgba(155, 127, 212, 0.15)' }} />
          <ActivePanelComponent />
        </Box>
      </Box>

      {/* Pixel Pet */}
      <CompanionCanvas />
    </Box>
  );
};

export default MainPage;
