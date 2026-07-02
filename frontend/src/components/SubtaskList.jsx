import { CheckIcon } from './Icons';
import { styleToCss } from '../utils/helpers';
import './SubtaskList.css';

export default function SubtaskList({ subtasks, compact, onToggle, onDelete }) {
  if (!subtasks?.length) return null;

  return (
    <ul className={`subtask-list ${compact ? 'compact' : ''}`}>
      {subtasks.map((subtask) => (
        <li key={subtask.id} className={subtask.completed ? 'completed' : ''}>
          <button
            type="button"
            className={`subtask-check ${subtask.completed ? 'checked' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.(subtask.id);
            }}
            aria-label={subtask.completed ? 'Снять отметку' : 'Отметить выполненной'}
          >
            {subtask.completed && <CheckIcon />}
          </button>
          <span className="subtask-title" style={styleToCss(subtask.title_style)}>
            {subtask.title}
          </span>
          {onDelete && (
            <button
              type="button"
              className="subtask-delete"
              onClick={() => onDelete(subtask.id)}
              aria-label="Удалить подзадачу"
            >
              ×
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
