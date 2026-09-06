// Backend client. The pinggy tunnel URL is a temporary dev tunnel and will
// expire/change — set VITE_API_BASE_URL in .env to point at whatever URL
// the backend is reachable at (see .env.example).
const DEFAULT_BASE = "https://efhlm-2405-9800-b910-7bbd-2930-88b9-e014-4fbf.free.pinggy.net";

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE).replace(/\/$/, "");

// Free pinggy.net tunnels show an HTML "Caution" interstitial to any request
// that looks like a normal browser visit, instead of proxying through to the
// real backend. Sending this header skips it (see the tunnel's own docs) —
// harmless to send once you're off pinggy, so it's left on unconditionally.
const TUNNEL_HEADERS = { "X-Pinggy-No-Screen": "true" };

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...TUNNEL_HEADERS, ...options.headers },
    });
  } catch (e) {
    throw new ApiError("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้", 0, null, e);
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    // no / non-JSON body — fine for some endpoints
  }

  if (!res.ok) {
    const message = body?.message || body?.error || `เกิดข้อผิดพลาด (${res.status})`;
    throw new ApiError(message, res.status, body);
  }
  return body;
}

export class ApiError extends Error {
  constructor(message, status, body, cause) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.cause = cause;
  }
}

/** Registers this browser/device once and returns { id, name, colorGroup, active, createdAt, lastSeen }. */
export function registerDevice(name) {
  return request(`/api/devices/register?name=${encodeURIComponent(name)}`);
}

/** Looks up a student by their student ID. Returns { studentId, name, classRoom, studentNumber }. */
export function getStudent(studentId) {
  return request(`/api/students/${encodeURIComponent(studentId)}`);
}

/** Confirms a student into this device's color group. Returns { success, studentId, grade, colorGroup, remaining }. */
export function assignColor(studentId, deviceId) {
  return request(`/api/color/assign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, deviceId }),
  });
}

/**
 * Subscribes to the live per-grade color-group counts via Server-Sent Events.
 * Calls onData with { grade, totalStudents, colors: [{colorGroup, capacity, assigned, remaining}] }
 * on the initial snapshot and every update. Returns an unsubscribe function.
 *
 * Implemented with fetch + a manual SSE line-parser rather than the native
 * EventSource, for two reasons: EventSource can't send custom headers, so it
 * can't get past the pinggy tunnel's interstitial page at all; and this
 * stream sends its payload as a *named* event (`event:capacity`), which
 * EventSource only delivers via addEventListener("capacity", ...), never via
 * onmessage. Parsing the raw stream sidesteps both — it just grabs whatever
 * `data:` lines show up, whatever the event name.
 */
export function subscribeColorLive(grade, { onData, onError, onOpen } = {}) {
  const controller = new AbortController();
  let cancelled = false;

  (async () => {
    while (!cancelled) {
      try {
        const res = await fetch(`${API_BASE}/api/color/m${grade}/live/events`, {
          headers: TUNNEL_HEADERS,
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          throw new ApiError(`live stream failed (${res.status})`, res.status);
        }
        onOpen?.();

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (!cancelled) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

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
        }
      } catch (e) {
        if (cancelled) return;
        onError?.(e);
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
