# Quran Web

Aplikasi web untuk membaca Al-Quran, dibangun dengan Next.js 15 dan TypeScript.

**Live Demo**: [quran-web-lac.vercel.app](https://quran-web-lac.vercel.app)

## Tech Stack

- **Framework**: Next.js 15 (App Router + Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: TanStack Query v5
- **Animasi**: Motion
- **Linting/Formatting**: Biome
- **Package Manager**: Bun
- **Deployment**: Vercel

## Fitur

- Baca Al-Quran per surah
- Autentikasi pengguna (login)
- Dukungan whitelabel
- Tampilan responsif

## Struktur Proyek

```
src/
├── actions/        # Server actions
├── app/            # Halaman dan routing (Next.js App Router)
│   ├── (app)/      # Halaman utama
│   └── (auth)/     # Halaman autentikasi
├── components/     # Komponen UI reusable
├── data/           # Data statis
├── features/       # Fitur modular (whitelabel, dll.)
├── hooks/          # Custom React hooks
├── lib/            # Utilitas dan helper
└── types/          # TypeScript type definitions
```

## Instalasi

Pastikan [Bun](https://bun.sh) sudah terinstall.

```bash
# Clone repository
git clone https://github.com/immuttaqien/quran-web.git
cd quran-web

# Install dependencies
bun install

# Salin file environment
cp .env.example .env.local
```

## Development

```bash
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Build

```bash
bun build
bun start
```

## Docker

```bash
docker build -t quran-web .
docker run -p 3000:3000 quran-web
```

## Scripts

| Script | Deskripsi |
|--------|-----------|
| `bun dev` | Jalankan development server |
| `bun build` | Build untuk production |
| `bun start` | Jalankan production server |
| `bun lint` | Lint kode dengan Biome |
| `bun run biome:check` | Lint + cek format dengan Biome (dipakai CI) |
| `bun run typecheck` | Cek tipe TypeScript |
| `bun run test` | Uji unit (`bun:test`, di `src/**/*.test.ts`) |
| `bun run build:e2e` | Build production untuk uji end-to-end |
| `bun run test:e2e` | Uji end-to-end (Playwright, di `e2e/`) |
| `bun clean` | Hapus build artifacts |

## Pengujian

**Uji unit** mencakup logika murni dan penyimpanan lokal (penjadwalan ulasan,
kuis, cadangan progres, klien API). Berjalan tanpa browser dan tanpa jaringan:

```bash
bun run test
```

**Uji end-to-end** menjalankan aplikasi hasil build production di Chromium.
Server dijalankan dengan Quran.com API tiruan (`e2e/mock-quran-api.cjs`), jadi
hasilnya tidak bergantung pada jaringan atau ketersediaan `api.quran.com`.
Siapkan `.env.local` (lihat bagian Instalasi) lalu:

```bash
bunx playwright install chromium   # sekali saja
bun run build:e2e
bun run test:e2e
```

Data tiruan didefinisikan di `e2e/mock-data.cjs`. Jika memakai ulang `.next`
setelah mengubah data tiruan, jalankan `bun clean` dulu agar cache lama tidak
terpakai.

> Uji ini **tidak** memeriksa bentuk respons asli Quran.com API maupun URL audio
> di CDN-nya. Setelah mengubah `src/lib/quran-api.ts` atau
> `src/lib/word-audio.ts`, cek manual dengan `bun dev`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) berjalan pada push ke `main` dan
setiap pull request:

- **quality**: `biome check`, typecheck, dan uji unit.
- **e2e**: build production lalu uji end-to-end; laporan Playwright diunggah
  sebagai artifact.

## Lisensi

[MIT](LICENSE)
