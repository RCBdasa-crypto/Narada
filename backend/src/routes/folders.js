import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder,
} from '../db.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(getAllFolders());
});

router.post('/', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const folder = createFolder({
    id: uuidv4(),
    name,
    sortOrder: req.body.sort_order ?? getAllFolders().length,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json(folder);
});

router.put('/:id', (req, res) => {
  const name = (req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const folder = updateFolder(req.params.id, { name, sortOrder: req.body.sort_order });
  if (!folder) return res.status(404).json({ error: 'Folder not found' });
  res.json(folder);
});

router.delete('/:id', (req, res) => {
  const folder = deleteFolder(req.params.id);
  if (!folder) return res.status(404).json({ error: 'Folder not found' });
  res.status(204).send();
});

export default router;
