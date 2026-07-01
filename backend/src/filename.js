/**
 * Multer/busboy often misread UTF-8 multipart filenames as Latin-1.
 */
export function decodeMultipartFilename(name) {
  if (!name) return name;
  return Buffer.from(name, 'latin1').toString('utf8');
}

export function resolveOriginalName(bodyName, multerName) {
  const fromBody = typeof bodyName === 'string' ? bodyName.trim() : '';
  if (fromBody) return fromBody;
  return decodeMultipartFilename(multerName);
}

/** Fix names already stored with Latin-1 mojibake (legacy uploads). */
export function fixMojibakeFilename(name) {
  if (!name) return name;
  if (!/[ÃÐÑÂ]/.test(name)) return name;

  const fixed = decodeMultipartFilename(name);
  return fixed.includes('\uFFFD') ? name : fixed;
}

export function contentDispositionInline(filename) {
  const asciiFallback = filename.replace(/[^\x20-\x7E]/g, '_');
  const encoded = encodeURIComponent(filename);
  return `inline; filename="${asciiFallback}"; filename*=UTF-8''${encoded}`;
}
