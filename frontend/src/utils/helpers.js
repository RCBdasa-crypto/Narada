export function isImageAttachment(attachment) {
  return attachment?.mime_type?.startsWith('image/');
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function truncateText(text, maxLength = 120) {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength)}…`;
}

/** Fix legacy uploads where UTF-8 names were stored as Latin-1 mojibake. */
export function displayFileName(name) {
  if (!name) return name;
  if (!/[ÃÐÑÂ]/.test(name)) return name;

  const bytes = Uint8Array.from(name, (ch) => ch.charCodeAt(0) & 0xff);
  const fixed = new TextDecoder('utf-8').decode(bytes);
  return fixed.includes('\uFFFD') ? name : fixed;
}
