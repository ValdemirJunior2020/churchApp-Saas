// src/utils/youtube.js

export function extractYouTubeVideoId(value = "") {
  const input = String(value || "").trim();
  if (!input) return "";

  const directId = input.match(/^[a-zA-Z0-9_-]{11}$/);
  if (directId) return input;

  try {
    const normalized = input.startsWith("http://") || input.startsWith("https://") ? input : `https://${input}`;
    const url = new URL(normalized);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      return url.pathname.replace(/^\//, "").slice(0, 11);
    }

    if (host.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v.slice(0, 11);

      const parts = url.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((part) => ["embed", "shorts", "live", "watch"].includes(part));
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1].slice(0, 11);
    }
  } catch {
    return "";
  }

  return "";
}

export function buildYouTubeEmbedUrl(value = "") {
  const videoId = extractYouTubeVideoId(value);
  if (!videoId) return "";
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
}
