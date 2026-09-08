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
  }
}

export function clearDevice() {
  try {
    localStorage.removeItem(KEY);
  } catch {
  }
}
