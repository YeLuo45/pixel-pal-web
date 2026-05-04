import type { Scene, Action } from '../types/scene';
import { matchKeyword } from '../types/scene';
import { useSceneStore } from '../stores/sceneStore';

// Timer map: sceneId → timeoutId
const timerMap = new Map<string, ReturnType<typeof setTimeout>>();

function getNextTriggerTime(
  timeStr: string,
  repeat: 'daily' | 'weekdays' | 'weekends' | number[]
): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  const next = new Date(now);
  next.setHours(hours, minutes, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  if (repeat === 'weekdays') {
    while (next.getDay() === 0 || next.getDay() === 6) {
      next.setDate(next.getDate() + 1);
    }
  } else if (repeat === 'weekends') {
    while (next.getDay() !== 0 && next.getDay() !== 6) {
      next.setDate(next.getDate() + 1);
    }
  } else if (Array.isArray(repeat)) {
    while (!repeat.includes(next.getDay())) {
      next.setDate(next.getDate() + 1);
    }
  }

  return next;
}

function scheduleTimeTrigger(scene: Scene) {
  const existing = timerMap.get(scene.id);
  if (existing) clearTimeout(existing);

  const timeTrigger = scene.triggers.find((t) => t.type === 'time');
  if (!timeTrigger || timeTrigger.type !== 'time') return;

  const { time, repeat } = timeTrigger;
  const next = getNextTriggerTime(time, repeat);
  const delay = Math.max(0, next.getTime() - Date.now());

  const timeoutId = setTimeout(() => {
    executeScene(scene);
    if (scene.enabled) {
      scheduleTimeTrigger(scene);
    }
  }, delay);

  timerMap.set(scene.id, timeoutId);
}

// Callback set by ScenesPage to show toast — avoids circular React dependency in utils
let onSceneExecutedCallback: ((sceneName: string) => void) | null = null;
export function setOnSceneExecutedCallback(fn: (sceneName: string) => void) {
  onSceneExecutedCallback = fn;
}

export async function executeScene(scene: Scene) {
  if (!scene.enabled) return;

  for (let i = 0; i < scene.actions.length; i++) {
    const action = scene.actions[i];
    await executeAction(action);
    if (i < scene.actions.length - 1) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  if (onSceneExecutedCallback) {
    onSceneExecutedCallback(scene.name);
  } else {
    window.alert(`场景 "${scene.name}" 已执行`);
  }
}

async function executeAction(action: Action) {
  switch (action.type) {
    case 'sendMessage': {
      const { sendMessage } = await import('../store').then((m) => ({
        sendMessage: (m.useStore.getState() as any).sendMessage,
      }));
      if (sendMessage && (action.params as any).message) {
        sendMessage((action.params as any).message);
      }
      break;
    }
    case 'switchRole': {
      const { setPersona } = await import('../store').then((m) => ({
        setPersona: (m.useStore.getState() as any).setPersona,
      }));
      if (setPersona && (action.params as any).roleId) {
        setPersona((action.params as any).roleId);
      }
      break;
    }
    case 'speak': {
      if ((action.params as any).text && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance((action.params as any).text);
        window.speechSynthesis.speak(utterance);
      }
      break;
    }
    case 'notify': {
      if (Notification.permission === 'granted') {
        new Notification((action.params as any).title || 'PixelPal', { body: (action.params as any).body });
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification((action.params as any).title || 'PixelPal', { body: (action.params as any).body });
        }
      }
      break;
    }
  }
}

export function checkKeywordTrigger(message: string): Scene[] {
  const { scenes } = useSceneStore.getState();
  return scenes.filter(
    (s) =>
      s.enabled &&
      s.triggers.some(
        (t) => t.type === 'keyword' && matchKeyword(message, (t as any).pattern)
      )
  );
}

export function initSceneScheduler() {
  const { scenes } = useSceneStore.getState();
  for (const scene of scenes) {
    if (scene.enabled && scene.triggers.some((t) => t.type === 'time')) {
      scheduleTimeTrigger(scene);
    }
  }
}

export function scheduleScene(scene: Scene) {
  if (scene.enabled && scene.triggers.some((t) => t.type === 'time')) {
    scheduleTimeTrigger(scene);
  }
}

export function unscheduleScene(sceneId: string) {
  const existing = timerMap.get(sceneId);
  if (existing) {
    clearTimeout(existing);
    timerMap.delete(sceneId);
  }
}
