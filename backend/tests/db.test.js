import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { isImageMimeType } from '../src/db.js';

describe('isImageMimeType', () => {
  it('returns true for image mime types', () => {
    expect(isImageMimeType('image/png')).toBe(true);
    expect(isImageMimeType('image/jpeg')).toBe(true);
    expect(isImageMimeType('image/webp')).toBe(true);
  });

  it('returns false for non-image mime types', () => {
    expect(isImageMimeType('application/pdf')).toBe(false);
    expect(isImageMimeType('text/plain')).toBe(false);
    expect(isImageMimeType('')).toBe(false);
    expect(isImageMimeType(null)).toBe(false);
  });
});

describe('database operations', () => {
  let tempDir;
  let dbModule;

  beforeEach(async () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'narada-test-'));
    process.env.DATA_DIR = path.join(tempDir, 'data');
    process.env.UPLOADS_DIR = path.join(tempDir, 'uploads');
    jest.resetModules();
    dbModule = await import('../src/db.js');
  });

  afterEach(() => {
    delete process.env.DATA_DIR;
    delete process.env.UPLOADS_DIR;
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('creates and retrieves todos', () => {
    const now = new Date().toISOString();
    const created = dbModule.createTodo({
      id: 'todo-1',
      title: 'Test title',
      note: 'Test note',
      createdAt: now,
      updatedAt: now,
    });

    expect(created.title).toBe('Test title');
    expect(created.note).toBe('Test note');
    expect(created.attachments).toEqual([]);

    const all = dbModule.getAllTodos();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('todo-1');
  });

  it('updates and deletes todos', () => {
    const now = new Date().toISOString();
    dbModule.createTodo({
      id: 'todo-2',
      title: 'Original',
      note: 'Note',
      createdAt: now,
      updatedAt: now,
    });

    const updated = dbModule.updateTodo('todo-2', {
      title: 'Updated',
      note: 'New note',
      updatedAt: new Date().toISOString(),
    });

    expect(updated.title).toBe('Updated');
    expect(updated.note).toBe('New note');

    const deleted = dbModule.deleteTodo('todo-2');
    expect(deleted.id).toBe('todo-2');
    expect(dbModule.getAllTodos()).toHaveLength(0);
  });

  it('manages attachments', () => {
    const now = new Date().toISOString();
    dbModule.createTodo({
      id: 'todo-3',
      title: 'With files',
      note: '',
      createdAt: now,
      updatedAt: now,
    });

    dbModule.addAttachment({
      id: 'att-1',
      todoId: 'todo-3',
      filename: 'file.png',
      originalName: 'photo.png',
      mimeType: 'image/png',
      size: 1234,
      createdAt: now,
    });

    const todo = dbModule.getTodoById('todo-3');
    expect(todo.attachments).toHaveLength(1);
    expect(todo.attachments[0].original_name).toBe('photo.png');

    dbModule.deleteAttachment('att-1');
    expect(dbModule.getTodoById('todo-3').attachments).toHaveLength(0);
  });
});
