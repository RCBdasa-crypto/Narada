import { useState } from 'react';
import AttachmentLink, { AttachmentFileLabel, isImageForPreview } from './AttachmentLink';
import SubtaskList from './SubtaskList';
import StyleControls from './StyleControls';
import EmojiPicker from './EmojiPicker';
import VoiceRecorder from './VoiceRecorder';
import DrawingCanvas from './DrawingCanvas';
import ReminderPanel from './ReminderPanel';
import { getUploadUrl, getAttachmentUrl } from '../api';
import {
  displayFileName,
  formatFileSize,
  isAudioAttachment,
  isGifAttachment,
  styleToCss,
} from '../utils/helpers';
import './TodoForm.css';

export default function TodoForm({
  todo,
  folders,
  folderId,
  onSave,
  onRemoveAttachment,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) {
  const [title, setTitle] = useState(todo?.title || '');
  const [note, setNote] = useState(todo?.note || '');
  const [titleStyle, setTitleStyle] = useState(todo?.title_style || {});
  const [noteStyle, setNoteStyle] = useState(todo?.note_style || {});
  const [drawingData, setDrawingData] = useState(todo?.drawing_data || null);
  const [reminderAt, setReminderAt] = useState(todo?.reminder_at || null);
  const [reminderChannels, setReminderChannels] = useState(todo?.reminder_channels || []);
  const [reminderSound, setReminderSound] = useState(todo?.reminder_sound || 'default');
  const [selectedFolderId, setSelectedFolderId] = useState(todo?.folder_id || folderId || '');
  const [files, setFiles] = useState([]);
  const [voiceFile, setVoiceFile] = useState(null);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [subtaskStyle, setSubtaskStyle] = useState({});
  const [saving, setSaving] = useState(false);

  function insertEmoji(emoji, field) {
    if (field === 'title') setTitle((t) => t + emoji);
    else setNote((n) => n + emoji);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({
        title,
        note,
        folder_id: selectedFolderId || null,
        title_style: titleStyle,
        note_style: noteStyle,
        drawing_data: drawingData,
        reminder_at: reminderAt,
        reminder_channels: reminderChannels,
        reminder_sound: reminderSound,
        files,
        voiceFile,
      });
      if (!todo) {
        setTitle('');
        setNote('');
        setDrawingData(null);
      }
      setFiles([]);
      setVoiceFile(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSubtask(e) {
    if (e?.preventDefault) e.preventDefault();
    const t = subtaskTitle.trim();
    if (!t || !todo) return;
    await onAddSubtask(todo.id, t, subtaskStyle);
    setSubtaskTitle('');
    setSubtaskStyle({});
  }

  function handleReminderChange(patch) {
    if (patch.reminder_at !== undefined) setReminderAt(patch.reminder_at);
    if (patch.reminder_channels !== undefined) setReminderChannels(patch.reminder_channels);
    if (patch.reminder_sound !== undefined) setReminderSound(patch.reminder_sound);
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <label>
        Заголовок
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styleToCss(titleStyle)}
          placeholder="Например: Купить продукты"
          required
          data-testid="title-input"
        />
      </label>

      <StyleControls label="Стиль заголовка" style={titleStyle} onChange={setTitleStyle} />
      <EmojiPicker onPick={(e) => insertEmoji(e, 'title')} />

      <label>
        Текст заметки
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={styleToCss(noteStyle)}
          placeholder="Дополнительные детали..."
          rows={5}
          data-testid="note-input"
        />
      </label>

      <StyleControls label="Стиль заметки" style={noteStyle} onChange={setNoteStyle} />
      <EmojiPicker onPick={(e) => insertEmoji(e, 'note')} />

      {folders?.length > 0 && (
        <label>
          Папка
          <select
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
          >
            <option value="">Без папки</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </label>
      )}

      <ReminderPanel
        reminderAt={reminderAt}
        reminderChannels={reminderChannels}
        reminderSound={reminderSound}
        onChange={handleReminderChange}
      />

      <DrawingCanvas value={drawingData} onChange={setDrawingData} />

      <VoiceRecorder onRecorded={setVoiceFile} />
      {voiceFile && <p className="selected-files">Голос записан: {voiceFile.name}</p>}

      <label>
        Файлы, картинки, GIF, стикеры
        <input
          type="file"
          multiple
          accept="image/*,audio/*,.gif"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          data-testid="file-input"
        />
      </label>

      {files.length > 0 && (
        <p className="selected-files">Выбрано: {files.map((f) => f.name).join(', ')}</p>
      )}

      {todo?.subtasks?.length > 0 && (
        <div className="form-subtasks">
          <h3>Подзадачи</h3>
          <SubtaskList
            subtasks={todo.subtasks}
            onToggle={(id) => onToggleSubtask(todo.id, id)}
            onDelete={(id) => onDeleteSubtask(todo.id, id)}
          />
        </div>
      )}

      {todo && (
        <div className="subtask-add-row">
          <input
            value={subtaskTitle}
            onChange={(e) => setSubtaskTitle(e.target.value)}
            placeholder="Новая подзадача..."
          />
          <StyleControls label="Стиль" style={subtaskStyle} onChange={setSubtaskStyle} />
          <button type="button" className="btn-secondary" onClick={handleAddSubtask}>
            Добавить
          </button>
        </div>
      )}

      {todo?.attachments?.length > 0 && (
        <div className="existing-attachments">
          <h3>Вложения</h3>
          <ul>
            {todo.attachments.map((attachment) => (
              <li key={attachment.id}>
                {isImageForPreview(attachment) || isGifAttachment(attachment) ? (
                  <AttachmentLink todoId={todo.id} attachment={attachment} className="form-attachment-link">
                    <img
                      src={getUploadUrl(attachment.filename)}
                      alt={attachment.original_name}
                      className="form-preview"
                    />
                  </AttachmentLink>
                ) : isAudioAttachment(attachment) ? (
                  <audio controls src={getAttachmentUrl(todo.id, attachment.id)} />
                ) : (
                  <AttachmentLink todoId={todo.id} attachment={attachment}>
                    <AttachmentFileLabel attachment={attachment} />
                  </AttachmentLink>
                )}
                <span className="file-size">{formatFileSize(attachment.size)}</span>
                <button
                  type="button"
                  className="btn-danger small"
                  onClick={() => onRemoveAttachment(todo.id, attachment.id)}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={saving} data-testid="save-button">
        {saving ? 'Сохранение...' : todo ? 'Сохранить изменения' : 'Создать запись'}
      </button>
    </form>
  );
}
