import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { demoCall } from "./demo";
let base = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
let token = "";
async function tokenStore(value: string) {
  if (Platform.OS === "web") return;
  await SecureStore.setItemAsync("kv-token", value);
}
export const api = {
  get base() {
    return base;
  },
  get demo() {
    return !base;
  },
  async init() {
    const saved = await AsyncStorage.getItem("kv-api-url");
    if (saved !== null) base = saved;
  },
  async configure(url: string) {
    const clean = url.trim().replace(/\/$/, "");
    if (clean && !/^https?:\/\//.test(clean))
      throw Error("API ünvanı http:// və ya https:// ilə başlamalıdır");
    base = clean;
    token = "";
    await tokenStore("");
    await AsyncStorage.setItem("kv-api-url", base);
  },
  async session(t: string) {
    token = t;
    await tokenStore(t);
  },
  async call<T = any>(
    path: string,
    method = "GET",
    body?: unknown,
  ): Promise<T> {
    if (!base) return demoCall(path, method, body);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(base + path, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: "Bearer " + token } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw Error(
          typeof err.detail === "string"
            ? err.detail
            : response.status === 422
              ? "Formadakı məlumatları yoxla."
              : "API xətası: " + response.status,
        );
      }
      return response.json();
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError")
        throw Error("Server cavab vermədi. API ünvanını və portu yoxla.");
      throw e;
    } finally {
      clearTimeout(timer);
    }
  },
  async upload(uri: string) {
    if (!base) return null;
    const form = new FormData();
    if (Platform.OS === "web") {
      const b = await (await fetch(uri)).blob();
      form.append("file", b, "photo.jpg");
    } else
      form.append("file", {
        uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);
    const res = await fetch(base + "/uploads", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: form,
    });
    if (!res.ok) throw Error("Şəkil yüklənmədi. 5 MB-dan kiçik şəkil seç.");
    return (await res.json()).id as string;
  },
  image(id: string) {
    return {
      uri: base + "/uploads/" + id,
      headers: { Authorization: "Bearer " + token },
    };
  },
};
