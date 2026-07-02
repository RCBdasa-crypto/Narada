import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getAllSettings, setSettings, uploadsDir } from '../db.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, _file, cb) => cb(null, `ringtone-${uuidv4()}${path.extname(_file.originalname) || '.mp3'}`),
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', (_req, res) => {
  res.json(getAllSettings());
});

router.put('/', (req, res) => {
  const allowed = [
    'telegram_bot_token',
    'telegram_chat_id',
    'whatsapp_phone',
    'email_address',
    'google_calendar_sync',
  ];
  const patch = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) patch[key] = req.body[key];
  }
  res.json(setSettings(patch));
});

router.post('/ringtone', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File is required' });
  setSettings({ custom_ringtone: req.file.filename });
  res.json({ ringtone: req.file.filename, url: `/uploads/${req.file.filename}` });
});

router.delete('/ringtone', (_req, res) => {
  const settings = getAllSettings();
  if (settings.custom_ringtone) {
    const filePath = path.join(uploadsDir, settings.custom_ringtone);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  setSettings({ custom_ringtone: '' });
  res.status(204).send();
});

export default router;
