// Persists this browser's device registration ({id, name, colorGroup, ...})
// returned by POST /api/devices/register, so the iPad only registers once.
const KEY = "cgmc_device_v1";

export function getStoredDevice() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeDevice(device) {
  try {
    localStorage.setItem(KEY, JSON.stringify(device));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

export function clearDevice() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
