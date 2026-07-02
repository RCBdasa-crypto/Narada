import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

const dbPath = path.join(dataDir, 'todos.db');
const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active',
    folder_id TEXT,
    title_style TEXT NOT NULL DEFAULT '{}',
    note_style TEXT NOT NULL DEFAULT '{}',
    drawing_data TEXT,
    reminder_at TEXT,
    reminder_channels TEXT NOT NULL DEFAULT '[]',
    reminder_sound TEXT NOT NULL DEFAULT 'default',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS subtasks (
    id TEXT PRIMARY KEY,
    todo_id TEXT NOT NULL,
    title TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    title_style TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    todo_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    kind TEXT NOT NULL DEFAULT 'file',
    created_at TEXT NOT NULL,
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

function migrate() {
  const todoCols = db.prepare('PRAGMA table_info(todos)').all().map((c) => c.name);
  const migrations = [
    ['status', "ALTER TABLE todos ADD COLUMN status TEXT NOT NULL DEFAULT 'active'"],
    ['folder_id', 'ALTER TABLE todos ADD COLUMN folder_id TEXT'],
    ['title_style', "ALTER TABLE todos ADD COLUMN title_style TEXT NOT NULL DEFAULT '{}'"],
    ['note_style', "ALTER TABLE todos ADD COLUMN note_style TEXT NOT NULL DEFAULT '{}'"],
    ['drawing_data', 'ALTER TABLE todos ADD COLUMN drawing_data TEXT'],
    ['reminder_at', 'ALTER TABLE todos ADD COLUMN reminder_at TEXT'],
    ['reminder_channels', "ALTER TABLE todos ADD COLUMN reminder_channels TEXT NOT NULL DEFAULT '[]'"],
    ['reminder_sound', "ALTER TABLE todos ADD COLUMN reminder_sound TEXT NOT NULL DEFAULT 'default'"],
  ];
  for (const [col, sql] of migrations) {
    if (!todoCols.includes(col)) db.exec(sql);
  }

  const attCols = db.prepare('PRAGMA table_info(attachments)').all().map((c) => c.name);
  if (!attCols.includes('kind')) {
    db.exec("ALTER TABLE attachments ADD COLUMN kind TEXT NOT NULL DEFAULT 'file'");
  }
}

migrate();

function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function enrichTodo(todo) {
  if (!todo) return null;
  return {
    ...todo,
    title_style: parseJson(todo.title_style, {}),
    note_style: parseJson(todo.note_style, {}),
    reminder_channels: parseJson(todo.reminder_channels, []),
    subtasks: getSubtasksByTodoId(todo.id),
    attachments: getAttachmentsByTodoId(todo.id),
  };
}

export { db, dataDir, uploadsDir };

export function getAttachmentsByTodoId(todoId) {
  return db.prepare('SELECT * FROM attachments WHERE todo_id = ? ORDER BY created_at').all(todoId);
}

export function getSubtasksByTodoId(todoId) {
  return db
    .prepare('SELECT * FROM subtasks WHERE todo_id = ? ORDER BY sort_order, created_at')
    .all(todoId)
    .map((s) => ({
      ...s,
      completed: Boolean(s.completed),
      title_style: parseJson(s.title_style, {}),
    }));
}

export function getAllTodos({ status, folderId } = {}) {
  let sql = 'SELECT * FROM todos WHERE 1=1';
  const params = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (folderId) {
    sql += ' AND folder_id = ?';
    params.push(folderId);
  }

  sql += ' ORDER BY updated_at DESC';
  return db.prepare(sql).all(...params).map(enrichTodo);
}

export function getTodoById(id) {
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  return enrichTodo(todo);
}

export function createTodo({
  id,
  title,
  note,
  folderId,
  titleStyle,
  noteStyle,
  drawingData,
  reminderAt,
  reminderChannels,
  reminderSound,
  createdAt,
  updatedAt,
}) {
  db.prepare(
    `INSERT INTO todos (
      id, title, note, status, folder_id, title_style, note_style, drawing_data,
      reminder_at, reminder_channels, reminder_sound, created_at, updated_at
    ) VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    title,
    note || '',
    folderId || null,
    JSON.stringify(titleStyle || {}),
    JSON.stringify(noteStyle || {}),
    drawingData || null,
    reminderAt || null,
    JSON.stringify(reminderChannels || []),
    reminderSound || 'default',
    createdAt,
    updatedAt
  );
  return getTodoById(id);
}

export function updateTodo(id, fields) {
  const existing = getTodoById(id);
  if (!existing) return null;

  const title = fields.title !== undefined ? fields.title : existing.title;
  const note = fields.note !== undefined ? fields.note : existing.note;
  const folderId = fields.folderId !== undefined ? fields.folderId : existing.folder_id;
  const titleStyle = fields.titleStyle !== undefined ? fields.titleStyle : existing.title_style;
  const noteStyle = fields.noteStyle !== undefined ? fields.noteStyle : existing.note_style;
  const drawingData = fields.drawingData !== undefined ? fields.drawingData : existing.drawing_data;
  const reminderAt = fields.reminderAt !== undefined ? fields.reminderAt : existing.reminder_at;
  const reminderChannels =
    fields.reminderChannels !== undefined ? fields.reminderChannels : existing.reminder_channels;
  const reminderSound =
    fields.reminderSound !== undefined ? fields.reminderSound : existing.reminder_sound;
  const updatedAt = fields.updatedAt || new Date().toISOString();

  db.prepare(
    `UPDATE todos SET title = ?, note = ?, folder_id = ?, title_style = ?, note_style = ?,
     drawing_data = ?, reminder_at = ?, reminder_channels = ?, reminder_sound = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    title,
    note,
    folderId || null,
    JSON.stringify(titleStyle || {}),
    JSON.stringify(noteStyle || {}),
    drawingData || null,
    reminderAt || null,
    JSON.stringify(reminderChannels || []),
    reminderSound || 'default',
    updatedAt,
    id
  );

  return getTodoById(id);
}

export function setTodoStatus(id, status) {
  const existing = getTodoById(id);
  if (!existing) return null;
  db.prepare('UPDATE todos SET status = ?, updated_at = ? WHERE id = ?').run(
    status,
    new Date().toISOString(),
    id
  );
  return getTodoById(id);
}

export function deleteTodoPermanently(id) {
  const existing = getTodoById(id);
  if (!existing) return null;

  db.prepare('DELETE FROM attachments WHERE todo_id = ?').run(id);
  db.prepare('DELETE FROM subtasks WHERE todo_id = ?').run(id);
  db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  return existing;
}

export function addAttachment({
  id,
  todoId,
  filename,
  originalName,
  mimeType,
  size,
  kind,
  createdAt,
}) {
  db.prepare(
    `INSERT INTO attachments (id, todo_id, filename, original_name, mime_type, size, kind, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, todoId, filename, originalName, mimeType, size, kind || 'file', createdAt);
  return db.prepare('SELECT * FROM attachments WHERE id = ?').get(id);
}

export function getAttachmentById(id) {
  return db.prepare('SELECT * FROM attachments WHERE id = ?').get(id);
}

export function deleteAttachment(id) {
  const attachment = getAttachmentById(id);
  if (!attachment) return null;
  db.prepare('DELETE FROM attachments WHERE id = ?').run(id);
  return attachment;
}

export function createSubtask({ id, todoId, title, sortOrder, titleStyle, createdAt }) {
  db.prepare(
    `INSERT INTO subtasks (id, todo_id, title, completed, sort_order, title_style, created_at)
     VALUES (?, ?, ?, 0, ?, ?, ?)`
  ).run(id, todoId, title, sortOrder ?? 0, JSON.stringify(titleStyle || {}), createdAt);
  return getSubtaskById(id);
}

export function getSubtaskById(id) {
  const row = db.prepare('SELECT * FROM subtasks WHERE id = ?').get(id);
  if (!row) return null;
  return {
    ...row,
    completed: Boolean(row.completed),
    title_style: parseJson(row.title_style, {}),
  };
}

export function updateSubtask(id, { title, titleStyle, sortOrder }) {
  const existing = getSubtaskById(id);
  if (!existing) return null;
  db.prepare(
    'UPDATE subtasks SET title = ?, title_style = ?, sort_order = ? WHERE id = ?'
  ).run(
    title ?? existing.title,
    JSON.stringify(titleStyle ?? existing.title_style),
    sortOrder ?? existing.sort_order,
    id
  );
  return getSubtaskById(id);
}

export function toggleSubtask(id) {
  const existing = getSubtaskById(id);
  if (!existing) return null;
  const completed = existing.completed ? 0 : 1;
  db.prepare('UPDATE subtasks SET completed = ? WHERE id = ?').run(completed, id);
  db.prepare('UPDATE todos SET updated_at = ? WHERE id = ?').run(
    new Date().toISOString(),
    existing.todo_id
  );
  return getSubtaskById(id);
}

export function deleteSubtask(id) {
  const existing = getSubtaskById(id);
  if (!existing) return null;
  db.prepare('DELETE FROM subtasks WHERE id = ?').run(id);
  return existing;
}

export function getAllFolders() {
  return db.prepare('SELECT * FROM folders ORDER BY sort_order, created_at').all();
}

export function getFolderById(id) {
  return db.prepare('SELECT * FROM folders WHERE id = ?').get(id);
}

export function createFolder({ id, name, sortOrder, createdAt }) {
  db.prepare(
    'INSERT INTO folders (id, name, sort_order, created_at) VALUES (?, ?, ?, ?)'
  ).run(id, name, sortOrder ?? 0, createdAt);
  return getFolderById(id);
}

export function updateFolder(id, { name, sortOrder }) {
  const existing = getFolderById(id);
  if (!existing) return null;
  db.prepare('UPDATE folders SET name = ?, sort_order = ? WHERE id = ?').run(
    name ?? existing.name,
    sortOrder ?? existing.sort_order,
    id
  );
  return getFolderById(id);
}

export function deleteFolder(id) {
  const existing = getFolderById(id);
  if (!existing) return null;
  db.prepare('UPDATE todos SET folder_id = NULL WHERE folder_id = ?').run(id);
  db.prepare('DELETE FROM folders WHERE id = ?').run(id);
  return existing;
}

export function getAllSettings() {
  const rows = db.prepare('SELECT key, value FROM app_settings').all();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function getSetting(key) {
  const row = db.prepare('SELECT value FROM app_settings WHERE key = ?').get(key);
  return row?.value ?? null;
}

export function setSettings(settings) {
  const stmt = db.prepare(
    'INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  );
  for (const [key, value] of Object.entries(settings)) {
    stmt.run(key, String(value ?? ''));
  }
  return getAllSettings();
}

export function getDueReminders(nowIso) {
  return db
    .prepare(
      `SELECT * FROM todos
       WHERE reminder_at IS NOT NULL AND reminder_at <= ? AND status = 'active'`
    )
    .all(nowIso)
    .map(enrichTodo);
}

export function isImageMimeType(mimeType) {
  return typeof mimeType === 'string' && mimeType.startsWith('image/');
}

export function isAudioMimeType(mimeType) {
  return typeof mimeType === 'string' && mimeType.startsWith('audio/');
}
