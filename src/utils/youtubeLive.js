// File: src/utils/youtubeLive.js

export function extractYouTubeVideoId(input) {
  if (!input || typeof input !== "string") return "";

  const value = input.trim();

  // Raw 11-char video id
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1];
  }

  return "";
}

export function buildYouTubeWatchUrl(videoId) {
  if (!videoId) return "";
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function isLikelyYoutubeInput(input) {
  return !!extractYouTubeVideoId(input);
}

export function normalizeYoutubeSource(source) {
  const videoId = extractYouTubeVideoId(source);
  return {
    raw: source || "",
    videoId,
    watchUrl: buildYouTubeWatchUrl(videoId),
    isValid: !!videoId
  };
}