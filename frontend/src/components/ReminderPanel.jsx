import './ReminderPanel.css';

const CHANNELS = [
  { id: 'sound', label: '🔔 Звуковой сигнал' },
  { id: 'telegram', label: '✈️ Telegram' },
  { id: 'whatsapp', label: '💬 WhatsApp' },
  { id: 'email', label: '📧 Email' },
  { id: 'calendar', label: '📅 Google / другие календари' },
];

export default function ReminderPanel({ reminderAt, reminderChannels, reminderSound, onChange }) {
  const channels = reminderChannels || [];

  function toggleChannel(id) {
    const next = channels.includes(id) ? channels.filter((c) => c !== id) : [...channels, id];
    onChange({ reminder_channels: next });
  }

  return (
    <div className="reminder-panel">
      <label>
        Напоминание
        <input
          type="datetime-local"
          value={reminderAt ? reminderAt.slice(0, 16) : ''}
          onChange={(e) =>
            onChange({
              reminder_at: e.target.value ? new Date(e.target.value).toISOString() : null,
            })
          }
        />
      </label>

      <fieldset className="reminder-channels">
        <legend>Способ напоминания</legend>
        {CHANNELS.map((ch) => (
          <label key={ch.id} className="channel-check">
            <input
              type="checkbox"
              checked={channels.includes(ch.id)}
              onChange={() => toggleChannel(ch.id)}
            />
            {ch.label}
          </label>
        ))}
      </fieldset>

      <label>
        Рингтон
        <select
          value={reminderSound || 'default'}
          onChange={(e) => onChange({ reminder_sound: e.target.value })}
        >
          <option value="default">По умолчанию</option>
          <option value="custom">Свой (загрузите в настройках)</option>
        </select>
      </label>
    </div>
  );
}
