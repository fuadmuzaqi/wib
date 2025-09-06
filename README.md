# Jam WIB — Server Time Only (Deno Deploy)

Web statis + API internal (WIB only) yang menampilkan waktu `HH:MM:SS:MS` **tanpa sinkron ke jam perangkat**.
Sumber waktu berasal dari **server** (`/api/time`). Jika API mati, UI menampilkan pesan error dan tidak fallback.

## Struktur
```
public/
  index.html
  style.css
  main.js
server.ts
deno.jsonc
```

## Jalankan Lokal
```bash
deno task dev
# buka http://localhost:8000
```

## Deploy ke Deno Deploy
1. Push ke GitHub.
2. Deno Deploy → New Project → Link repo → Entry `server.ts` → Deploy.

## Catatan Akurasi
- Klien hanya memakai `epoch_ms` dari server sebagai baseline + `performance.now()` untuk animasi halus.
- Perhitungan WIB dilakukan murni di klien dengan offset UTC+7 dan *UTC getters* agar bebas dari zona waktu device.
