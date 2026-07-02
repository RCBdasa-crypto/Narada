import { useEffect, useRef } from 'react';
import { dispatchReminder } from '../api';
import { getUploadUrl } from '../api';

export function useReminders(todos, settings) {
  const firedRef = useRef(new Set());

  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      for (const todo of todos) {
        if (!todo.reminder_at || todo.status !== 'active') continue;
        const due = new Date(todo.reminder_at);
        if (due > now) continue;
        if (firedRef.current.has(todo.id)) continue;

        firedRef.current.add(todo.id);
        const channels = todo.reminder_channels || [];

        if (channels.includes('sound')) {
          playSound(todo.reminder_sound, settings?.custom_ringtone);
          if (Notification.permission === 'granted') {
            new Notification(`Напоминание: ${todo.title}`, { body: todo.note || '' });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
          }
        }

        if (channels.some((c) => ['telegram', 'whatsapp', 'email', 'calendar'].includes(c))) {
          try {
            const result = await dispatchReminder(todo.id);
            if (result.results?.whatsapp) window.open(result.results.whatsapp, '_blank');
            if (result.results?.email) window.open(result.results.email, '_blank');
            if (result.results?.google_calendar) window.open(result.results.google_calendar, '_blank');
          } catch {
            /* ignore dispatch errors */
          }
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [todos, settings]);
}

function playSound(soundType, customFile) {
  try {
    const src =
      soundType === 'custom' && customFile
        ? getUploadUrl(customFile)
        : 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE=';
    const audio = new Audio(src);
    audio.play().catch(() => {});
  } catch {
    /* ignore */
  }
}
