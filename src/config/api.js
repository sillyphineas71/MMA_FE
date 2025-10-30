import { Platform } from "react-native";
import Constants from "expo-constants";

// ✅ Resolve backend base URL across emulator, simulator and physical devices.
function resolveBaseURL() {
  // 0) Strongest: read from app.json -> expo.extra.apiBase
  const extraApi = Constants.expoConfig?.extra?.apiBase;
  if (extraApi) return extraApi;

  // 1) Env override
  if (process.env.EXPO_PUBLIC_API_BASE) return process.env.EXPO_PUBLIC_API_BASE;

  // 2) Emulators (Android/iOS)
  const isEmulator = !Constants.isDevice;
  if (isEmulator) {
    if (Platform.OS === "android") return "http://10.0.2.2:9999"; // Android emulator to host
    if (Platform.OS === "ios") return "http://localhost:9999"; // iOS simulator
  }

  // 3) Physical device on LAN: use host from Expo dev server hostUri
  const hostFromExpo =
    Constants.expoConfig?.hostUri?.split(":")[0] ||
    Constants.manifest2?.extra?.expoGo?.developer?.host ||
    Constants.manifest?.debuggerHost?.split(":")[0];
  if (hostFromExpo) return `http://${hostFromExpo}:9999`;

  // 4) Fallback: ask user to set env if detection fails
  return "http://192.168.137.1:9999"; // ⚠️ CHANGE_ME to your PC LAN IP if needed
}

export const API_BASE = resolveBaseURL();

// ✅ POST request (giữ nguyên)
export async function apiPost(path, body) {
  const url = `${API_BASE}${path}`;
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error(
      `Network request failed to ${url}. Check that your phone and PC are on the same LAN, the server is running, and Windows Firewall allows port 9999.`
    );
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    data = { raw: text };
  }

  if (!res.ok) {
    const message = data?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

// ✅ GET request (thêm mới)
export async function apiGet(path, params = undefined) {
  // Build query string if params provided
  let qs = "";
  if (params && typeof params === "object") {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      const sv = String(v);
      if (sv.trim() === "") return;
      usp.append(k, sv);
    });
    const s = usp.toString();
    if (s) qs = `?${s}`;
  }

  const url = `${API_BASE}${path}${qs}`;
  let res;
  try {
    res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    throw new Error(
      `Network request failed to ${url}. Kiểm tra lại mạng LAN, server backend, và port 9999.`
    );
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    data = { raw: text };
  }

  if (!res.ok) {
    const message = data?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  // Normalize return shape to match screens expecting { data }
  return { data };
}

// ✅ PATCH request
export async function apiPatch(path, body) {
  const url = `${API_BASE}${path}`;
  let res;
  try {
    res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error(
      `Network request failed to ${url}. Kiểm tra server backend, mạng LAN và port 9999.`
    );
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    data = { raw: text };
  }

  if (!res.ok) {
    const message = data?.message || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

