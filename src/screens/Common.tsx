import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, Switch, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api";
import { useApp, useResource } from "../context";
import { Conversation, Message, Notice, Store, User } from "../types";
import {
  Button,
  C,
  Card,
  Chips,
  Empty,
  Field,
  I,
  Loading,
  Note,
  Page,
  Row,
  Section,
  T,
  Tag,
  s,
} from "../ui";
export function CommonScreens() {
  const a = useApp();
  const { screen, go, user } = a;
  const [step, setStep] = useState(0),
    [text, setText] = useState(""),
    [name, setName] = useState(user?.name || ""),
    [phone, setPhone] = useState(user?.phone || ""),
    [district, setDistrict] = useState(user?.district || "Xətai"),
    [apiUrl, setApiUrl] = useState(api.base),
    [reason, setReason] = useState("Yanlış qiymət və ya stok"),
    [message, setMessage] = useState(""),
    [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const path =
    screen === "messages"
      ? "/conversations"
      : screen === "chat" && a.conversation
        ? `/conversations/${a.conversation.id}/messages`
        : screen === "notifications"
          ? "/notifications"
          : screen === "favorites"
            ? "/favorites"
            : undefined;
  const r = useResource<any[]>(path, []);
  useEffect(() => {
    if (screen === "settings")
      AsyncStorage.getItem("kv-preferences").then((raw) => {
        if (raw) setPrefs(JSON.parse(raw));
      });
  }, [screen]);
  useEffect(() => {
    if (screen !== "chat" || !path) return;
    const timer = setInterval(r.refresh, 6000);
    return () => clearInterval(timer);
  }, [screen, path]);
  async function send() {
    if (!message.trim()) return;
    await api.call(`/conversations/${a.conversation?.id}/messages`, "POST", {
      text: message,
    });
    setMessage("");
    r.refresh();
  }
  const err = r.error ? (
    <Note>
      {r.error}
      <T style={s.link} onPress={r.refresh}>
        {" "}
        Yenidən yoxla
      </T>
    </Note>
  ) : null;
  if (screen === "splash")
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: C.purple,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../../assets/icon.png")}
          style={{ width: 150, height: 150, borderRadius: 34 }}
        />
        <T
          style={{
            fontSize: 35,
            fontWeight: "800",
            color: "white",
            letterSpacing: -1,
            marginTop: 12,
          }}
        >
          KimdəVar
        </T>
        <T style={{ color: "#D8C5EE", fontSize: 13, marginTop: 15 }}>
          Sən soruş, təkliflər gəlsin.
        </T>
      </View>
    );
  if (screen === "onboard")
    return (
      <Page>
        <Pressable
          style={{ alignSelf: "flex-end", marginTop: 20 }}
          onPress={() =>
            a.run(async () => {
              await AsyncStorage.setItem("kv-onboarded", "1");
              go("login");
            })
          }
        >
          <T style={s.link}>Keç</T>
        </Pressable>
        <View
          style={{
            height: 260,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 200,
              height: 200,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: "#DDCFED",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: C.soft,
            }}
          >
            <Image
              source={require("../../assets/icon.png")}
              style={{ width: 105, height: 105, borderRadius: 28 }}
            />
          </View>
          <View style={{ position: "absolute", bottom: 16, right: 0 }}>
            <Tag green>✓ Təklif sənə gəlsin</Tag>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 5, marginVertical: 25 }}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                height: 5,
                width: i === step ? 21 : 5,
                borderRadius: 5,
                backgroundColor: i === step ? C.purple : "#D6C7E7",
              }}
            />
          ))}
        </View>
        <T style={s.h1}>
          {
            [
              "Axtardığını yaz.\nTəkliflər sənə gəlsin.",
              "Bir neçə mağaza.\nSeçim sənin olsun.",
              "Uyğun təklifi seç.\nMağazaya yaz.",
            ][step]
          }
        </T>
        <T style={[s.subtitle, { marginVertical: 25 }]}>
          {
            [
              "Ehtiyacını mətn və ya şəkillə bildir. Uyğun mağazalar qiymət və stokla bağlı cavab versin.",
              "Qiyməti, hissə növünü, quraşdırmanı və zəmanəti bir yerdə müqayisə et.",
              "Şərtləri satıcı ilə dəqiqləşdir. Məhsulu tapdıqda sorğunu tamamla.",
            ][step]
          }
        </T>
        <Button
          title={step === 2 ? "Başlayaq" : "Davam et"}
          icon="arrow-forward"
          onPress={() =>
            step < 2
              ? setStep(step + 1)
              : a.run(async () => {
                  await AsyncStorage.setItem("kv-onboarded", "1");
                  go("login");
                })
          }
        />
      </Page>
    );
  if (screen === "login")
    return (
      <Page>
        <View style={{ marginTop: 48, marginBottom: 25 }}>
          <Image
            source={require("../../assets/icon.png")}
            style={{ width: 68, height: 68, borderRadius: 20 }}
          />
          <T style={[s.h1, { marginTop: 26 }]}>Xoş gəlmisən!</T>
          <T style={s.subtitle}>KimdəVar-ı alıcı və mağaza tərəfdən sına.</T>
        </View>
        <Tag>
          {api.demo
            ? "YERLİ DEMO · SERVER TƏLƏB ETMİR"
            : "API REJİMİ · DEMO HESABLARI"}
        </Tag>
        <Note>
          İlkin pilot versiyasıdır. Demo hesablar ortaqdır; real telefon nömrəsi
          və şəxsi məlumat yazma. SMS qeydiyyatı hələ inteqrasiya olunmayıb.
        </Note>
        <Button
          title="Alıcı kimi sına"
          disabled={a.busy}
          icon="person-outline"
          onPress={() => a.login("buyer")}
        />
        <Button
          title="Mağaza kimi sına"
          secondary
          disabled={a.busy}
          icon="storefront-outline"
          onPress={() => a.login("seller")}
        />
        <Button
          title="API bağlantısını sazla"
          secondary
          onPress={() => go("connection")}
        />
        <Pressable
          onPress={() => a.login("admin")}
          style={{ padding: 18, alignItems: "center" }}
        >
          <T style={s.micro}>Moderator demo hesabı</T>
        </Pressable>
      </Page>
    );
  if (screen === "connection")
    return (
      <Page>
        <T style={s.h2}>Backend-ə qoşul</T>
        <T style={s.subtitle}>
          API ünvanını boş saxlasan tətbiq telefonun daxilində demo məlumatlarla
          işləyəcək.
        </T>
        <Field
          label="Python API ünvanı"
          value={apiUrl}
          onChangeText={setApiUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="https://...-8000.app.github.dev"
        />
        <Note>
          Codespaces-də 8000 portunu telefondan əlçatan et. URL sonunda /docs
          olmamalıdır. Dəyişdikdən sonra demo hesabına yenidən daxil ol.
        </Note>
        <Button
          title="Bağlantını yoxla"
          disabled={a.busy}
          secondary
          onPress={() =>
            a.run(async () => {
              const url = apiUrl.trim().replace(/\/$/, "");
              if (!url) {
                Alert.alert("Yerli demo seçilib");
                return;
              }
              const controller = new AbortController();
              const t = setTimeout(() => controller.abort(), 10000);
              try {
                const res = await fetch(url + "/health", {
                  signal: controller.signal,
                });
                if (!res.ok) throw Error("Porta giriş yoxdur: " + res.status);
                const h = await res.json();
                if (h.status !== "ok") throw Error("Bu KimdəVar API-si deyil");
                Alert.alert(
                  "Bağlantı uğurludur",
                  h.demo_mode
                    ? "Demo giriş aktivdir."
                    : "DEMO_MODE=false. Demo giriş deaktivdir.",
                );
              } finally {
                clearTimeout(t);
              }
            })
          }
        />
        <Button
          title="Saxla və girişə qayıt"
          disabled={a.busy}
          onPress={() =>
            a.run(async () => {
              if (user) await a.logout();
              await api.configure(apiUrl);
              go("login");
            })
          }
        />
        <Button
          title="Yerli demo ilə davam et"
          secondary
          onPress={() =>
            a.run(async () => {
              if (user) await a.logout();
              await api.configure("");
              go("login");
            })
          }
        />
      </Page>
    );
  if (screen === "messages")
    return (
      <Page onRefresh={r.refresh} refreshing={r.loading}>
        {err}
        {r.loading ? (
          <Loading />
        ) : r.data.length ? (
          r.data.map((c: Conversation) => (
            <Card
              key={c.id}
              onPress={() => {
                a.setConversation(c);
                go("chat");
              }}
            >
              <View style={s.row}>
                <View style={s.avatar}>
                  <I name="chatbubbles-outline" />
                </View>
                <View style={{ flex: 1 }}>
                  <T style={s.h3}>
                    {user?.role === "seller" ? c.buyer_name : c.store_name}
                  </T>
                  <T style={[s.micro, { marginTop: 6 }]}>
                    {c.last_message || "Yazışmanı başlat"}
                  </T>
                  <View style={{ marginTop: 10 }}>
                    <Tag>{c.request_title}</Tag>
                  </View>
                </View>
                <I name="chevron-forward" size={18} />
              </View>
            </Card>
          ))
        ) : (
          <Empty
            title="Hələ yazışman yoxdur"
            text="Təklifdən “Mağazaya yaz” düyməsi ilə əlaqə yarat."
          />
        )}
      </Page>
    );
  if (screen === "chat")
    return (
      <View style={{ flex: 1 }}>
        <Page onRefresh={r.refresh} refreshing={false}>
          <Tag>{a.conversation?.request_title || "Sorğu üzrə yazışma"}</Tag>
          {err}
          {r.loading && !r.data.length ? (
            <Loading />
          ) : r.data.length ? (
            r.data.map((m: Message) => (
              <View
                key={m.id}
                style={{
                  alignSelf:
                    m.sender_id === user?.id ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  backgroundColor: m.sender_id === user?.id ? C.purple : "#fff",
                  padding: 14,
                  borderRadius: 17,
                  marginTop: 14,
                  borderWidth: 1,
                  borderColor: C.line,
                }}
              >
                <T
                  style={{
                    color: m.sender_id === user?.id ? "#fff" : C.ink,
                    fontSize: 14,
                    lineHeight: 22,
                  }}
                >
                  {m.text}
                </T>
                <T
                  style={{
                    fontSize: 9,
                    color: m.sender_id === user?.id ? "#C9B5E3" : C.muted,
                    textAlign: "right",
                    marginTop: 8,
                  }}
                >
                  {new Date(m.created_at).toLocaleTimeString("az-AZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </T>
              </View>
            ))
          ) : (
            <Empty
              title="İlk mesajı sən yaz"
              text="Model, stok və quraşdırmanı mağaza ilə dəqiqləşdir."
            />
          )}
        </Page>
        <View
          style={{
            padding: 15,
            paddingBottom: 25,
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderColor: C.line,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Field
                label="Mesajın"
                value={message}
                onChangeText={setMessage}
                placeholder="Salam, bu hissə modelimə uyğundur?"
              />
            </View>
            <Pressable
              disabled={a.busy || !message.trim()}
              accessibilityLabel="Mesaj göndər"
              onPress={() => a.run(send)}
              style={{
                padding: 12,
                backgroundColor: C.purple,
                borderRadius: 13,
                opacity: a.busy ? 0.5 : 1,
              }}
            >
              <I name="send" color="#fff" size={20} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  if (screen === "notifications")
    return (
      <Page onRefresh={r.refresh} refreshing={r.loading}>
        <View style={s.between}>
          <T style={s.overline}>SON YENİLİKLƏR</T>
          <Pressable
            onPress={() =>
              a.run(async () => {
                await api.call("/notifications/read", "POST");
                r.refresh();
              })
            }
          >
            <T style={s.link}>Hamısını oxundu say</T>
          </Pressable>
        </View>
        {err}
        <View style={{ height: 18 }} />
        {r.data.length ? (
          r.data.map((n: Notice) => (
            <Card
              key={n.id}
              style={{ backgroundColor: n.read ? "#fff" : C.soft }}
              onPress={() =>
                a.run(async () => {
                  if (n.kind === "message") {
                    const list =
                      await api.call<Conversation[]>("/conversations");
                    const c = list.find((c) => c.id === n.target_id);
                    if (c) {
                      a.setConversation(c);
                      go("chat");
                    }
                  } else {
                    a.setRequest(await api.call("/requests/" + n.target_id));
                    go(user?.role === "seller" ? "sellerRequest" : "offers");
                  }
                })
              }
            >
              <View style={s.row}>
                <I
                  name={
                    n.kind === "message"
                      ? "chatbubble-outline"
                      : "pricetag-outline"
                  }
                />
                <View style={{ flex: 1 }}>
                  <T style={s.h3}>{n.title}</T>
                  <T style={s.subtitle}>{n.body}</T>
                  <T style={s.micro}>
                    {new Date(n.created_at).toLocaleString("az-AZ")}
                  </T>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Empty
            title="Hələ yenilik yoxdur"
            text="Yeni təklif və mesaj bildirişləri burada görünəcək."
          />
        )}
      </Page>
    );
  if (screen === "profile")
    return (
      <Page>
        <View style={[s.row, { marginTop: 18, marginBottom: 25 }]}>
          <View style={[s.avatar, { width: 65, height: 65, borderRadius: 22 }]}>
            <T style={{ fontSize: 23, color: C.purple, fontWeight: "800" }}>
              {user?.name.slice(0, 2).toUpperCase()}
            </T>
          </View>
          <View>
            <T style={s.h2}>{user?.name}</T>
            <T style={s.micro}>{user?.phone || "Demo hesabı"}</T>
            <Pressable onPress={() => go("editProfile")}>
              <T style={[s.link, { marginTop: 9 }]}>Profili redaktə et</T>
            </Pressable>
          </View>
        </View>
        <Card>
          {user?.role === "buyer" && (
            <Row
              icon="list-outline"
              title="Sorğularım"
              sub="Aktiv və əvvəlki sorğular"
              onPress={() => go("requests")}
            />
          )}
          <Row
            icon="heart-outline"
            title="Saxlanılan mağazalar"
            onPress={() => go("favorites")}
          />
          <Row
            icon="location-outline"
            title="Məkanım"
            sub={"Bakı, " + user?.district}
            onPress={() => go("location")}
          />
          <Row
            icon="shield-checkmark-outline"
            title="Ayarlar və məxfilik"
            onPress={() => go("settings")}
          />
          <Row
            icon="help-circle-outline"
            title="Dəstək və şikayət"
            onPress={() => go("report")}
          />
        </Card>
        {user?.role === "seller" && (
          <>
            <Button
              title="Mağaza profilini yenilə"
              secondary
              onPress={() => go("storeEdit")}
            />
            <Button
              title="Statistika"
              secondary
              onPress={() => go("analytics")}
            />
          </>
        )}
        <Section title="Demo rejimini dəyiş" />
        <Button
          title={
            user?.role === "seller"
              ? "Alıcı kimi davam et"
              : "Mağaza kimi davam et"
          }
          secondary
          onPress={() => a.login(user?.role === "seller" ? "buyer" : "seller")}
        />
        <Note>
          Demo hesabları arasında dəyişərək eyni sorğuya təklif verib nəticəni
          alıcı tərəfindən görə bilərsən.
        </Note>
        <Button
          title="Hesabdan çıx"
          secondary
          onPress={() => a.run(a.logout)}
        />
      </Page>
    );
  if (screen === "editProfile" || screen === "location")
    return (
      <Page>
        <T style={[s.h2, { marginTop: 12 }]}>
          {screen === "location" ? "Harada axtarırsan?" : "Məlumatların"}
        </T>
        <T style={s.subtitle}>
          {screen === "location"
            ? "Dəqiq GPS mövqeyi tələb olunmur. Rayonu əl ilə seç."
            : "Demo hesabına real şəxsi məlumat daxil etmə."}
        </T>
        {screen === "editProfile" && (
          <>
            <Field label="Ad və soyad" value={name} onChangeText={setName} />
            <Field
              label="Telefon"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </>
        )}
        <T style={s.label}>Şəhər: Bakı</T>
        <Chips
          values={[
            "Xətai",
            "Nərimanov",
            "Nəsimi",
            "Yasamal",
            "Binəqədi",
            "Sabunçu",
          ]}
          value={district}
          onChange={setDistrict}
        />
        <Button
          title="Dəyişiklikləri saxla"
          disabled={a.busy}
          onPress={() =>
            a.run(async () => {
              if (!name.trim()) throw Error("Adı daxil et");
              const u = await api.call<User>("/me", "PATCH", {
                name,
                phone,
                district,
              });
              a.setUser(u);
              go("profile");
            })
          }
        />
      </Page>
    );
  if (screen === "favorites")
    return (
      <Page onRefresh={r.refresh} refreshing={r.loading}>
        {err}
        {r.data.length ? (
          r.data.map((st: Store) => (
            <Card key={st.id}>
              <Pressable
                onPress={() => {
                  a.setStore(st);
                  go("store");
                }}
              >
                <T style={s.h3}>{st.name} ✓</T>
                <T style={s.subtitle}>Bakı, {st.district}</T>
              </Pressable>
              <Button
                title="Saxlanılanlardan sil"
                secondary
                onPress={() =>
                  a.run(async () => {
                    await api.call("/favorites/" + st.id, "DELETE");
                    r.refresh();
                  })
                }
              />
            </Card>
          ))
        ) : (
          <Empty
            title="Saxlanılan mağaza yoxdur"
            text="Təklif kartındakı ürək işarəsinə toxun."
          />
        )}
      </Page>
    );
  if (screen === "settings")
    return (
      <Page>
        <Section title="Tətbiqdaxili seçimlər" />
        <Card>
          {["Yeni təkliflər", "Yeni mesajlar", "Sorğu yenilikləri"].map((t) => (
            <Row
              key={t}
              icon="notifications-outline"
              title={t}
              end={
                <Switch
                  trackColor={{ true: C.purple, false: "#D8CDE3" }}
                  value={prefs[t] !== false}
                  onValueChange={async (v) => {
                    const p = { ...prefs, [t]: v };
                    setPrefs(p);
                    await AsyncStorage.setItem(
                      "kv-preferences",
                      JSON.stringify(p),
                    );
                  }}
                />
              }
            />
          ))}
        </Card>
        <Note>
          Seçimlər cihazında saxlanır. Push çatdırılması hələ inteqrasiya
          olunmayıb.
        </Note>
        <Card>
          <Row
            icon="language-outline"
            title="Tətbiqin dili"
            sub="Azərbaycan dili"
          />
          <Row
            icon="link-outline"
            title="API bağlantısı"
            onPress={() => go("connection")}
          />
          <Row
            icon="information-circle-outline"
            title="Sistem halları"
            onPress={() => go("states")}
          />
        </Card>
        <T style={s.subtitle}>
          Şəkillər sorğunun hissəsi kimi saxlanır və uyğun mağazalar görə bilir.
          API rejimində məlumat serverdə, yerli demoda cihazında qalır. Bu
          versiya sınaq üçündür.
        </T>
        <Button
          title="Hesabdan çıx"
          secondary
          onPress={() => a.run(a.logout)}
        />
        <Button
          title="Demo hesabını sil"
          secondary
          onPress={() =>
            Alert.alert(
              "Hesabı silək?",
              "Sorğular, təkliflər və yazışmalar geri qaytarılmadan silinəcək. Ortaq API demo hesabı digər test cihazlarına da təsir edir.",
              [
                { text: "Geri", style: "cancel" },
                {
                  text: "Sil",
                  style: "destructive",
                  onPress: () =>
                    a.run(async () => {
                      await api.call("/me", "DELETE");
                      await a.logout();
                    }),
                },
              ],
            )
          }
        />
      </Page>
    );
  if (screen === "report")
    return (
      <Page>
        <T style={s.h2}>Nə baş verib?</T>
        <T style={s.subtitle}>
          Problemi bildir, yoxlamaq üçün moderatora yönləndirək.
        </T>
        <Chips
          values={[
            "Yanlış qiymət və ya stok",
            "Uyğun olmayan məhsul",
            "Spam və ya saxta mağaza",
            "Digər",
          ]}
          value={reason}
          onChange={setReason}
        />
        <Field
          label="Ətraflı məlumat"
          multiline
          value={text}
          onChangeText={setText}
          placeholder="Problemi təsvir et..."
        />
        <Button
          title="Şikayəti göndər"
          disabled={a.busy}
          onPress={() =>
            a.run(async () => {
              if (text.trim().length < 3) throw Error("Problemi təsvir et");
              await api.call("/reports", "POST", { reason, detail: text });
              Alert.alert("Şikayət qeydə alındı");
              a.back();
            })
          }
        />
      </Page>
    );
  return (
    <Page>
      <Empty
        title="Hələ təklif gəlməyib"
        text="Sorğunu paylaşdıqdan sonra mağazalar cavab verə bilər."
      />
      <Note>
        Bağlantı kəsildikdə xəta və yenidən yoxlama düyməsi göstərilir. API
        xətasında tətbiq səssizcə demo məlumatlara keçmir.
      </Note>
      <Loading />
      <Button title="Geri qayıt" secondary onPress={a.back} />
    </Page>
  );
}
