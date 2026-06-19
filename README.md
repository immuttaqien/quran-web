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
| `bun clean` | Hapus build artifacts |

## Lisensi

[MIT](LICENSE)
