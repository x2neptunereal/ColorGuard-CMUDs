import axios from "axios";

// Backend client. Defaults to the page's own origin — i.e. the app assumes
// it's served from the same host as the API (a reverse proxy or the backend
// itself serving the built frontend). For local dev, where the Vite dev
// server (localhost:5173) isn't the backend, set VITE_API_BASE_URL in .env
// to point at wherever the backend actually is (see .env.example).
const DEFAULT_BASE = typeof window !== "undefined" ? window.location.origin : "";

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");

// Free pinggy.net tunnels show an HTML "Caution" interstitial to any request
// that looks like a normal browser visit, instead of proxying through to the
// real backend. Sending this header skips it (see the tunnel's own docs) —
// harmless to send once you're off pinggy, so it's left on unconditionally.
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

/** Registers this browser/device once and returns { id, name, colorGroup, active, createdAt, lastSeen }. */
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

/**
 * Pings the backend to confirm this device still exists there (used on
 * AssignPage mount to detect a device that was removed server-side —
 * getStudent-style ApiError with status 404 tells the caller to reset
 * local device state and show DeviceSetup again).
 */
export async function heartbeatDevice(deviceId) {
  try {
    const { data } = await client.get(`/api/devices/${encodeURIComponent(deviceId)}`);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

/** Looks up a student by their student ID. Returns { studentId, name, classRoom, studentNumber }. */
export async function getStudent(studentId) {
  try {
    const { data } = await client.get(`/api/students/${encodeURIComponent(studentId)}`);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

/**
 * Searches students by name or student ID. Returns an array of
 * { studentId, title, name, lastName, grade, classroom, studentNumber, id }.
 */
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

/** Confirms a student into this device's color group. Returns { success, studentId, grade, colorGroup, remaining }. */
export async function assignColor(studentId, deviceId) {
  try {
    const { data } = await client.post(`/api/color/assign`, { studentId, deviceId });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

/**
 * Subscribes to the live per-grade color-group counts via Server-Sent Events.
 * Calls onData with { grade, totalStudents, colors: [{colorGroup, capacity, assigned, remaining}] }
 * on the initial snapshot and every update. Returns an unsubscribe function.
 *
 * Browsers' native EventSource can't send custom headers, so it can't get
 * past the pinggy tunnel's interstitial page at all — and this stream sends
 * its payload as a *named* event (`event:capacity`), which EventSource only
 * delivers via addEventListener("capacity", ...), never via onmessage. So
 * this reads the stream through axios/XHR instead: `onDownloadProgress`
 * exposes the response body's text as it grows, which we diff against what
 * we've already parsed and feed through a small SSE line-parser.
 */
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
        // request resolved (stream closed by server) — fall through to reconnect
      } catch (e) {
        if (cancelled || axios.isCancel(e)) return;
        onError?.(toApiError(e));
      }

      if (cancelled) return;
      await new Promise((r) => setTimeout(r, 2000)); // brief backoff, then reconnect
    }
  })();

  return () => {
    cancelled = true;
    controller.abort();
  };
}

/** "ColorA" -> "A" */
export function colorGroupLetter(colorGroup) {
  return colorGroup?.replace(/^Color/i, "") || "?";
}
