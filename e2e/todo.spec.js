import fs from 'fs';
import path from 'path';
import { test, expect } from '@playwright/test';

const FIXTURES_DIR = path.join(process.cwd(), 'e2e', 'fixtures');
const TEST_IMAGE = path.join(FIXTURES_DIR, 'test-image.png');
const API_URL = 'http://localhost:3001/api/todos';

test.beforeAll(() => {
  const pngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  fs.writeFileSync(TEST_IMAGE, Buffer.from(pngBase64, 'base64'));
});

test.beforeEach(async ({ request }) => {
  const todos = await request.get(API_URL).then((res) => res.json());
  for (const todo of todos) {
    await request.delete(`${API_URL}/${todo.id}`);
  }
});

test.describe('Narada To-Do App', () => {
  test('creates a todo with title, note, and image preview', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('title-input').fill('E2E Test Task');
    await page.getByTestId('note-input').fill('This is an end-to-end test note.');
    await page.getByTestId('file-input').setInputFiles(TEST_IMAGE);
    await page.getByTestId('save-button').click();

    await expect(page.getByRole('heading', { name: 'E2E Test Task' })).toBeVisible();
    await expect(page.locator('.todo-item-content').getByText('This is an end-to-end test note.')).toBeVisible();
    await expect(page.getByTestId('image-preview').first()).toBeVisible();
  });

  test('updates an existing todo', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('title-input').fill('Task to update');
    await page.getByTestId('note-input').fill('Original note');
    await page.getByTestId('save-button').click();

    await page.locator('.todo-item-main', { hasText: 'Task to update' }).click();
    await page.getByTestId('title-input').fill('Updated task');
    await page.getByTestId('note-input').fill('Updated note');
    await page.getByTestId('save-button').click();

    await expect(page.getByRole('heading', { name: 'Updated task' })).toBeVisible();
    await expect(page.locator('.todo-item-content').getByText('Updated note')).toBeVisible();
  });

  test('deletes a todo', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('title-input').fill('Task to delete');
    await page.getByTestId('save-button').click();
    await expect(page.getByRole('heading', { name: 'Task to delete' })).toBeVisible();

    await page.getByRole('button', { name: /Удалить Task to delete/ }).click();
    await expect(page.getByRole('heading', { name: 'Task to delete' })).not.toBeVisible();
  });

  test('persists data after page reload', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('title-input').fill('Persistent task');
    await page.getByTestId('note-input').fill('Should survive reload');
    await page.getByTestId('save-button').click();

    await page.reload();

    await expect(page.getByRole('heading', { name: 'Persistent task' }).first()).toBeVisible();
    await expect(page.locator('.todo-item-content').getByText('Should survive reload').first()).toBeVisible();
  });

  test('attaches a non-image file', async ({ page }) => {
    const txtFile = path.join(FIXTURES_DIR, 'notes.txt');
    fs.writeFileSync(txtFile, 'plain text attachment');

    await page.goto('/');

    await page.getByTestId('title-input').fill('File attachment task');
    await page.getByTestId('file-input').setInputFiles(txtFile);
    await page.getByTestId('save-button').click();

    await expect(page.getByTestId('file-badge')).toContainText('notes.txt');
  });
});
