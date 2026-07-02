import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  setTodoStatus,
  deleteTodoPermanently,
  addAttachment,
  getAttachmentById,
  deleteAttachment,
  createSubtask,
  getSubtaskById,
  updateSubtask,
  toggleSubtask,
  deleteSubtask,
  uploadsDir,
} from '../db.js';
import {
  resolveOriginalName,
  fixMojibakeFilename,
  contentDispositionInline,
} from '../filename.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

function withFixedAttachmentNames(todo) {
  if (!todo?.attachments?.length) return todo;
  return {
    ...todo,
    attachments: todo.attachments.map((attachment) => ({
      ...attachment,
      original_name: fixMojibakeFilename(attachment.original_name),
    })),
  };
}

function sendTodo(res, todo, status = 200) {
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  return res.status(status).json(withFixedAttachmentNames(todo));
}

router.get('/', (req, res) => {
  const { status, folder_id: folderId } = req.query;
  const todos = getAllTodos({
    status: status || undefined,
    folderId: folderId || undefined,
  }).map(withFixedAttachmentNames);
  res.json(todos);
});

router.post('/', (req, res) => {
  const title = (req.body.title || '').trim();
  const note = (req.body.note || '').trim();
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const now = new Date().toISOString();
  const todo = createTodo({
    id: uuidv4(),
    title,
    note,
    folderId: req.body.folder_id || req.body.folderId || null,
    titleStyle: req.body.title_style || req.body.titleStyle || {},
    noteStyle: req.body.note_style || req.body.noteStyle || {},
    drawingData: req.body.drawing_data || req.body.drawingData || null,
    reminderAt: req.body.reminder_at || req.body.reminderAt || null,
    reminderChannels: req.body.reminder_channels || req.body.reminderChannels || [],
    reminderSound: req.body.reminder_sound || req.body.reminderSound || 'default',
    createdAt: now,
    updatedAt: now,
  });

  sendTodo(res, todo, 201);
});

router.get('/:id', (req, res) => {
  sendTodo(res, getTodoById(req.params.id));
});

router.put('/:id', (req, res) => {
  const title = (req.body.title || '').trim();
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const todo = updateTodo(req.params.id, {
    title,
    note: (req.body.note || '').trim(),
    folderId: req.body.folder_id ?? req.body.folderId,
    titleStyle: req.body.title_style ?? req.body.titleStyle,
    noteStyle: req.body.note_style ?? req.body.noteStyle,
    drawingData: req.body.drawing_data ?? req.body.drawingData,
    reminderAt: req.body.reminder_at ?? req.body.reminderAt,
    reminderChannels: req.body.reminder_channels ?? req.body.reminderChannels,
    reminderSound: req.body.reminder_sound ?? req.body.reminderSound,
    updatedAt: new Date().toISOString(),
  });

  sendTodo(res, todo);
});

router.patch('/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['active', 'completed', 'deleted'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  sendTodo(res, setTodoStatus(req.params.id, status));
});

router.delete('/:id/permanent', (req, res) => {
  const todo = deleteTodoPermanently(req.params.id);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  for (const attachment of todo.attachments || []) {
    const filePath = path.join(uploadsDir, attachment.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  res.status(204).send();
});

router.post('/:id/attachments', upload.single('file'), (req, res) => {
  const todo = getTodoById(req.params.id);
  if (!todo) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(404).json({ error: 'Todo not found' });
  }
  if (!req.file) return res.status(400).json({ error: 'File is required' });

  const kind = req.body?.kind || 'file';
  addAttachment({
    id: uuidv4(),
    todoId: req.params.id,
    filename: req.file.filename,
    originalName: resolveOriginalName(req.body?.originalName, req.file.originalname),
    mimeType: req.file.mimetype,
    size: req.file.size,
    kind,
    createdAt: new Date().toISOString(),
  });

  sendTodo(res, getTodoById(req.params.id), 201);
});

router.get('/:todoId/attachments/:attachmentId', (req, res) => {
  const attachment = getAttachmentById(req.params.attachmentId);
  if (!attachment || attachment.todo_id !== req.params.todoId) {
    return res.status(404).json({ error: 'Attachment not found' });
  }

  const filePath = path.join(uploadsDir, attachment.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

  const originalName = fixMojibakeFilename(attachment.original_name);
  res.setHeader('Content-Type', attachment.mime_type || 'application/octet-stream');
  res.setHeader('Content-Disposition', contentDispositionInline(originalName));
  res.sendFile(path.resolve(filePath));
});

router.delete('/:todoId/attachments/:attachmentId', (req, res) => {
  const attachment = getAttachmentById(req.params.attachmentId);
  if (!attachment || attachment.todo_id !== req.params.todoId) {
    return res.status(404).json({ error: 'Attachment not found' });
  }

  const filePath = path.join(uploadsDir, attachment.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  deleteAttachment(req.params.attachmentId);
  res.status(204).send();
});

router.get('/:todoId/subtasks', (req, res) => {
  const todo = getTodoById(req.params.todoId);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });
  res.json(todo.subtasks);
});

router.post('/:todoId/subtasks', (req, res) => {
  const todo = getTodoById(req.params.todoId);
  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  const title = (req.body.title || '').trim();
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const subtask = createSubtask({
    id: uuidv4(),
    todoId: req.params.todoId,
    title,
    sortOrder: req.body.sort_order ?? todo.subtasks.length,
    titleStyle: req.body.title_style || {},
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(subtask);
});

router.patch('/:todoId/subtasks/:subtaskId/toggle', (req, res) => {
  const subtask = getSubtaskById(req.params.subtaskId);
  if (!subtask || subtask.todo_id !== req.params.todoId) {
    return res.status(404).json({ error: 'Subtask not found' });
  }
  res.json(toggleSubtask(req.params.subtaskId));
});

router.put('/:todoId/subtasks/:subtaskId', (req, res) => {
  const subtask = getSubtaskById(req.params.subtaskId);
  if (!subtask || subtask.todo_id !== req.params.todoId) {
    return res.status(404).json({ error: 'Subtask not found' });
  }
  const updated = updateSubtask(req.params.subtaskId, {
    title: (req.body.title || '').trim() || subtask.title,
    titleStyle: req.body.title_style,
    sortOrder: req.body.sort_order,
  });
  res.json(updated);
});

router.delete('/:todoId/subtasks/:subtaskId', (req, res) => {
  const subtask = getSubtaskById(req.params.subtaskId);
  if (!subtask || subtask.todo_id !== req.params.todoId) {
    return res.status(404).json({ error: 'Subtask not found' });
  }
  deleteSubtask(req.params.subtaskId);
  res.status(204).send();
});

export default router;
