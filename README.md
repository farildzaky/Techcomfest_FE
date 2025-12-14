# 🍽️ NutriScan - Sistem Monitoring Gizi MBG (Makan Bergizi Gratis)

<p align="center">
  <img src="public/favicon.ico" alt="NutriScan Logo" width="80" />
</p>

<p align="center">
  <strong>Platform digital untuk monitoring dan pelaporan program Makan Bergizi Gratis bagi sekolah inklusi</strong>
</p>

<p align="center">
  <a href="#fitur">Fitur</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#instalasi">Instalasi</a> •
  <a href="#struktur-project">Struktur</a> •
  <a href="#penggunaan">Penggunaan</a>
</p>

---

## 📋 Deskripsi

**NutriScan** adalah aplikasi web yang dikembangkan untuk mendukung program **Makan Bergizi Gratis (MBG)** pemerintah Indonesia, khususnya untuk sekolah-sekolah inklusi yang memiliki siswa dengan kebutuhan khusus (disabilitas). 

Aplikasi ini memungkinkan:
- **Sekolah** untuk melaporkan pelaksanaan MBG dan memindai kandungan gizi makanan
- **SPPG (Satuan Pelaksana Program Gizi)** untuk mengelola menu dan memantau pelaporan sekolah
- **Admin** untuk mengelola penetapan sekolah dan SPPG

## ✨ Fitur

### 🏫 Portal Sekolah
- **Dashboard** - Ringkasan informasi dan statistik sekolah
- **Scan Nutrisi** - Pemindaian makanan dengan AI untuk mendeteksi kandungan gizi
- **Pelaporan** - Submit laporan harian pelaksanaan MBG
- **Riwayat Menu** - Melihat riwayat menu yang telah disajikan
- **Riwayat Scan** - Histori hasil scan makanan
- **AKG (Angka Kecukupan Gizi)** - Monitoring pemenuhan gizi siswa
- **Profil** - Manajemen informasi sekolah dan data disabilitas siswa

### 🏢 Portal SPPG
- **Dashboard** - Overview performa dan statistik wilayah kerja
- **Menu MBG** - Kelola dan buat menu makanan bergizi
- **Pelaporan** - Review dan tanggapi laporan dari sekolah
- **Profil** - Manajemen informasi instansi SPPG

### 👨‍💼 Portal Admin
- **Dashboard** - Statistik keseluruhan sistem
- **Penetapan** - Assign sekolah ke SPPG
- **Manajemen Sekolah** - Kelola data sekolah terdaftar
- **Manajemen SPPG** - Kelola data instansi SPPG

### 🎯 Fitur Umum
- **Autentikasi** - Login, Register, Forgot/Reset Password
- **Role-based Access** - Hak akses berdasarkan peran (Admin, Sekolah, SPPG)
- **Responsive Design** - Optimal di desktop dan mobile
- **Custom Modal System** - Modal loading, success, error yang terstandarisasi
- **PWA Ready** - Dapat diinstall sebagai aplikasi

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Animation** | [GSAP](https://greensock.com/gsap/) |
| **State Management** | React Hooks (useState, useEffect) |
| **Font** | Satoshi (Custom OTF) |
| **Analytics** | [Vercel Speed Insights](https://vercel.com/analytics) |

## 📦 Instalasi

### Prerequisites
- Node.js 18.x atau lebih tinggi
- npm, yarn, atau pnpm

### Langkah Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/your-username/techcomfest_fe.git
   cd techcomfest_fe
   ```

2. **Install dependencies**
   ```bash
   npm install
   # atau
   yarn install
   # atau
   pnpm install
   ```

3. **Jalankan development server**
   ```bash
   npm run dev
   # atau
   yarn dev
   ```

4. **Buka browser**
   
   Akses [http://localhost:3000](http://localhost:3000)

> **Note:** Project ini menggunakan API proxy route internal (`/api/proxy/`) sehingga tidak memerlukan file `.env.local` untuk konfigurasi URL backend.

## 📁 Struktur Project

```
techcomfest_fe/
├── public/
│   ├── favicon.ico
│   ├── manifest.json          # PWA manifest
│   └── fonts/                  # Satoshi font files
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth pages (login, register, dll)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   │   ├── sekolah/
│   │   │   │   └── sppg/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   │
│   │   ├── (dashboard)/        # Protected dashboard pages
│   │   │   ├── sekolah/        # Portal Sekolah
│   │   │   │   ├── dashboard/
│   │   │   │   ├── scan-nutrisi/
│   │   │   │   ├── pelaporan/
│   │   │   │   ├── menu-mbg/
│   │   │   │   ├── riwayat-menu/
│   │   │   │   ├── riwayat-scan/
│   │   │   │   └── profile/
│   │   │   │
│   │   │   └── sppg/           # Portal SPPG
│   │   │       ├── dashboard/
│   │   │       ├── menu-mbg/
│   │   │       ├── pelaporan/
│   │   │       └── profile/
│   │   │
│   │   ├── (landingpage)/      # Public landing page
│   │   │
│   │   ├── admin/              # Admin portal
│   │   │   ├── (auth)/
│   │   │   └── (dashboard)/
│   │   │
│   │   ├── api/                # API routes (proxy, auth)
│   │   │   ├── auth/
│   │   │   ├── proxy/
│   │   │   └── scan-proxy/
│   │   │
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── not-found.tsx       # 404 page
│   │
│   ├── components/             # React components
│   │   ├── auth/               # Auth-related components
│   │   ├── common/             # Shared components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── profile/        # Profile sidebars
│   │   ├── dashboard/          # Dashboard components
│   │   │   ├── admin/
│   │   │   ├── sekolah/
│   │   │   └── sppg/
│   │   └── landingpage/        # Landing page sections
│   │
│   ├── assets/                 # Static assets (images)
│   │
│   ├── lib/                    # Utility functions
│   │   ├── api.ts              # API fetch wrapper with auth
│   │   └── auth.ts             # Auth helpers (cookies, refresh)
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript type definitions
│   ├── data/                   # Static data/constants
│   │
│   └── middleware.ts           # Next.js middleware (auth guard)
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── postcss.config.mjs
```

## 🚀 Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build untuk production |
| `npm run start` | Jalankan production server |
| `npm run lint` | Jalankan ESLint |

## 🔐 Autentikasi

Sistem menggunakan **JWT (JSON Web Token)** dengan mekanisme:
- **Access Token** - Token utama untuk request (expire: 15 menit)
- **Refresh Token** - Untuk mendapatkan access token baru (expire: 7 hari)
- **Auto Refresh** - Token otomatis diperbarui saat expired

### Role & Permission

| Role | Akses |
|------|-------|
| `admin` | `/admin/*` - Full system management |
| `sekolah` | `/sekolah/*` - School portal |
| `sppg` | `/sppg/*` - SPPG portal |

## 🎨 Design System

### Warna Utama
- **Primary Orange**: `#E87E2F`
- **Secondary Orange**: `#D7762E`
- **Light Orange**: `#FFF3EB`
- **Brown Text**: `#8C4C1D`

### Typography
- **Font Family**: Satoshi
- **Variants**: Light, Regular, Medium, Bold, Black

### Responsive Breakpoints
- **Mobile**: Default
- **Desktop**: `lg:` (1024px+)
- Menggunakan unit `vw` untuk scaling yang konsisten

## 🤝 Contributing

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Project ini dikembangkan untuk kompetisi **TechComFest**.

---

<p align="center">
  Made with ❤️ for Indonesia's MBG Program
</p>
