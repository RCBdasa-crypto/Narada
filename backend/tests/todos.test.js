import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';

describe('todos API', () => {
  let tempDir;
  let app;

  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'narada-api-'));
    process.env.DATA_DIR = path.join(tempDir, 'data');
    process.env.UPLOADS_DIR = path.join(tempDir, 'uploads');
    process.env.NODE_ENV = 'test';
    jest.resetModules();
    const serverModule = await import('../src/server.js');
    app = serverModule.default;
  });

  afterEach(() => {
    delete process.env.DATA_DIR;
    delete process.env.UPLOADS_DIR;
    delete process.env.NODE_ENV;
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('creates, updates, and deletes a todo', async () => {
    const createRes = await request(app)
      .post('/api/todos')
      .send({ title: 'Buy milk', note: 'From the store' })
      .expect(201);

    expect(createRes.body.title).toBe('Buy milk');
    expect(createRes.body.note).toBe('From the store');

    const id = createRes.body.id;

    const listRes = await request(app).get('/api/todos').expect(200);
    expect(listRes.body).toHaveLength(1);

    await request(app)
      .put(`/api/todos/${id}`)
      .send({ title: 'Buy oat milk', note: 'Organic' })
      .expect(200);

    const getRes = await request(app).get(`/api/todos/${id}`).expect(200);
    expect(getRes.body.title).toBe('Buy oat milk');

    await request(app).delete(`/api/todos/${id}`).expect(204);
    await request(app).get('/api/todos').expect(200).expect([]);
  });

  it('rejects todo without title', async () => {
    await request(app).post('/api/todos').send({ note: 'No title' }).expect(400);
  });

  it('uploads and removes attachments', async () => {
    const createRes = await request(app)
      .post('/api/todos')
      .send({ title: 'Photos', note: '' })
      .expect(201);

    const id = createRes.body.id;

    await request(app)
      .post(`/api/todos/${id}/attachments`)
      .attach('file', Buffer.from('fake-image'), {
        filename: 'test.png',
        contentType: 'image/png',
      })
      .expect(201);

    const todoRes = await request(app).get(`/api/todos/${id}`).expect(200);
    expect(todoRes.body.attachments).toHaveLength(1);

    const attachmentId = todoRes.body.attachments[0].id;

    await request(app)
      .delete(`/api/todos/${id}/attachments/${attachmentId}`)
      .expect(204);

    const afterDelete = await request(app).get(`/api/todos/${id}`).expect(200);
    expect(afterDelete.body.attachments).toHaveLength(0);
  });

  it('stores and serves attachments with UTF-8 filenames', async () => {
    const createRes = await request(app)
      .post('/api/todos')
      .send({ title: 'Files', note: '' })
      .expect(201);

    const id = createRes.body.id;
    const originalName = 'Документ.pdf';

    await request(app)
      .post(`/api/todos/${id}/attachments`)
      .field('originalName', originalName)
      .attach('file', Buffer.from('%PDF-1.4'), {
        filename: Buffer.from(originalName, 'utf8').toString('latin1'),
        contentType: 'application/pdf',
      })
      .expect(201);

    const todoRes = await request(app).get(`/api/todos/${id}`).expect(200);
    expect(todoRes.body.attachments[0].original_name).toBe(originalName);

    const attachmentId = todoRes.body.attachments[0].id;

    const fileRes = await request(app)
      .get(`/api/todos/${id}/attachments/${attachmentId}`)
      .expect(200);

    expect(fileRes.headers['content-type']).toContain('application/pdf');
    expect(fileRes.headers['content-disposition']).toContain(encodeURIComponent(originalName));
    expect(Buffer.isBuffer(fileRes.body) ? fileRes.body.toString() : fileRes.text).toBe('%PDF-1.4');
  });
});
