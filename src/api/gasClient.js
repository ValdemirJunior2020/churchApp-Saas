// src/api/gasClient.js

import { GAS_URL, GAS_API_KEY } from "../config";

function withQuery(base, params) {
  const entries = Object.entries(params || {}).filter(
    ([, value]) => value !== undefined && value !== null && String(value).trim() !== ""
  );

  const query = entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");

  if (!query) return base;
  return `${base}${base.includes("?") ? "&" : "?"}${query}`;
}

async function fetchJson(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    const raw = await response.text();
    let data = null;

    try {
      data = raw ? JSON.parse(raw) : null;
    } catch {
      data = { ok: false, error: "Non-JSON response", raw };
    }

    if (!response.ok) {
      throw new Error(data?.error || `HTTP ${response.status}`);
    }

    if (data?.ok === false) {
      throw new Error(data.error || "Request failed");
    }

    return data?.data ?? data;
  } finally {
    clearTimeout(timeout);
  }
}

export async function gasGet(resource, params = {}) {
  const url = withQuery(GAS_URL, {
    key: GAS_API_KEY,
    resource,
    ...params,
  });

  return fetchJson(url, { method: "GET" });
}

export async function gasPost(resource, body = {}, params = {}) {
  const url = withQuery(GAS_URL, {
    key: GAS_API_KEY,
    resource,
    ...params,
  });

  return fetchJson(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(body || {}),
  });
}