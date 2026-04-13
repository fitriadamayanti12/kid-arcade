# 🎮 Kid Arcade - Platform Game Edukasi untuk Anak Usia 6 Tahun

![Next.js](https://img.shields.io/badge/Next.js-16.2.3-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)

**Kid Arcade** adalah platform game edukasi interaktif yang dirancang khusus untuk anak usia 6 tahun. Dengan 4 game seru, sistem reward, dan leaderboard, anak-anak akan belajar sambil bermain dengan antusias!

---

## 📱 Fitur Unggulan

### 🎮 4 Game Seru dalam 1 Platform

| Game | Deskripsi | Skill yang Dilatih |
|------|-----------|-------------------|
| 🧩 **Puzzle Hewan** | Drag-and-drop 6 pasang hewan ke bayangannya | Motorik halus, pengenalan bentuk |
| 🃏 **Memory Match** | Cocokkan 8 pasang kartu dengan gambar yang sama | Memori, konsentrasi |
| ⏱️ **Timer Challenge** | Selesaikan puzzle dalam 30 detik | Kecepatan, fokus |
| 🎈 **Bubble Math** | Klik balon dengan angka jawaban yang tepat (penjumlahan 1-10) | Matematika dasar, kecepatan hitung |

### 🏆 Sistem Reward & Motivasi

- ⭐ **Star Rating System** (1-3 bintang berdasarkan performa)
- 🔥 **Daily Streak** - Main setiap hari dapat bonus bintang
- 🎁 **Daily Reward** - Klaim hadiah setiap hari
- 🏅 **Badge System** - Koleksi lencana pencapaian
- 📌 **Sticker Collection** - Kumpulkan stiker lucu setiap hari
- 🛒 **In-Game Shop** - Tukar bintang dengan item spesial

### 👦 Personalisasi

- **Avatar System** - Pilih karakter favorit (👧 👦 🐱 🦸 🐶 🦄)
- **Progress Dashboard** - Pantau statistik lengkap
- **Level System** - Naik level setiap 50 bintang

### 🏆 Leaderboard

- Peringkat pemain berdasarkan bintang terbanyak
- Filter per game (Puzzle, Memory, Timer, Bubble)
- Filter periode (Semua, 7 hari, 30 hari)

### 🔊 Audio & Visual

- **Sound Effects** - Suara untuk setiap aksi (correct, wrong, win, click, level up, reward)
- **Animasi Halus** - Bounce, float, pulse, zoom
- **Warna Cerah** - Desain ramah anak dengan gradien menarik

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Fungsi |
|-----------|--------|
| **Next.js 16 (App Router)** | Framework React dengan SSR & routing |
| **TypeScript** | Type safety & pengembangan lebih aman |
| **Tailwind CSS** | Styling cepat dan responsif |
| **Supabase** | Database PostgreSQL + API realtime |
| **Web Audio API** | Sound effects tanpa file eksternal |
| **React Hooks** | State management & side effects |

## 🚀 Cara Menjalankan di Lokal

### 1. Clone Repository

```bash```
git clone https://github.com/fitriadamayanti12/kid-arcade.git
cd kid-arcade
npm install
npm run dev

### Setup Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here