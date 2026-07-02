import { useState, useEffect, useCallback } from 'react';
import './App.css';
import FolderSidebar from './components/FolderSidebar';
import TodoList from './components/TodoList';
import TodoForm from './components/TodoForm';
import SettingsPanel from './components/SettingsPanel';
import { useReminders } from './hooks/useReminders';
import { VIEW } from './utils/helpers';
import {
  fetchTodos,
  fetchFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  createTodo,
  updateTodo,
  setTodoStatus,
  deleteTodoPermanently,
  uploadAttachment,
  deleteAttachment,
  createSubtask,
  toggleSubtask,
  deleteSubtask,
  fetchSettings,
} from './api';

const APP_VERSION = '1.1.0';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [settings, setSettings] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [currentView, setCurrentView] = useState(VIEW.ALL);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const selectedTodo = todos.find((t) => t.id === selectedId) || null;

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let data;
      if (currentView === VIEW.COMPLETED) {
        data = await fetchTodos({ status: 'completed' });
      } else if (currentView === VIEW.DELETED) {
        data = await fetchTodos({ status: 'deleted' });
      } else if (currentView === VIEW.FOLDER && currentFolderId) {
        data = await fetchTodos({ status: 'active', folderId: currentFolderId });
      } else {
        data = await fetchTodos({ status: 'active' });
      }
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentView, currentFolderId]);

  async function loadFolders() {
    try {
      setFolders(await fetchFolders());
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  useEffect(() => {
    loadFolders();
    fetchSettings().then(setSettings).catch(() => {});
  }, []);

  useReminders(todos, settings);

  async function handleSave(payload) {
    setError('');
    try {
      const body = {
        title: payload.title,
        note: payload.note,
        folder_id: payload.folder_id,
        title_style: payload.title_style,
        note_style: payload.note_style,
        drawing_data: payload.drawing_data,
        reminder_at: payload.reminder_at,
        reminder_channels: payload.reminder_channels,
        reminder_sound: payload.reminder_sound,
      };

      let todo;
      if (selectedTodo) {
        todo = await updateTodo(selectedTodo.id, body);
      } else {
        todo = await createTodo(body);
      }

      const upload = async (file, kind) => {
        const name = file.name.toLowerCase();
        let k = kind;
        if (!k) {
          if (file.type.startsWith('audio/')) k = 'voice';
          else if (name.endsWith('.gif')) k = 'gif';
          else if (file.type.startsWith('image/')) k = 'sticker';
          else k = 'file';
        }
        await uploadAttachment(todo.id, file, k);
      };

      if (payload.files?.length) {
        for (const file of payload.files) await upload(file);
      }
      if (payload.voiceFile) await upload(payload.voiceFile, 'voice');

      await loadTodos();
      setSelectedId(todo.id);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleTrash(id) {
    setError('');
    try {
      await setTodoStatus(id, 'deleted');
      if (selectedId === id) setSelectedId(null);
      await loadTodos();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleComplete(id) {
    setError('');
    try {
      await setTodoStatus(id, 'completed');
      if (selectedId === id) setSelectedId(null);
      await loadTodos();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePermanentDelete(id) {
    setError('');
    try {
      await deleteTodoPermanently(id);
      if (selectedId === id) setSelectedId(null);
      await loadTodos();
    } catch (err) {
      setError(err.message);
    }
  }

  function handleSelectView(view) {
    setCurrentView(view);
    setCurrentFolderId(null);
    setSelectedId(null);
  }

  function handleSelectFolder(folderId) {
    setCurrentView(VIEW.FOLDER);
    setCurrentFolderId(folderId);
    setSelectedId(null);
  }

  const listTitle = {
    [VIEW.ALL]: 'Мои дела',
    [VIEW.COMPLETED]: 'Выполненные',
    [VIEW.DELETED]: 'Удалённые',
    [VIEW.FOLDER]: folders.find((f) => f.id === currentFolderId)?.name || 'Папка',
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Narada</h1>
        <p>To-Do лист с заметками и вложениями · v{APP_VERSION}</p>
        <button type="button" className="btn-secondary settings-btn" onClick={() => setSettingsOpen(true)}>
          ⚙️ Настройки
        </button>
      </header>

      {error && <div className="error-banner" role="alert">{error}</div>}

      <main className="app-layout">
        <FolderSidebar
          folders={folders}
          currentView={currentView}
          currentFolderId={currentFolderId}
          onSelectView={handleSelectView}
          onSelectFolder={handleSelectFolder}
          onCreateFolder={async (name) => { await createFolder(name); await loadFolders(); }}
          onRenameFolder={async (id, name) => { await updateFolder(id, { name }); await loadFolders(); }}
          onDeleteFolder={async (id) => { await deleteFolder(id); if (currentFolderId === id) handleSelectView(VIEW.ALL); await loadFolders(); }}
        />

        <section className="panel list-panel">
          <div className="panel-header">
            <h2>{listTitle[currentView]}</h2>
            {currentView === VIEW.ALL && (
              <button type="button" className="btn-secondary" onClick={() => setSelectedId(null)}>
                + Новая запись
              </button>
            )}
          </div>
          {loading ? (
            <p className="muted">Загрузка...</p>
          ) : (
            <TodoList
              todos={todos}
              selectedId={selectedId}
              view={currentView}
              onSelect={setSelectedId}
              onComplete={handleComplete}
              onTrash={handleTrash}
              onPermanentDelete={handlePermanentDelete}
              onToggleSubtask={async (todoId, subtaskId) => {
                await toggleSubtask(todoId, subtaskId);
                await loadTodos();
              }}
            />
          )}
        </section>

        <section className="panel form-panel">
          <h2>{selectedTodo ? 'Редактирование' : 'Новая запись'}</h2>
          {(currentView === VIEW.ALL || currentView === VIEW.FOLDER || selectedTodo) && (
            <TodoForm
              key={selectedTodo?.id || `new-${currentFolderId}`}
              todo={selectedTodo}
              folders={folders}
              folderId={currentFolderId}
              onSave={handleSave}
              onRemoveAttachment={async (todoId, attId) => {
                await deleteAttachment(todoId, attId);
                await loadTodos();
              }}
              onAddSubtask={async (todoId, title, style) => {
                await createSubtask(todoId, title, style);
                await loadTodos();
              }}
              onToggleSubtask={async (todoId, subtaskId) => {
                await toggleSubtask(todoId, subtaskId);
                await loadTodos();
              }}
              onDeleteSubtask={async (todoId, subtaskId) => {
                await deleteSubtask(todoId, subtaskId);
                await loadTodos();
              }}
            />
          )}
          {currentView === VIEW.COMPLETED && !selectedTodo && (
            <p className="muted">Выберите задачу для просмотра</p>
          )}
          {currentView === VIEW.DELETED && !selectedTodo && (
            <p className="muted">Выберите задачу в корзине. 🗑 — удалить навсегда.</p>
          )}
        </section>
      </main>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
