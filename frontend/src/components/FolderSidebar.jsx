import { useState } from 'react';
import { VIEW } from '../utils/helpers';
import './FolderSidebar.css';

export default function FolderSidebar({
  folders,
  currentView,
  currentFolderId,
  onSelectView,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}) {
  const [newFolderName, setNewFolderName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    const name = newFolderName.trim();
    if (!name) return;
    await onCreateFolder(name);
    setNewFolderName('');
  }

  async function saveRename(id) {
    const name = editName.trim();
    if (name) await onRenameFolder(id, name);
    setEditingId(null);
  }

  return (
    <aside className="folder-sidebar">
      <h2 className="sidebar-title">Папки</h2>

      <nav className="folder-nav">
        <button
          type="button"
          className={currentView === VIEW.ALL ? 'active' : ''}
          onClick={() => onSelectView(VIEW.ALL)}
        >
          📋 Все дела
        </button>
        <button
          type="button"
          className={currentView === VIEW.COMPLETED ? 'active' : ''}
          onClick={() => onSelectView(VIEW.COMPLETED)}
        >
          🏁 Выполненные
        </button>
        <button
          type="button"
          className={currentView === VIEW.DELETED ? 'active' : ''}
          onClick={() => onSelectView(VIEW.DELETED)}
        >
          🗑 Удалённые
        </button>

        <div className="folder-divider" />

        {folders.map((folder) => (
          <div key={folder.id} className="folder-row">
            {editingId === folder.id ? (
              <input
                className="folder-edit-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => saveRename(folder.id)}
                onKeyDown={(e) => e.key === 'Enter' && saveRename(folder.id)}
                autoFocus
              />
            ) : (
              <button
                type="button"
                className={
                  currentView === VIEW.FOLDER && currentFolderId === folder.id ? 'active' : ''
                }
                onClick={() => onSelectFolder(folder.id)}
                onDoubleClick={() => {
                  setEditingId(folder.id);
                  setEditName(folder.name);
                }}
              >
                📁 {folder.name}
              </button>
            )}
            <button
              type="button"
              className="folder-delete-btn"
              onClick={() => onDeleteFolder(folder.id)}
              title="Удалить папку"
            >
              ×
            </button>
          </div>
        ))}
      </nav>

      <form className="folder-create" onSubmit={handleCreate}>
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="Новая папка..."
        />
        <button type="submit" className="btn-secondary small">+</button>
      </form>
    </aside>
  );
}
