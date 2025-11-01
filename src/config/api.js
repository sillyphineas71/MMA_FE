import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Resolve backend base URL across emulator, simulator and physical devices.
function resolveBaseURL() {
  const extraApi = Constants.expoConfig?.extra?.apiBase;
  if (extraApi) return extraApi;
  if (process.env.EXPO_PUBLIC_API_BASE) return process.env.EXPO_PUBLIC_API_BASE;
  const isEmulator = !Constants.isDevice;
  if (isEmulator) {
    if (Platform.OS === "android") return "http://10.0.2.2:9999";
    if (Platform.OS === "ios") return "http://localhost:9999";
  }
  const hostFromExpo =
    Constants.expoConfig?.hostUri?.split(":")[0] ||
    Constants.manifest2?.extra?.expoGo?.developer?.host ||
    Constants.manifest?.debuggerHost?.split(":")[0];
  if (hostFromExpo) return `http://${hostFromExpo}:9999`;

  // Fallback to your LAN IP if detection fails (keep your current IP)
  return "http://10.33.67.168:9999";
}

export const API_BASE = resolveBaseURL();

function toQuery(params) {
  if (!params || typeof params !== "object") return "";
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
    )
    .join("&");
  return q ? `?${q}` : "";
}

export async function apiGet(path, params) {
  const hasQueryInPath = typeof path === "string" && path.includes("?");
  const qs = toQuery(params);
  const url = `${API_BASE}${path}${
    hasQueryInPath ? (qs ? `&${qs.slice(1)}` : "") : qs
  }`;
  const token = await AsyncStorage.getItem("userToken");

  const headers = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { method: "GET", headers });
  } catch (e) {
    throw new Error(
      `Network request failed to ${url}. Check LAN/server/firewall.`
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
  // Normalize array payloads so admin screens can read res.data consistently
  if (Array.isArray(data)) return { data };
  return data;
}

export async function apiPost(path, body) {
  const url = `${API_BASE}${path}`;
  const token = await AsyncStorage.getItem("userToken");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error(
      `Network request failed to ${url}. Check LAN/server/firewall.`
    );
  }
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}

export async function apiPatch(path, body) {
  const url = `${API_BASE}${path}`;
  const token = await AsyncStorage.getItem("userToken");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, {
      method: "PATCH",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error(
      `Network request failed to ${url}. Check LAN/server/firewall.`
    );
  }
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (_) {
    data = { raw: text };
  }
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}
