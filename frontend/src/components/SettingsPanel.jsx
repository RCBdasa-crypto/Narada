import { useState, useEffect } from 'react';
import { fetchSettings, updateSettings, uploadRingtone } from '../api';
import './SettingsPanel.css';

export default function SettingsPanel({ open, onClose }) {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (open) {
      fetchSettings().then(setSettings).catch(() => {});
    }
  }, [open]);

  if (!open) return null;

  async function save() {
    setSaving(true);
    setMessage('');
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      setMessage('Сохранено');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRingtone(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadRingtone(file);
    setSettings((s) => ({ ...s, custom_ringtone: result.ringtone }));
    setMessage('Рингтон загружен');
  }

  function set(key, value) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <h2>Настройки синхронизации</h2>
        <p className="settings-hint">
          Для Telegram создайте бота через @BotFather и укажите токен и chat_id.
          WhatsApp откроется с готовым текстом. Календарь — ссылка на Google Calendar.
        </p>

        <label>
          Telegram Bot Token
          <input
            type="password"
            value={settings.telegram_bot_token || ''}
            onChange={(e) => set('telegram_bot_token', e.target.value)}
          />
        </label>
        <label>
          Telegram Chat ID
          <input
            value={settings.telegram_chat_id || ''}
            onChange={(e) => set('telegram_chat_id', e.target.value)}
          />
        </label>
        <label>
          WhatsApp (телефон с кодом страны)
          <input
            value={settings.whatsapp_phone || ''}
            onChange={(e) => set('whatsapp_phone', e.target.value)}
            placeholder="+79001234567"
          />
        </label>
        <label>
          Email для напоминаний
          <input
            type="email"
            value={settings.email_address || ''}
            onChange={(e) => set('email_address', e.target.value)}
          />
        </label>
        <label>
          Свой рингтон (MP3, WAV)
          <input type="file" accept="audio/*" onChange={handleRingtone} />
        </label>

        <div className="settings-actions">
          <button type="button" className="btn-primary" onClick={save} disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Закрыть
          </button>
        </div>
        {message && <p className="settings-msg">{message}</p>}
      </div>
    </div>
  );
}
