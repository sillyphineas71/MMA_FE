import { Platform } from "react-native";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage"; // THÊM

// ... (Hàm resolveBaseURL của bạn giữ nguyên) ...
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
  return "http://192.168.1.104:9999";
}

export const API_BASE = resolveBaseURL();

// === PHẦN CẬP NHẬT ===

// Hàm fetch chung, tự động đính kèm token
async function apiFetch(path, method, body) {
  const url = `${API_BASE}${path}`;
  const token = await AsyncStorage.getItem("userToken"); // Lấy token

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`; // Gắn token
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, options);
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
  return data;
}

// Sửa lại apiPost để dùng hàm chung
export async function apiPost(path, body) {
  return apiFetch(path, "POST", body);
}

// Thêm apiGet
export async function apiGet(path) {
  return apiFetch(path, "GET", null);
}