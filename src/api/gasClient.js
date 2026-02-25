// File: src/api/gasClient.js

import { GAS_URL, GAS_API_KEY } from "../config";

function withQuery(base, params) {
  const entries = Object.entries(params || {}).filter(
    ([_, v]) => v !== undefined && v !== null && String(v).trim() !== ""
  );
  const q = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  if (!q) return base;
  return base + (base.includes("?") ? "&" : "?") + q;
}

async function fetchJson(url, options = {}, timeoutMs = 20000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    const text = await res.text();

    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { ok: false, error: "Non-JSON response", raw: text };
    }

    if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
    if (data && data.ok === false) throw new Error(data.error || "Request failed");

    return data;
  } finally {
    clearTimeout(t);
  }
}

export async function gasGet(resource, params = {}) {
  const url = withQuery(GAS_URL, {
    ...(GAS_API_KEY ? { key: GAS_API_KEY } : {}),
    resource,
    ...params,
  });
  return fetchJson(url, { method: "GET" });
}

export async function gasPost(resource, body = {}, params = {}) {
  const url = withQuery(GAS_URL, {
    ...(GAS_API_KEY ? { key: GAS_API_KEY } : {}),
    resource,
    ...params,
  });

  // IMPORTANT:
  // text/plain avoids browser/Expo preflight OPTIONS (405 on Google Apps Script)
  return fetchJson(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body || {}),
  });
}