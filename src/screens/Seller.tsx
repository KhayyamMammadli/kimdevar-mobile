import React, { useState } from "react";
import { Alert, Image, Switch, View } from "react-native";
import { api } from "../api";
import { useApp, useResource } from "../context";
import { Offer, RequestItem, Store } from "../types";
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
import { RequestCard } from "./Buyer";
export function SellerScreens() {
  const a = useApp(),
    { screen, go, request } = a;
  const [part, setPart] = useState("Hamısı"),
    [price, setPrice] = useState(""),
    [quality, setQuality] = useState("Uyğun alternativ"),
    [condition, setCondition] = useState("Yeni"),
    [stock, setStock] = useState("Stokda var"),
    [install, setInstall] = useState("0"),
    [warranty, setWarranty] = useState("30"),
    [delivery, setDelivery] = useState(false),
    [note, setNote] = useState(""),
    [validity, setValidity] = useState("24 saat"),
    [edited, setEdited] = useState<Store | null>(null);
  const path = ["dashboard", "feed"].includes(screen)
    ? "/requests"
    : screen === "myOffers"
      ? "/offers/mine"
      : ["storeEdit", "verification"].includes(screen)
        ? "/stores/mine"
        : screen === "analytics"
          ? "/analytics"
          : screen === "moderation"
            ? "/admin/overview"
            : undefined;
  const r = useResource<any>(
    path,
    ["dashboard", "feed", "myOffers"].includes(screen) ? [] : null,
  );
  const data = r.data;
  const err = r.error ? (
    <Note>
      {r.error}
      <T onPress={r.refresh} style={s.link}>
        {" "}
        Yenidən yoxla
      </T>
    </Note>
  ) : null;
  function open(item: RequestItem) {
    a.setRequest(item);
    go("sellerRequest");
  }
  if (screen === "dashboard")
    return (
      <Page onRefresh={r.refresh} refreshing={r.loading}>
        <T style={[s.overline, { marginTop: 18 }]}>MAĞAZA REJİMİ</T>
        <T style={[s.h1, { fontSize: 27, marginTop: 12 }]}>
          Salam, MobileFix <T style={{ color: "#8BB33F" }}>✦</T>
        </T>
        <T style={s.subtitle}>Yeni müştərilər səni gözləyir.</T>
        <View style={s.banner}>
          <T style={[s.h2, { color: "#fff" }]}>
            {data.length} uyğun sorğu var.{"\n"}İlk təklifi sən ver.
          </T>
          <T style={{ color: "#DCC9EE", lineHeight: 21, fontSize: 13 }}>
            Xidmət kateqoriyalarına və ərazinə uyğun.
          </T>
          <Button
            title="Sorğulara bax"
            secondary
            icon="arrow-forward"
            onPress={() => go("feed")}
          />
        </View>
        <Row
          icon="stats-chart-outline"
          title="Statistika"
          sub="Təklif və yazışma göstəricilərinə bax"
          onPress={() => go("analytics")}
        />
        <Section
          title="Son gələn sorğular"
          action="Hamısına bax"
          onPress={() => go("feed")}
        />
        {err}
        {r.loading ? (
          <Loading />
        ) : (
          data
            .slice(0, 3)
            .map((item: RequestItem) => (
              <RequestCard
                key={item.id}
                item={item}
                onPress={() => open(item)}
              />
            ))
        )}
        {!r.loading && !data.length && (
          <Empty
            title="Uyğun sorğu yoxdur"
            text="Kateqoriya, rayon və təsdiq statusunu yoxla."
          />
        )}
      </Page>
    );
  if (screen === "feed") {
    let list = data.filter(
      (x: RequestItem) => part === "Hamısı" || x.part === part,
    );
    return (
      <Page onRefresh={r.refresh} refreshing={r.loading}>
        <T style={s.micro}>Kateqoriya və rayon üzrə uyğun aktiv sorğular</T>
        <Chips
          values={["Hamısı", "Ekran", "Batareya", "Arxa qapaq", "Digər"]}
          value={part}
          onChange={setPart}
        />
        {err}
        {r.loading ? (
          <Loading />
        ) : list.length ? (
          list.map((item: RequestItem) => (
            <RequestCard key={item.id} item={item} onPress={() => open(item)} />
          ))
        ) : (
          <Empty
            title="Uyğun sorğu tapılmadı"
            text="Mağaza profili təsdiqlənmiş olmalıdır."
          />
        )}
      </Page>
    );
  }
  if (screen === "sellerRequest" && request)
    return (
      <Page>
        <Tag>Yeni sorğu</Tag>
        <T style={[s.h2, { marginTop: 20 }]}>{request.title}</T>
        <T style={s.subtitle}>
          {request.model} · Bakı, {request.district}
        </T>
        <Card>
          <View style={s.summary}>
            {[
              ["Büdcə", request.budget + " ₼-dək"],
              ["Təcililik", request.urgency],
              ["Hissə seçimi", request.quality],
              ["Hissə", request.part],
            ].map(([k, v]) => (
              <View key={k} style={s.summaryItem}>
                <T style={s.micro}>{k}</T>
                <T style={{ fontSize: 13 }}>{v}</T>
              </View>
            ))}
          </View>
          <T style={s.subtitle}>{request.note}</T>
          {request.image_id && (
            <Image
              source={api.image(request.image_id)}
              style={{ height: 180, width: "100%" }}
              resizeMode="contain"
            />
          )}
        </Card>
        <Note>
          Model uyğunluğunu və real stok vəziyyətini yoxladıqdan sonra təklif
          göndər.
        </Note>
        <Button
          title="Təklif hazırla"
          icon="pricetag-outline"
          onPress={() => go("sendOffer")}
        />
      </Page>
    );
  if (screen === "sendOffer" && request)
    return (
      <Page>
        <Card>
          <T style={s.h3}>{request.title}</T>
          <T style={s.subtitle}>Alıcının büdcəsi: {request.budget} ₼</T>
        </Card>
        <Field
          label="Qiymət (₼)"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          placeholder="95"
        />
        <T style={s.label}>Stok vəziyyəti</T>
        <Chips
          values={["Stokda var", "Sifarişlə"]}
          value={stock}
          onChange={setStock}
        />
        <T style={s.label}>Hissə növü</T>
        <Chips
          values={["Uyğun alternativ", "Orijinal"]}
          value={quality}
          onChange={setQuality}
        />
        <Chips
          values={["Yeni", "İşlənmiş"]}
          value={condition}
          onChange={setCondition}
        />
        <Field
          label="Quraşdırma qiyməti (₼, pulsuzdursa 0)"
          value={install}
          onChangeText={setInstall}
          keyboardType="decimal-pad"
        />
        <Field
          label="Zəmanət (gün)"
          value={warranty}
          onChangeText={setWarranty}
          keyboardType="number-pad"
        />
        <Row
          icon="bicycle-outline"
          title="Çatdırılma var"
          end={
            <Switch
              value={delivery}
              onValueChange={setDelivery}
              trackColor={{ true: C.purple }}
            />
          }
        />
        <T style={[s.label, { marginTop: 18 }]}>Təklifin müddəti</T>
        <Chips
          values={["24 saat", "48 saat", "72 saat"]}
          value={validity}
          onChange={setValidity}
        />
        <Field
          label="Əlavə qeyd"
          multiline
          value={note}
          onChangeText={setNote}
        />
        <Note>
          Göndərməklə qiymət və stok məlumatının düzgünlüyünü təsdiqləyirsən.
        </Note>
        <Button
          title={a.busy ? "Göndərilir..." : "Təklifi göndər"}
          disabled={a.busy}
          onPress={() =>
            a.run(async () => {
              const p = Number(price.replace(",", ".")),
                i = Number(install.replace(",", ".")),
                w = Number(warranty);
              if (
                !Number.isFinite(p) ||
                p <= 0 ||
                !Number.isFinite(i) ||
                i < 0 ||
                !Number.isInteger(w) ||
                w < 0
              )
                throw Error("Qiymət, quraşdırma və zəmanəti düzgün daxil et");
              await api.call("/requests/" + request.id + "/offers", "POST", {
                price: p,
                quality,
                condition,
                stock,
                installation: i,
                warranty: w,
                delivery,
                note,
                validity_hours: parseInt(validity),
              });
              Alert.alert("Təklif göndərildi");
              go("myOffers");
            })
          }
        />
      </Page>
    );
  if (screen === "myOffers")
    return (
      <Page onRefresh={r.refresh} refreshing={r.loading}>
        {err}
        {r.loading ? (
          <Loading />
        ) : data.length ? (
          data.map((o: Offer) => (
            <Card key={o.id}>
              <View style={s.between}>
                <T style={[s.h3, { flex: 1 }]}>{o.title}</T>
                <Tag green={o.status === "active"}>
                  {o.status === "active"
                    ? new Date(o.expires_at) > new Date()
                      ? "Aktiv"
                      : "Müddəti bitib"
                    : "Geri götürülüb"}
                </Tag>
              </View>
              <T style={[s.price, { marginVertical: 15 }]}>{o.price} ₼</T>
              <T style={s.micro}>
                {o.stock} · {o.quality}
              </T>
              <T style={s.subtitle}>
                Qüvvədədir: {new Date(o.expires_at).toLocaleString("az-AZ")}
              </T>
              <Button
                title="Təklifi yenilə"
                secondary
                onPress={() =>
                  a.run(async () => {
                    a.setRequest(await api.call("/requests/" + o.request_id));
                    go("sendOffer");
                  })
                }
              />
              {o.status === "active" && (
                <Button
                  title="Geri götür"
                  secondary
                  onPress={() =>
                    a.run(async () => {
                      await api.call("/offers/" + o.id, "DELETE");
                      r.refresh();
                    })
                  }
                />
              )}
            </Card>
          ))
        ) : (
          <Empty
            title="Hələ təklif göndərməmisən"
            action={<Button title="Sorğulara bax" onPress={() => go("feed")} />}
          />
        )}
      </Page>
    );
  if (screen === "storeEdit") {
    const st: Store = edited || data;
    if (!st) return <Page>{err || <Loading />}</Page>;
    function edit(key: string, value: any) {
      setEdited({ ...st, [key]: value });
    }
    return (
      <Page>
        <Tag green={st.verified}>
          {st.verified ? "Təsdiqlənmiş mağaza" : "Yoxlanma gözləyir"}
        </Tag>
        <View style={{ height: 20 }} />
        <Field
          label="Mağazanın adı"
          value={st.name}
          onChangeText={(v) => edit("name", v)}
        />
        <Field
          label="Telefon"
          value={st.phone}
          onChangeText={(v) => edit("phone", v)}
          keyboardType="phone-pad"
        />
        <Field
          label="Rayon"
          value={st.district}
          onChangeText={(v) => edit("district", v)}
        />
        <Field
          label="Ünvan"
          value={st.address}
          onChangeText={(v) => edit("address", v)}
        />
        <Field
          label="İş saatı"
          value={st.hours}
          onChangeText={(v) => edit("hours", v)}
        />
        <T style={s.label}>Xidmət kateqoriyaları</T>
        <Chips
          values={["Ekran", "Batareya", "Arxa qapaq", "Digər"]}
          value={st.categories}
          multi
          onChange={(v) =>
            edit(
              "categories",
              st.categories.includes(v)
                ? st.categories.filter((x) => x !== v)
                : [...st.categories, v],
            )
          }
        />
        <Note>
          Mağazanın adı və ya ünvanı dəyişərsə yenidən administrator təsdiqi
          tələb olunur.
        </Note>
        <Button
          title="Dəyişiklikləri saxla"
          disabled={a.busy}
          onPress={() =>
            a.run(async () => {
              if (!st.categories.length)
                throw Error("Ən az bir kateqoriya seç");
              await api.call("/stores/mine", "PATCH", st);
              Alert.alert("Məlumatlar saxlanıldı");
              go("dashboard");
            })
          }
        />
        <Button
          title="Təsdiq statusuna bax"
          secondary
          onPress={() => go("verification")}
        />
      </Page>
    );
  }
  if (screen === "verification")
    return (
      <Page>
        {err}
        {!data ? (
          <Loading />
        ) : (
          <>
            <Empty
              title={
                data.verified ? "Mağazan təsdiqlənib" : "Mağazan yoxlanılır"
              }
              text="Pilotda əlaqə və ünvan məlumatlarını administrator yoxlayır."
            />
            <Card>
              <Row
                icon="storefront-outline"
                title={data.name}
                sub={data.address}
              />
              <Row
                icon="shield-checkmark-outline"
                title="Təsdiq statusu"
                sub={
                  data.verified ? "Təsdiqlənib" : "Moderator təsdiqi gözləyir"
                }
              />
            </Card>
            <Note>
              Təsdiq nişanı məhsulun keyfiyyətinə və stokuna zəmanət vermir.
            </Note>
          </>
        )}
      </Page>
    );
  if (screen === "analytics")
    return (
      <Page onRefresh={r.refresh} refreshing={r.loading}>
        <T style={s.h2}>Mağazan rəqəmlərdə</T>
        <T style={s.subtitle}>Bütün dövr üzrə real API qeydləri.</T>
        {err}
        {!data ? (
          <Loading />
        ) : (
          <>
            <View style={s.stats}>
              {[
                ["Təklif", data.offers],
                ["Aktiv", data.active_offers],
                ["Yazışma", data.conversations],
              ].map(([k, v]) => (
                <View key={k} style={s.stat}>
                  <T style={s.statNum}>{v}</T>
                  <T style={s.micro}>{k}</T>
                </View>
              ))}
            </View>
            <Card>
              <Row
                icon="chatbubble-outline"
                title="Təklifdən yazışmaya keçid"
                sub="Yazışma sayı / göndərilən təklif sayı"
                end={
                  <T
                    style={{ fontSize: 23, fontWeight: "700", color: C.purple }}
                  >
                    {data.offers
                      ? Math.round((data.conversations / data.offers) * 100)
                      : 0}
                    %
                  </T>
                }
              />
            </Card>
            <Note>
              Məhsulun satıldığını yoxlayan ödəniş inteqrasiyası yoxdur. Yazışma
              satış kimi sayılmır.
            </Note>
          </>
        )}
      </Page>
    );
  if (screen === "moderation")
    return (
      <Page onRefresh={r.refresh} refreshing={r.loading}>
        <Tag>Administrator · Demo</Tag>
        <T style={[s.h2, { marginTop: 20 }]}>Yoxlama gözləyənlər</T>
        {err}
        {!data ? (
          <Loading />
        ) : (
          <>
            <Section title="Mağaza təsdiqləri" />
            {data.stores.length ? (
              data.stores.map((st: Store) => (
                <Card key={st.id}>
                  <T style={s.h3}>{st.name}</T>
                  <T style={s.subtitle}>{st.address}</T>
                  <Button
                    title="Mağazanı təsdiqlə"
                    onPress={() =>
                      a.run(async () => {
                        await api.call(
                          "/admin/stores/" + st.id + "/verify",
                          "POST",
                        );
                        r.refresh();
                      })
                    }
                  />
                </Card>
              ))
            ) : (
              <T style={s.micro}>Yoxlama gözləyən mağaza yoxdur.</T>
            )}
            <Section title="Şikayətlər" />
            {data.reports.map((report: any) => (
              <Card key={report.id}>
                <Tag>{report.status}</Tag>
                <T style={[s.h3, { marginTop: 12 }]}>{report.reason}</T>
                <T style={s.subtitle}>{report.detail}</T>
              </Card>
            ))}
          </>
        )}
        <Button
          title="Alıcı hesabına keç"
          secondary
          onPress={() => a.login("buyer")}
        />
      </Page>
    );
  return (
    <Page>
      <Empty
        title="Əvvəl sorğu seç"
        action={<Button title="Gələn sorğular" onPress={() => go("feed")} />}
      />
    </Page>
  );
}
