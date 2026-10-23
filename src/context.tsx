import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { api } from "./api";
import {
  User,
  Draft,
  RequestItem,
  Offer,
  Store,
  Conversation,
  Role,
} from "./types";
export type Ctx = {
  user: User | null;
  setUser: (u: User | null) => void;
  go: (screen: string) => void;
  back: () => void;
  screen: string;
  login: (r: Role) => Promise<void>;
  logout: () => Promise<void>;
  draft: Draft;
  setDraft: (d: Draft) => void;
  request: RequestItem | null;
  setRequest: (r: RequestItem) => void;
  offer: Offer | null;
  setOffer: (o: Offer) => void;
  store: Store | null;
  setStore: (s: Store) => void;
  conversation: Conversation | null;
  setConversation: (c: Conversation) => void;
  photo: string;
  setPhoto: (s: string) => void;
  run: (f: () => Promise<void>) => void;
  busy: boolean;
};
export const Context = createContext<Ctx>(null!);
export const useApp = () => useContext(Context);
export const blankDraft: Draft = {
  title: "",
  brand: "",
  model: "",
  part: "Ekran",
  budget: 0,
  district: "Xətai",
  urgency: "Bu gün",
  quality: "Fərq etmir",
  note: "",
  image_id: null,
};
export function useResource<T>(path: string | undefined, initial: T) {
  const [data, setData] = useState<T>(initial),
    [loading, setLoading] = useState(!!path),
    [error, setError] = useState(""),
    [tick, setTick] = useState(0);
  useEffect(() => {
    let active = true;
    if (!path) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    api
      .call<T>(path)
      .then((v) => {
        if (active) setData(v);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [path, tick]);
  return {
    data,
    setData,
    loading,
    error,
    refresh: () => setTick((t) => t + 1),
  };
}
export function errorMessage(e: unknown) {
  Alert.alert(
    "Əməliyyat tamamlanmadı",
    e instanceof Error ? e.message : "Yenidən cəhd et.",
  );
}
