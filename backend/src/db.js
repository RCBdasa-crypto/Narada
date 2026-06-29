import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '..', 'uploads');

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

const dbPath = path.join(dataDir, 'todos.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS attachments (
    id TEXT PRIMARY KEY,
    todo_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE
  );
`);

export { db, dataDir, uploadsDir };

export function getAllTodos() {
  const todos = db.prepare('SELECT * FROM todos ORDER BY updated_at DESC').all();
  const attachmentsStmt = db.prepare('SELECT * FROM attachments WHERE todo_id = ?');

  return todos.map((todo) => ({
    ...todo,
    attachments: attachmentsStmt.all(todo.id),
  }));
}

export function getTodoById(id) {
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  if (!todo) return null;

  const attachments = db
    .prepare('SELECT * FROM attachments WHERE todo_id = ?')
    .all(id);

  return { ...todo, attachments };
}

export function createTodo({ id, title, note, createdAt, updatedAt }) {
  db.prepare(
    'INSERT INTO todos (id, title, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, title, note, createdAt, updatedAt);

  return getTodoById(id);
}

export function updateTodo(id, { title, note, updatedAt }) {
  const existing = getTodoById(id);
  if (!existing) return null;

  db.prepare(
    'UPDATE todos SET title = ?, note = ?, updated_at = ? WHERE id = ?'
  ).run(title, note, updatedAt, id);

  return getTodoById(id);
}

export function deleteTodo(id) {
  const existing = getTodoById(id);
  if (!existing) return null;

  db.prepare('DELETE FROM attachments WHERE todo_id = ?').run(id);
  db.prepare('DELETE FROM todos WHERE id = ?').run(id);

  return existing;
}

export function addAttachment({ id, todoId, filename, originalName, mimeType, size, createdAt }) {
  db.prepare(
    `INSERT INTO attachments (id, todo_id, filename, original_name, mime_type, size, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, todoId, filename, originalName, mimeType, size, createdAt);

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

export function isImageMimeType(mimeType) {
  return typeof mimeType === 'string' && mimeType.startsWith('image/');
}
