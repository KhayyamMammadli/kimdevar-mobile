import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  User,
  RequestItem,
  Store,
  Offer,
  Conversation,
  Message,
  Notice,
} from "./types";
type DB = {
  requests: RequestItem[];
  stores: Store[];
  offers: Offer[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notice[];
  favorites: string[];
  profiles: Record<string, User>;
  reports: any[];
};
const stamp = () => new Date().toISOString();
const id = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const defaultDB = (): DB => ({
  requests: [
    {
      id: "demo-request",
      buyer_id: "demo-buyer",
      title: "Samsung A52 ekranı",
      brand: "Samsung",
      model: "Galaxy A52",
      part: "Ekran",
      budget: 120,
      district: "Xətai",
      urgency: "Bu gün",
      quality: "Fərq etmir",
      note: "Quraşdırma ilə birlikdə qiymət təklif edin.",
      status: "active",
      created_at: stamp(),
    },
  ],
  stores: [
    {
      id: "mobilefix",
      owner_id: "demo-seller",
      name: "MobileFix",
      district: "Xətai",
      address: "Əhmədli metrosu yaxınlığı",
      phone: "",
      categories: ["Ekran", "Batareya", "Arxa qapaq", "Digər"],
      verified: true,
      hours: "09:00–20:00",
    },
    {
      id: "telefon-dunyasi",
      owner_id: "seed-owner",
      name: "Telefon Dünyası",
      district: "Xətai",
      address: "Bakı, Xətai",
      phone: "",
      categories: ["Ekran", "Batareya"],
      verified: true,
      hours: "09:00–20:00",
    },
  ],
  offers: [95, 110].map((price, i) => ({
    id: "offer-" + i,
    request_id: "demo-request",
    store_id: i ? "telefon-dunyasi" : "mobilefix",
    price,
    quality: i ? "Orijinal" : "Uyğun alternativ",
    condition: "Yeni",
    stock: "Stokda var",
    installation: i ? 0 : 10,
    delivery: true,
    warranty: 30,
    note: "Model uyğunluğunu əvvəlcədən dəqiqləşdirin.",
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    created_at: stamp(),
    status: "active",
  })),
  conversations: [],
  messages: [],
  notifications: [],
  favorites: [],
  profiles: {},
  reports: [],
});
let data: DB | undefined;
let actor: User;
async function db() {
  if (!data) {
    const raw = await AsyncStorage.getItem("kv-demo-db");
    data = raw ? JSON.parse(raw) : defaultDB();
  }
  return data!;
}
async function save() {
  await AsyncStorage.setItem("kv-demo-db", JSON.stringify(data));
}
export async function demoCall(
  path: string,
  method = "GET",
  body?: any,
): Promise<any> {
  const d = await db();
  if (path === "/auth/demo") {
    actor = d.profiles[body.role] || {
      id: "demo-" + body.role,
      name: body.role === "seller" ? "MobileFix sahibi" : "Xəyyam",
      role: body.role,
      phone: "",
      district: "Xətai",
    };
    return { user: actor, token: "local-demo", demo: true };
  }
  if (path === "/health")
    return { status: "ok", database: "on-device-demo", demo_mode: true };
  if (!actor) throw Error("Demo hesabı ilə daxil ol");
  if (path === "/auth/logout") return { ok: true };
  if (path === "/me") {
    if (method === "PATCH") {
      actor = { ...actor, ...body };
      d.profiles[actor.role] = actor;
      await save();
    }
    if (method === "DELETE") {
      await AsyncStorage.removeItem("kv-demo-db");
      data = undefined;
    }
    return actor;
  }
  const mine = d.stores.find((s) => s.owner_id === actor.id)!;
  if (path === "/ai/analyze") {
    let text = body.text.toLowerCase();
    let model =
      text.match(
        /iphone\s*\d+(?:\s*pro(?:\s*max)?)?|[as]\d{2}|redmi\s*(?:note\s*)?\d+/,
      )?.[0] || "";
    return {
      brand: text.includes("iphone")
        ? "Apple"
        : text.includes("samsung")
          ? "Samsung"
          : text.includes("xiaomi")
            ? "Xiaomi"
            : "",
      model,
      part: text.includes("batareya")
        ? "Batareya"
        : text.includes("qapaq")
          ? "Arxa qapaq"
          : text.includes("ekran")
            ? "Ekran"
            : "Digər",
      budget: Number(text.match(/(\d+)\s*(?:₼|azn|manat)/)?.[1] || 0),
      district: actor.district,
      provider: "rules-demo",
    };
  }
  if (path === "/requests") {
    if (method === "POST") {
      let r = {
        ...body,
        id: id(),
        buyer_id: actor.id,
        status: "active",
        created_at: stamp(),
      };
      d.requests.unshift(r);
      await save();
      return r;
    }
    return d.requests
      .filter((r) =>
        actor.role === "buyer"
          ? r.buyer_id === actor.id
          : actor.role === "admin" ||
            (r.status === "active" &&
              mine?.verified &&
              r.district === mine.district &&
              mine.categories.includes(r.part)),
      )
      .map((r) => ({
        ...r,
        offer_count: d.offers.filter(
          (o) =>
            o.request_id === r.id &&
            o.status === "active" &&
            o.expires_at > stamp(),
        ).length,
      }));
  }
  const ro = path.match(/^\/requests\/([^/]+)\/offers$/);
  if (ro) {
    if (method === "POST") {
      let old = d.offers.find(
        (o) => o.request_id === ro[1] && o.store_id === mine.id,
      );
      let o = {
        ...body,
        id: old?.id || id(),
        request_id: ro[1],
        store_id: mine.id,
        status: "active",
        created_at: stamp(),
        expires_at: new Date(
          Date.now() + body.validity_hours * 3600000,
        ).toISOString(),
      };
      d.offers = d.offers.filter((o) => o.id !== old?.id);
      d.offers.push(o);
      d.notifications.unshift({
        id: id(),
        title: "Yeni təklif",
        body: mine.name + " mağazasından " + o.price + " ₼",
        target_id: ro[1],
        kind: "offer",
        read: false,
        created_at: stamp(),
      });
      await save();
      return o;
    }
    return d.offers
      .filter(
        (o) =>
          o.request_id === ro[1] &&
          o.status === "active" &&
          o.expires_at > stamp(),
      )
      .map((o) => ({
        ...o,
        store_name: d.stores.find((s) => s.id === o.store_id)?.name,
      }));
  }
  const rr = path.match(/^\/requests\/([^/]+)$/);
  if (rr) {
    let r = d.requests.find((r) => r.id === rr[1]);
    if (!r) throw Error("Sorğu tapılmadı");
    if (method === "PATCH") {
      Object.assign(r, body);
      await save();
    }
    return r;
  }
  if (path === "/offers/mine")
    return d.offers
      .filter((o) => o.store_id === mine.id)
      .map((o) => ({
        ...o,
        title: d.requests.find((r) => r.id === o.request_id)?.title,
      }));
  if (path.startsWith("/offers/") && method === "DELETE") {
    d.offers = d.offers.map((o) =>
      o.id === path.split("/")[2] ? { ...o, status: "withdrawn" } : o,
    );
    await save();
    return { ok: true };
  }
  if (path === "/stores/mine") {
    if (method === "PATCH") {
      const changed =
        mine.name !== body.name ||
        mine.address !== body.address ||
        mine.district !== body.district;
      Object.assign(mine, body, { verified: changed ? false : mine.verified });
      await save();
    }
    return mine;
  }
  if (path === "/stores") return d.stores.filter((s) => s.verified);
  if (path.startsWith("/stores/"))
    return d.stores.find((s) => s.id === path.split("/")[2]);
  if (path === "/favorites")
    return d.stores.filter((s) => d.favorites.includes(s.id));
  if (path.startsWith("/favorites/")) {
    let sid = path.split("/")[2];
    d.favorites =
      method === "DELETE"
        ? d.favorites.filter((x) => x !== sid)
        : [...new Set([...d.favorites, sid])];
    await save();
    return { ok: true };
  }
  if (path === "/conversations") {
    if (method === "POST") {
      let conv = d.conversations.find(
        (c) => c.request_id === body.request_id && c.store_id === body.store_id,
      );
      if (!conv) {
        conv = { ...body, id: id(), buyer_id: actor.id };
        d.conversations.unshift(conv!);
        await save();
      }
      return conv;
    }
    return d.conversations
      .filter((c) =>
        actor.role === "buyer"
          ? c.buyer_id === actor.id
          : c.store_id === mine?.id,
      )
      .map((c) => ({
        ...c,
        store_name: d.stores.find((s) => s.id === c.store_id)?.name,
        buyer_name: "Xəyyam",
        request_title: d.requests.find((r) => r.id === c.request_id)?.title,
        last_message: d.messages
          .filter((m) => m.conversation_id === c.id)
          .at(-1)?.text,
      }));
  }
  const cm = path.match(/^\/conversations\/([^/]+)\/messages$/);
  if (cm) {
    if (method === "POST") {
      let m = {
        ...body,
        id: id(),
        conversation_id: cm[1],
        sender_id: actor.id,
        created_at: stamp(),
      };
      d.messages.push(m);
      await save();
      return m;
    }
    return d.messages.filter((m) => m.conversation_id === cm[1]);
  }
  if (path === "/notifications")
    return actor.role === "buyer" ? d.notifications : [];
  if (path === "/notifications/read") {
    d.notifications.forEach((n) => (n.read = true));
    await save();
    return { ok: true };
  }
  if (path === "/reports") {
    d.reports.push({
      ...body,
      id: id(),
      created_at: stamp(),
      status: "pending",
    });
    await save();
    return { ok: true };
  }
  if (path === "/analytics")
    return {
      offers: d.offers.filter((o) => o.store_id === mine.id).length,
      active_offers: d.offers.filter(
        (o) => o.store_id === mine.id && o.status === "active",
      ).length,
      conversations: d.conversations.filter((c) => c.store_id === mine.id)
        .length,
    };
  if (path === "/admin/overview")
    return { stores: d.stores.filter((s) => !s.verified), reports: d.reports };
  if (path.startsWith("/admin/stores/")) {
    let s = d.stores.find((s) => s.id === path.split("/")[3]);
    if (s) s.verified = true;
    await save();
    return { ok: true };
  }
  throw Error("Bu əməliyyat demo rejimində mövcud deyil");
}
