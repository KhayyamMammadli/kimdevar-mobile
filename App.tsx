import React, { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./src/api";
import { Context, blankDraft, errorMessage } from "./src/context";
import {
  Draft,
  User,
  RequestItem,
  Offer,
  Store,
  Conversation,
  Role,
} from "./src/types";
import { C, T, I, s } from "./src/ui";
import { BuyerScreens } from "./src/screens/Buyer";
import { SellerScreens } from "./src/screens/Seller";
import { CommonScreens } from "./src/screens/Common";
export default function App() {
  const [screen, setScreen] = useState("splash"),
    [history, setHistory] = useState<string[]>([]),
    [user, setUser] = useState<User | null>(null),
    [busy, setBusy] = useState(false),
    [draft, setDraft] = useState<Draft>(blankDraft),
    [request, setRequest] = useState<RequestItem | null>(null),
    [offer, setOffer] = useState<Offer | null>(null),
    [store, setStore] = useState<Store | null>(null),
    [conversation, setConversation] = useState<Conversation | null>(null),
    [photo, setPhoto] = useState("");
  function go(next: string) {
    setHistory((h) => [...h, screen]);
    setScreen(next);
  }
  function back() {
    if (history.length) {
      setScreen(history[history.length - 1]);
      setHistory((h) => h.slice(0, -1));
    } else
      setScreen(
        user
          ? user.role === "seller"
            ? "dashboard"
            : user.role === "admin"
              ? "moderation"
              : "home"
          : "login",
      );
  }
  useEffect(() => {
    const h = BackHandler.addEventListener("hardwareBackPress", () => {
      if (screen === "home" || screen === "dashboard" || screen === "login")
        return false;
      back();
      return true;
    });
    return () => h.remove();
  }, [screen, history, user]);
  useEffect(() => {
    let live = true;
    Promise.all([api.init(), AsyncStorage.getItem("kv-onboarded")])
      .then(([, seen]) => {
        if (live)
          setTimeout(() => {
            if (live) setScreen(seen ? "login" : "onboard");
          }, 900);
      })
      .catch(errorMessage);
    return () => {
      live = false;
    };
  }, []);
  async function login(role: Role) {
    setBusy(true);
    try {
      const res = await api.call("/auth/demo", "POST", { role });
      await api.session(res.token);
      setUser(res.user);
      setHistory([]);
      setScreen(
        role === "seller"
          ? "dashboard"
          : role === "admin"
            ? "moderation"
            : "home",
      );
    } catch (e) {
      errorMessage(e);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    await api.call("/auth/logout", "POST").catch(() => {});
    await api.session("");
    setUser(null);
    setHistory([]);
    setScreen("login");
  }
  async function run(f: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    try {
      await f();
    } catch (e) {
      errorMessage(e);
    } finally {
      setBusy(false);
    }
  }
  const seller = user?.role === "seller";
  const tabs = seller
    ? [
        ["dashboard", "home-outline", "Panel"],
        ["feed", "list-outline", "Sorğular"],
        ["myOffers", "pricetag-outline", "Təkliflər"],
        ["messages", "chatbubble-outline", "Mesajlar"],
        ["profile", "person-outline", "Hesabım"],
      ]
    : [
        ["home", "home-outline", "Ana səhifə"],
        ["requests", "list-outline", "Sorğularım"],
        ["create", "add", ""],
        ["messages", "chatbubble-outline", "Mesajlar"],
        ["profile", "person-outline", "Hesabım"],
      ];
  const root = [
    "home",
    "requests",
    "messages",
    "profile",
    "dashboard",
    "feed",
    "myOffers",
  ];
  const showTabs = user && root.includes(screen) && user.role !== "admin";
  const titles: Record<string, string> = {
    create: "Yeni sorğu",
    ai: "Məlumatları dəqiqləşdir",
    review: "Son baxış",
    detail: "Sorğu detalları",
    offers: "Gələn təkliflər",
    compare: "Təklifləri müqayisə et",
    offer: "Təklif detalları",
    store: "Mağaza profili",
    requests: "Sorğularım",
    messages: "Mesajlar",
    chat: conversation?.store_name || "Yazışma",
    notifications: "Bildirişlər",
    profile: "Hesabım",
    editProfile: "Profili redaktə et",
    settings: "Ayarlar",
    location: "Məkan seçimi",
    favorites: "Saxlanılanlar",
    report: "Şikayət et",
    feed: "Gələn sorğular",
    sellerRequest: "Alıcı sorğusu",
    sendOffer: "Təklif hazırla",
    myOffers: "Təkliflərim",
    storeEdit: "Mağaza məlumatları",
    verification: "Mağaza təsdiqi",
    analytics: "Statistika",
    moderation: "Moderasiya",
    connection: "API bağlantısı",
    states: "Sistem halları",
  };
  const full = ["splash", "onboard", "login", "success"];
  return (
    <SafeAreaProvider>
      <Context.Provider
        value={{
          user,
          setUser,
          screen,
          go,
          back,
          login,
          logout,
          draft,
          setDraft,
          request,
          setRequest,
          offer,
          setOffer,
          store,
          setStore,
          conversation,
          setConversation,
          photo,
          setPhoto,
          run,
          busy,
        }}
      >
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: screen === "splash" ? C.purple : C.bg,
          }}
          edges={["top", "left", "right"]}
        >
          <StatusBar style={screen === "splash" ? "light" : "dark"} />
          {!full.includes(screen) && (
            <View style={styles.header}>
              {["home", "dashboard"].includes(screen) ? (
                <Pressable style={s.row} onPress={() => go("location")}>
                  <I name="location-outline" size={17} />
                  <T style={{ fontSize: 12 }}>
                    Bakı, {user?.district || "Xətai"}
                  </T>
                  <I name="chevron-down" size={13} />
                </Pressable>
              ) : (
                <>
                  <Pressable
                    accessibilityLabel="Geri"
                    onPress={back}
                    style={styles.icon}
                  >
                    <I name="chevron-back" color={C.ink} />
                  </Pressable>
                  <T
                    style={{
                      fontWeight: "700",
                      fontSize: 17,
                      flex: 1,
                      textAlign: "center",
                    }}
                  >
                    {titles[screen] || "KimdəVar"}
                  </T>
                </>
              )}
              {["home", "dashboard"].includes(screen) ? (
                <Pressable
                  accessibilityLabel="Bildirişlər"
                  onPress={() => go("notifications")}
                  style={styles.icon}
                >
                  <I name="notifications-outline" color={C.ink} />
                </Pressable>
              ) : (
                <View style={{ width: 36 }} />
              )}
            </View>
          )}
          {user && (
            <View style={styles.mode}>
              <T style={{ fontSize: 9, color: "#9983AC" }}>
                {api.demo ? "YERLİ DEMO" : "API BAĞLIDIR · PİLOT"} ·{" "}
                {seller ? "MAĞAZA" : user.role === "admin" ? "ADMİN" : "ALICI"}
              </T>
              <Pressable onPress={() => go("connection")}>
                <T style={{ fontSize: 10, color: C.purple }}>Bağlantı</T>
              </Pressable>
            </View>
          )}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={{ flex: 1 }}>
              {[
                "home",
                "create",
                "ai",
                "review",
                "success",
                "requests",
                "detail",
                "offers",
                "compare",
                "offer",
                "store",
              ].includes(screen) ? (
                <BuyerScreens key={screen} />
              ) : [
                  "dashboard",
                  "feed",
                  "sellerRequest",
                  "sendOffer",
                  "myOffers",
                  "storeEdit",
                  "verification",
                  "analytics",
                  "moderation",
                ].includes(screen) ? (
                <SellerScreens key={screen} />
              ) : (
                <CommonScreens key={screen} />
              )}
            </View>
            {showTabs && (
              <SafeAreaView edges={["bottom"]} style={styles.tabs}>
                {tabs.map(([id, icon, title]) => (
                  <Pressable
                    key={id}
                    accessibilityLabel={title || "Yeni sorğu"}
                    onPress={() => {
                      if (id === "create") {
                        setDraft({ ...blankDraft });
                        setPhoto("");
                      }
                      setHistory([]);
                      setScreen(id);
                    }}
                    style={styles.tab}
                  >
                    {id === "create" ? (
                      <View style={styles.create}>
                        <I name="add" color="white" size={25} />
                      </View>
                    ) : (
                      <I
                        name={icon as any}
                        size={22}
                        color={screen === id ? C.purple : "#A69AB1"}
                      />
                    )}
                    <T
                      style={{
                        fontSize: 10,
                        marginTop: 5,
                        color: screen === id ? C.purple : "#A69AB1",
                        fontWeight: screen === id ? "700" : "400",
                      }}
                    >
                      {title}
                    </T>
                  </Pressable>
                ))}
              </SafeAreaView>
            )}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Context.Provider>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  header: {
    height: 62,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  icon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  tabs: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: C.line,
    flexDirection: "row",
    paddingTop: 12,
    minHeight: 72,
  },
  tab: { flex: 1, alignItems: "center", paddingBottom: 8 },
  create: {
    width: 47,
    height: 47,
    borderRadius: 16,
    backgroundColor: C.purple,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -27,
    borderWidth: 4,
    borderColor: C.bg,
  },
  mode: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 23,
    paddingBottom: 7,
  },
});
