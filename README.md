# KimdəVar — React Native + Expo

Azərbaycan dilində alıcı–mağaza tətbiqinin işlək pilotu. Mövcud bənövşəyi/yaşıl dizayn native React Native komponentlərinə çevrilib; WebView istifadə olunmur.

## 1. Ən asan ilk baxış: yalnız mobil repo

GitHub → **Code → Codespaces → Create codespace on main**. Quraşdırmanın bitməsini gözlə. Terminalda:

```bash
npm run tunnel
```

Əgər avtomatik quraşdırma işləməyibsə əvvəl `npm ci` et. Expo Go ilə terminaldakı QR kodunu aç (iPhone-da Camera, Android-də Expo Go). Kompüter və telefon eyni Wi-Fi-da olmalı deyil. Codespace işlək qalmalıdır. `@expo/ngrok` layihədə dev dependency kimi var; qlobal install tələb olunmur. Tunnel xarici Expo/ngrok xidmətindən asılıdır, onların dayanması tətbiq xətası deyil.

İlk girişdə **Alıcı kimi sına** seç. API URL boş olduqda məlumat telefonda saxlanır. **Hesabım → Mağaza kimi davam et** ilə eyni sorğuya təklif göndər, sonra alıcı rejiminə qayıt. Demo məlumatlar app restartından sonra qalır.

### Expo Go uyğunluğu

Bu pilot fiziki iPhone-dakı App Store Expo Go ilə uyğunluq üçün **Expo SDK 54 / React Native 0.81 / React 19.1** istifadə edir. Android-də lazım gələrsə https://expo.dev/go səhifəsindən SDK 54 uyğun Expo Go quraşdır. SDK-nı təkcə `expo` versiyasını dəyişərək yüksəltmə; native paketləri də uyğunlaşdırmaq lazımdır. Gələcək store buraxılışı üçün ayrıca SDK/build yenilənməsi və development build lazımdır.

## 2. Python backend-ə bağlamaq

`KhayyamMammadli/kimdevar-backend` üçün ayrıca Codespace aç. Oradakı README ilə serveri başladıb 8000 portunu telefondan əlçatan et. Yalnız demo məlumatlar üçün portun visibility-sini Public edə bilərsən; istifadəçi məlumatı olan servis üçün public demo girişdən istifadə etmə.

Mobil tətbiqdə **Giriş → API bağlantısını sazla** (və ya yuxarıdakı **Bağlantı**) aç. Backend portunun **Forwarded Address** ünvanını daxil et:

```text
https://CODESPACE-ADI-8000.app.github.dev
```

`/docs` əlavə etmə, localhost yazma: telefonun localhost-u server deyil. **Bağlantını yoxla → Saxla və girişə qayıt → Alıcı kimi sına**. Backend `DEMO_MODE=true` ilə işləməlidir. Server xətasında tətbiq səssizcə yerli demoya keçmir.

Alternativ: `.env.example` faylını `.env` olaraq kopyala, `EXPO_PUBLIC_API_URL` əlavə et, Metro-nu yenidən başlat. Tətbiqdən saxlanılan URL bu dəyəri üstələyir; dəyişmək üçün Bağlantı ekranını istifadə et. Buraya gizli açar qoyma: EXPO_PUBLIC dəyişənləri tətbiqə açıq daxil olur.

## Hazır funksiyalar

- Brend açılışı və 3 addımlı tanışlıq.
- Alıcı, satıcı və moderator üçün açıq etiketlənmiş demo giriş.
- Mətn/şəkil ilə sorğu yaratma; sahələri yoxlama və təsdiqləmə.
- Aktiv/tamamlanmış/ləğv edilmiş sorğular.
- Təklifləri qiymətə görə sıralama, iki təklifin müqayisəsi, stok və zəmanət.
- Mağaza profili və saxlanılanlar.
- Sorğu üzrə yazışma, 6 saniyəlik yeniləmə və əl ilə refresh.
- Tətbiqdaxili bildirişlər və oxundu statusu.
- Profil, rayon, ayarlar, şikayət, hesab silmə.
- Mağaza üçün uyğun sorğular, təklif yaratma/yeniləmə/geri götürmə.
- Mağaza profilinin redaktəsi, yenidən təsdiq, real say göstəriciləri.
- Moderatorun mağazanı təsdiqləməsi və şikayət icmalı.

## Hələ real xidmətə bağlı olmayanlar

- **AI:** qayda əsaslı mətndən məlumat çıxarma; real model və şəkil tanıma yoxdur. Çıxarılan sahələr təsdiqsiz göndərilmir.
- **Auth:** SMS və real istifadəçi qeydiyyatı yoxdur. API demo hesabları ortaqdır, müştəri məlumatları üçün deyil.
- **Push/GPS/xəritə/ödəniş:** xarici xidmətlər inteqrasiya edilməyib. Məkan rayon üzrə əl ilə seçilir; məsafə uydurulmur.
- Ayarlardakı bildiriş seçimləri cihazda saxlanır; server push abunəliyini idarə etmir.
- Backend SQLite pilotudur; Supabase/Postgres və production auth növbəti inteqrasiya mərhələsidir.

## Yoxlamalar

```bash
npm run typecheck
npx expo install --check
npx expo export --platform all
```

Export native JS bundle-lərin yığıldığını yoxlayır; real iOS/Android cihaz testini əvəz etmir. Fiziki cihazda QR ilə kamera/şəkil seçimi, klaviatura, safe area və ekran keçidlərini ayrıca sına.

## Struktur

- `App.tsx` — sessiya, ekran keçidi, Android back, alt tablar.
- `src/ui.tsx` — ortaq dizayn komponentləri və tokenlər.
- `src/screens/Buyer.tsx`, `Seller.tsx`, `Common.tsx` — rol üzrə ekranlar.
- `src/api.ts` — timeout, bearer token və fayl yükləmə.
- `src/demo.ts` — cihazda saxlanan demo adapter.
- `src/types.ts` — API tipləri.

Backend: https://github.com/KhayyamMammadli/kimdevar-backend
