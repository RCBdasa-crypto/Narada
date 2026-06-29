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
