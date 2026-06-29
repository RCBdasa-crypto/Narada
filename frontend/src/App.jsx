import { useState, useEffect } from 'react';
import './App.css';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  uploadAttachment,
  deleteAttachment,
} from './api';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedTodo = todos.find((todo) => todo.id === selectedId) || null;

  async function loadTodos() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTodos();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTodos();
  }, []);

  async function handleSave({ title, note, files }) {
    setError('');
    try {
      let todo;
      if (selectedTodo) {
        todo = await updateTodo(selectedTodo.id, { title, note });
      } else {
        todo = await createTodo({ title, note });
      }

      if (files?.length) {
        for (const file of files) {
          todo = await uploadAttachment(todo.id, file);
        }
      }

      await loadTodos();
      setSelectedId(todo.id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await deleteTodo(id);
      if (selectedId === id) setSelectedId(null);
      await loadTodos();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveAttachment(todoId, attachmentId) {
    setError('');
    try {
      await deleteAttachment(todoId, attachmentId);
      await loadTodos();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Narada</h1>
        <p>To-Do лист с заметками и вложениями</p>
      </header>

      {error && <div className="error-banner" role="alert">{error}</div>}

      <main className="app-layout">
        <section className="panel list-panel">
          <div className="panel-header">
            <h2>Мои дела</h2>
            <button type="button" className="btn-secondary" onClick={() => setSelectedId(null)}>
              + Новая запись
            </button>
          </div>
          {loading ? (
            <p className="muted">Загрузка...</p>
          ) : (
            <TodoList
              todos={todos}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={handleDelete}
            />
          )}
        </section>

        <section className="panel form-panel">
          <h2>{selectedTodo ? 'Редактирование' : 'Новая запись'}</h2>
          <TodoForm
            key={selectedTodo?.id || 'new'}
            todo={selectedTodo}
            onSave={handleSave}
            onRemoveAttachment={handleRemoveAttachment}
          />
        </section>
      </main>
    </div>
  );
}
