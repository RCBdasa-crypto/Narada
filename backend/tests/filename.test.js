import { describe, it, expect } from '@jest/globals';
import {
  decodeMultipartFilename,
  resolveOriginalName,
  fixMojibakeFilename,
  contentDispositionInline,
} from '../src/filename.js';

describe('filename helpers', () => {
  it('decodes UTF-8 multipart names misread as Latin-1', () => {
    const mojibake = Buffer.from('Фото.jpg', 'utf8').toString('latin1');
    expect(decodeMultipartFilename(mojibake)).toBe('Фото.jpg');
  });

  it('prefers originalName from request body', () => {
    const mojibake = Buffer.from('Документ.pdf', 'utf8').toString('latin1');
    expect(resolveOriginalName('Документ.pdf', mojibake)).toBe('Документ.pdf');
  });

  it('fixes stored mojibake names', () => {
    const mojibake = Buffer.from('отчёт.pdf', 'utf8').toString('latin1');
    expect(fixMojibakeFilename(mojibake)).toBe('отчёт.pdf');
  });

  it('keeps ASCII filenames unchanged', () => {
    expect(fixMojibakeFilename('notes.txt')).toBe('notes.txt');
  });

  it('builds RFC 5987 Content-Disposition', () => {
    const header = contentDispositionInline('Фото.jpg');
    expect(header).toContain('inline');
    expect(header).toContain("filename*=UTF-8''");
    expect(header).toContain(encodeURIComponent('Фото.jpg'));
  });
});
