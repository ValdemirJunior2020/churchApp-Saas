// src/utils/media.js

const COMMON_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp", ".heic", ".heif", ".avif"];

export function normalizeRemoteUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return encodeURI(raw);
  if (/^\/\//.test(raw)) return `https:${encodeURI(raw)}`;
  return encodeURI(`https://${raw}`);
}

export function looksLikeImageUrl(value = "") {
  const url = normalizeRemoteUrl(value);
  if (!url) return false;
  return COMMON_IMAGE_EXTENSIONS.some((ext) => url.toLowerCase().includes(ext));
}

export function safeImageSource(value = "") {
  const url = normalizeRemoteUrl(value);
  return url ? { uri: url } : null;
}
