import { Router } from 'express';
import { getTodoById, getAllSettings } from '../db.js';

const router = Router();

async function sendTelegram(token, chatId, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.description || 'Telegram send failed');
  }
}

router.post('/:todoId/dispatch', async (req, res) => {
  const todo = getTodoById(req.params.todoId);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  const settings = getAllSettings();
  const channels = todo.reminder_channels || [];
  const message = `Напоминание: ${todo.title}\n${todo.note || ''}`.trim();
  const results = {};

  if (channels.includes('telegram') && settings.telegram_bot_token && settings.telegram_chat_id) {
    try {
      await sendTelegram(settings.telegram_bot_token, settings.telegram_chat_id, message);
      results.telegram = 'sent';
    } catch (err) {
      results.telegram = err.message;
    }
  }

  if (channels.includes('whatsapp') && settings.whatsapp_phone) {
    const phone = settings.whatsapp_phone.replace(/\D/g, '');
    results.whatsapp = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  if (channels.includes('email') && settings.email_address) {
    results.email = `mailto:${settings.email_address}?subject=${encodeURIComponent(`Напоминание: ${todo.title}`)}&body=${encodeURIComponent(message)}`;
  }

  if (channels.includes('calendar')) {
    const start = todo.reminder_at ? new Date(todo.reminder_at) : new Date();
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    results.google_calendar =
      `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(todo.title)}&details=${encodeURIComponent(todo.note || '')}&dates=${fmt(start)}/${fmt(end)}`;
  }

  res.json({ message, results });
});

export default router;
