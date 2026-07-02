export const FONT_FAMILIES = [
  'system-ui, sans-serif',
  'Georgia, serif',
  'Courier New, monospace',
  'Comic Sans MS, cursive',
  'Trebuchet MS, sans-serif',
];

export const EMOJI_LIST = [
  '😀', '😊', '🎉', '✅', '❤️', '⭐', '🔥', '💡', '📌', '📎',
  '📝', '📅', '⏰', '🎯', '🚀', '💪', '👍', '🙏', '😎', '🤔',
  '📷', '🎵', '🎨', '🛒', '🏠', '💼', '📚', '✈️', '🍕', '☕',
];

export function styleToCss(style = {}) {
  return {
    fontFamily: style.fontFamily || undefined,
    fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
    color: style.color || undefined,
  };
}

export function isImageAttachment(attachment) {
  return attachment?.mime_type?.startsWith('image/');
}

export function isAudioAttachment(attachment) {
  return attachment?.kind === 'voice' || attachment?.mime_type?.startsWith('audio/');
}

export function isGifAttachment(attachment) {
  return attachment?.kind === 'gif' || attachment?.mime_type === 'image/gif';
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

export function displayFileName(name) {
  if (!name) return name;
  if (!/[ÃÐÑÂ]/.test(name)) return name;
  const bytes = Uint8Array.from(name, (ch) => ch.charCodeAt(0) & 0xff);
  const fixed = new TextDecoder('utf-8').decode(bytes);
  return fixed.includes('\uFFFD') ? name : fixed;
}

export const VIEW = {
  ALL: 'all',
  COMPLETED: 'completed',
  DELETED: 'deleted',
  FOLDER: 'folder',
};
