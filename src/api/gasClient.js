// src/api/gasClient.js
import { GAS_URL } from "../config";

function withQuery(base, params) {
  const entries = Object.entries(params || {}).filter(
    ([, v]) => v !== undefined && v !== null && String(v).trim() !== ""
  );

  const q = entries
    .map(
      ([k, v]) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
    )
    .join("&");

  if (!q) return base;
  return base + (base.includes("?") ? "&" : "?") + q;
}

async function fetchJson(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const text = await res.text();

    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { ok: false, error: "Non-JSON response", raw: text };
    }

    if (!res.ok) {
      throw new Error(data?.error || `HTTP ${res.status}`);
    }

    if (data && data.ok === false) {
      throw new Error(data.error || "Request failed");
    }

    return data?.data ?? data;
  } finally {
    clearTimeout(timer);
  }
}

export async function gasGet(resource, params = {}) {
  const url = withQuery(GAS_URL, { resource, ...params });
  return fetchJson(url, { method: "GET" });
}

export async function gasPost(resource, body = {}, params = {}) {
  const url = withQuery(GAS_URL, { resource, ...params });

  return fetchJson(url, {
    method: "POST",
    headers: {
      // simple request for web
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(body || {}),
  });
}