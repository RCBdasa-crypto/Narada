import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import todosRouter from './routes/todos.js';
import { uploadsDir } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3001;
const frontendDist = path.resolve(
  process.env.FRONTEND_DIST || path.join(__dirname, '..', '..', 'frontend', 'dist')
);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));
app.use('/api/todos', todosRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

export default app;
