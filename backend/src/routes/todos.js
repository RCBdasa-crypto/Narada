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
  deleteTodo,
  addAttachment,
  getAttachmentById,
  deleteAttachment,
  uploadsDir,
} from '../db.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/', (_req, res) => {
  res.json(getAllTodos());
});

router.get('/:id', (req, res) => {
  const todo = getTodoById(req.params.id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.json(todo);
});

router.post('/', (req, res) => {
  const title = (req.body.title || '').trim();
  const note = (req.body.note || '').trim();

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const now = new Date().toISOString();
  const todo = createTodo({
    id: uuidv4(),
    title,
    note,
    createdAt: now,
    updatedAt: now,
  });

  res.status(201).json(todo);
});

router.put('/:id', (req, res) => {
  const title = (req.body.title || '').trim();
  const note = (req.body.note || '').trim();

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const todo = updateTodo(req.params.id, {
    title,
    note,
    updatedAt: new Date().toISOString(),
  });

  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  res.json(todo);
});

router.delete('/:id', (req, res) => {
  const todo = deleteTodo(req.params.id);
  if (!todo) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  for (const attachment of todo.attachments) {
    const filePath = path.join(uploadsDir, attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  res.status(204).send();
});

router.post('/:id/attachments', upload.single('file'), (req, res) => {
  const todo = getTodoById(req.params.id);
  if (!todo) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(404).json({ error: 'Todo not found' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }

  const attachment = addAttachment({
    id: uuidv4(),
    todoId: req.params.id,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    size: req.file.size,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(getTodoById(req.params.id));
});

router.delete('/:todoId/attachments/:attachmentId', (req, res) => {
  const attachment = getAttachmentById(req.params.attachmentId);
  if (!attachment || attachment.todo_id !== req.params.todoId) {
    return res.status(404).json({ error: 'Attachment not found' });
  }

  const filePath = path.join(uploadsDir, attachment.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  deleteAttachment(req.params.attachmentId);
  res.status(204).send();
});

export default router;
