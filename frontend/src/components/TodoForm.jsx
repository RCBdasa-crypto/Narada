import { useState } from 'react';
import { getUploadUrl } from '../api';
import { formatFileSize, isImageAttachment } from '../utils/helpers';
import './TodoForm.css';

export default function TodoForm({ todo, onSave, onRemoveAttachment }) {
  const [title, setTitle] = useState(todo?.title || '');
  const [note, setNote] = useState(todo?.note || '');
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ title, note, files });
      if (!todo) {
        setTitle('');
        setNote('');
      }
      setFiles([]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <label>
        Заголовок
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: Купить продукты"
          required
          data-testid="title-input"
        />
      </label>

      <label>
        Текст заметки
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Дополнительные детали..."
          rows={5}
          data-testid="note-input"
        />
      </label>

      <label>
        Прикрепить файлы или картинки
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          data-testid="file-input"
        />
      </label>

      {files.length > 0 && (
        <p className="selected-files">
          Выбрано файлов: {files.map((f) => f.name).join(', ')}
        </p>
      )}

      {todo?.attachments?.length > 0 && (
        <div className="existing-attachments">
          <h3>Текущие вложения</h3>
          <ul>
            {todo.attachments.map((attachment) => (
              <li key={attachment.id}>
                {isImageAttachment(attachment) ? (
                  <img
                    src={getUploadUrl(attachment.filename)}
                    alt={attachment.original_name}
                    className="form-preview"
                  />
                ) : (
                  <span>📎 {attachment.original_name}</span>
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
