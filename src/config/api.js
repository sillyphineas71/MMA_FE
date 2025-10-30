import { Platform } from "react-native";
import Constants from "expo-constants";

// Resolve backend base URL across emulator, simulator and physical devices.
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

  // 4) Fallback: ask user to set env if detection failsr
  return "http://192.168.68.2:9999"; // CHANGE_ME to your PC LAN IP if needed
}

export const API_BASE = resolveBaseURL();

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
    // Provide better error for common network issues
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
