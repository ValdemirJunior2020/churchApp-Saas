export function extractYouTubeVideoId(input) {
  const v = String(input || "").trim();
  if (!v) return "";

  // Accept raw video id
  if (/^[a-zA-Z0-9_-]{11}$/.test(v)) return v;

  const patterns = [
    /v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const p of patterns) {
    const m = v.match(p);
    if (m && m[1]) return m[1];
  }

  return "";
}
