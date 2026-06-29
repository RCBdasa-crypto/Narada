import { describe, it, expect } from 'vitest';
import { isImageAttachment, formatFileSize, truncateText } from '../utils/helpers';

describe('helpers', () => {
  it('detects image attachments', () => {
    expect(isImageAttachment({ mime_type: 'image/png' })).toBe(true);
    expect(isImageAttachment({ mime_type: 'application/pdf' })).toBe(false);
  });

  it('formats file sizes', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
  });

  it('truncates long text', () => {
    const long = 'a'.repeat(150);
    expect(truncateText(long, 120)).toHaveLength(121);
    expect(truncateText('short')).toBe('short');
  });
});
