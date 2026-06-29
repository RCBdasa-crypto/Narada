import { getUploadUrl } from '../api';
import { isImageAttachment, truncateText } from '../utils/helpers';
import './TodoList.css';

export default function TodoList({ todos, selectedId, onSelect, onDelete }) {
  if (!todos.length) {
    return <p className="muted">Пока нет записей. Создайте первую справа.</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className={`todo-item ${selectedId === todo.id ? 'selected' : ''}`}
        >
          <button
            type="button"
            className="todo-item-main"
            onClick={() => onSelect(todo.id)}
          >
            <div className="todo-item-content">
              <h3>{todo.title}</h3>
              <p>{truncateText(todo.note) || 'Без текста'}</p>
              {todo.attachments?.length > 0 && (
                <div className="attachment-previews">
                  {todo.attachments.map((attachment) =>
                    isImageAttachment(attachment) ? (
                      <img
                        key={attachment.id}
                        src={getUploadUrl(attachment.filename)}
                        alt={attachment.original_name}
                        className="attachment-thumb"
                        data-testid="image-preview"
                      />
                    ) : (
                      <span key={attachment.id} className="file-badge" data-testid="file-badge">
                        📎 {attachment.original_name}
                      </span>
                    )
                  )}
                </div>
              )}
            </div>
          </button>
          <button
            type="button"
            className="btn-danger todo-delete"
            onClick={() => onDelete(todo.id)}
            aria-label={`Удалить ${todo.title}`}
          >
            Удалить
          </button>
        </li>
      ))}
    </ul>
  );
}
