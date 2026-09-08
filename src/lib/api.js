import axios from "axios";

const DEFAULT_BASE = typeof window !== "undefined" ? window.location.origin : "";

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");

const TUNNEL_HEADERS = { "X-Pinggy-No-Screen": "true" };

const client = axios.create({
  baseURL: API_BASE,
  headers: TUNNEL_HEADERS,
});

export class ApiError extends Error {
  constructor(message, status, body, cause) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.cause = cause;
  }
}

function toApiError(err) {
  if (err.response) {
    const body = err.response.data;
    const message =
      (typeof body === "object" && (body?.message || body?.error)) || `เกิดข้อผิดพลาด (${err.response.status})`;
    return new ApiError(message, err.response.status, body, err);
  }
  return new ApiError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้", 0, null, err);
}

export async function registerDevice(name) {
  try {
    const { data } = await client.post(`/api/devices/register`, null, {
      params: { name },
    });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function heartbeatDevice(deviceId) {
  try {
    const { data } = await client.get(`/api/devices/${encodeURIComponent(deviceId)}`);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getStudent(studentId) {
  try {
    const { data } = await client.get(`/api/students/${encodeURIComponent(studentId)}`);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function searchStudents(query, { signal } = {}) {
  try {
    const { data } = await client.get(`/api/students`, {
      params: { query },
      signal,
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (axios.isCancel(err)) throw err;
    throw toApiError(err);
  }
}

export async function assignColor(studentId, deviceId) {
  try {
    const { data } = await client.post(`/api/color/assign`, { studentId, deviceId });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export function subscribeColorLive(grade, { onData, onError, onOpen } = {}) {
  const controller = new AbortController();
  let cancelled = false;

  const parseNewChunk = (() => {
    let read = 0;
    let buf = "";
    return (fullText) => {
      const chunk = fullText.slice(read);
      read = fullText.length;
      buf += chunk;

      let idx;
      while ((idx = buf.indexOf("\n\n")) !== -1) {
        const rawEvent = buf.slice(0, idx);
        buf = buf.slice(idx + 2);

        const dataLines = rawEvent
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trim());

        if (dataLines.length) {
          try {
            onData?.(JSON.parse(dataLines.join("\n")));
          } catch (e) {
            onError?.(e);
          }
        }
      }
    };
  })();

  (async () => {
    while (!cancelled) {
      try {
        await client.get(`/api/color/m${grade}/live/events`, {
          responseType: "text",
          signal: controller.signal,
          onDownloadProgress: (progressEvent) => {
            const fullText = progressEvent.event?.target?.responseText;
            if (typeof fullText === "string") {
              if (fullText.length > 0) onOpen?.();
              parseNewChunk(fullText);
            }
          },
        });
      } catch (e) {
        if (cancelled || axios.isCancel(e)) return;
        onError?.(toApiError(e));
      }

      if (cancelled) return;
      await new Promise((r) => setTimeout(r, 2000));
    }
  })();

  return () => {
    cancelled = true;
    controller.abort();
  };
}

export function colorGroupLetter(colorGroup) {
  return colorGroup?.replace(/^Color/i, "") || "?";
}
