import { useState } from 'react';
import { TrashIcon, FlagIcon } from './Icons';
import AttachmentLink, { AttachmentFileLabel, isImageForPreview } from './AttachmentLink';
import SubtaskList from './SubtaskList';
import { getUploadUrl } from '../api';
import { styleToCss, truncateText } from '../utils/helpers';
import './TodoList.css';

export default function TodoList({
  todos,
  selectedId,
  view,
  onSelect,
  onComplete,
  onTrash,
  onPermanentDelete,
  onToggleSubtask,
}) {
  if (!todos.length) {
    const empty = {
      all: 'Пока нет записей. Создайте первую справа.',
      completed: 'Нет выполненных задач.',
      deleted: 'Корзина пуста.',
      folder: 'В этой папке пока нет задач.',
    };
    return <p className="muted">{empty[view] || empty.all}</p>;
  }

  const isDeletedView = view === 'deleted';

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li
          key={todo.id}
          className={`todo-item ${selectedId === todo.id ? 'selected' : ''}`}
        >
          <div className="todo-item-actions">
            {!isDeletedView && (
              <button
                type="button"
                className="icon-btn icon-btn-flag"
                onClick={() => onComplete(todo.id)}
                title="Выполнено"
                aria-label={`Отметить выполненной: ${todo.title}`}
              >
                <FlagIcon />
              </button>
            )}
            <button
              type="button"
              className="icon-btn icon-btn-trash"
              onClick={() => (isDeletedView ? onPermanentDelete(todo.id) : onTrash(todo.id))}
              title={isDeletedView ? 'Удалить навсегда' : 'В корзину'}
              aria-label={
                isDeletedView ? `Удалить навсегда: ${todo.title}` : `В корзину: ${todo.title}`
              }
            >
              <TrashIcon />
            </button>
          </div>

          <button
            type="button"
            className="todo-item-main"
            onClick={() => onSelect(todo.id)}
          >
            <div className="todo-item-content">
              <h3 style={styleToCss(todo.title_style)}>{todo.title}</h3>
              <p style={styleToCss(todo.note_style)}>
                {truncateText(todo.note) || 'Без текста'}
              </p>

              {todo.subtasks?.length > 0 && (
                <SubtaskList
                  subtasks={todo.subtasks}
                  compact
                  onToggle={(subtaskId) => onToggleSubtask(todo.id, subtaskId)}
                />
              )}

              {todo.attachments?.length > 0 && (
                <div className="attachment-previews">
                  {todo.attachments.map((attachment) =>
                    isImageForPreview(attachment) ? (
                      <AttachmentLink
                        key={attachment.id}
                        todoId={todo.id}
                        attachment={attachment}
                        className="attachment-thumb-link"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={getUploadUrl(attachment.filename)}
                          alt={attachment.original_name}
                          className="attachment-thumb"
                          data-testid="image-preview"
                        />
                      </AttachmentLink>
                    ) : (
                      <AttachmentLink
                        key={attachment.id}
                        todoId={todo.id}
                        attachment={attachment}
                        className="file-badge"
                        onClick={(e) => e.stopPropagation()}
                        data-testid="file-badge"
                      >
                        <AttachmentFileLabel attachment={attachment} />
                      </AttachmentLink>
                    )
                  )}
                </div>
              )}

              {todo.drawing_data && (
                <img src={todo.drawing_data} alt="Рисунок" className="todo-drawing-preview" />
              )}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
