# 🎨 DESIGN DOCUMENT (DESIGN.MD): THE LIVING CANVAS
**Proyek:** 3D Interior Design E-Commerce  
**Visi:** Menggabungkan estetika *Awwwards-winning design* dengan utilitas *E-Commerce* yang intuitif dan menyenangkan.

---

## 1. Konsep Visual: "The Living Canvas"
Desain ini mengusung tema **"The Living Canvas"**, di mana antarmuka tidak terasa seperti situs belanja kaku, melainkan sebuah ruang kreasi yang hidup. 

### Prinsip Utama:
* **Neo-Minimalism:** Ruang putih (*whitespace*) yang luas untuk memberikan nafas pada visual 3D.
* **Glassmorphism Overlays:** Panel UI menggunakan efek kaca transparan (*frosted glass*) agar tidak menghalangi pandangan pada kanvas 3D di belakangnya.
* **Sophisticated Playfulness:** Penggunaan animasi yang halus (*organic easing*) untuk memberikan kesan "premium" namun tetap seru seperti bermain game.

---

## 2. Identitas Visual (Design System)

### A. Palet Warna (Universal & Gen-Z Friendly)
* **Primary Background:** `#FAF9F6` (Off-white/Bone) - Memberikan kesan galeri seni yang bersih, ramah untuk mata segala usia.
* **Accent Color:** `#4F46E5` (Electric Indigo) - Warna yang modern, energetik untuk Gen-Z namun tetap terlihat profesional untuk tombol CTA (Beli).
* **UI Neutral:** `#111827` (Deep Slate) - Untuk teks utama, memberikan kontras tinggi untuk aksesibilitas.
* **Success/Action:** `#10B981` (Emerald) - Untuk indikator "Item Placed" atau "In Stock".

### B. Tipografi (Elegant Duo)
* **Headings (Serif):** *Cormorant Garamond* - Memberikan kesan mewah, artistik, dan "Furniture Artist".
* **Body & UI (Sans-Serif):** *Geist* atau *Inter* - Sangat terbaca, modern, dan memberikan kesan teknis yang presisi.

---

## 3. Tata Letak (Layout Architecture)

### A. Viewport Utama (The Stage)
* **Full-bleed 3D Canvas:** Kanvas 3D memenuhi 100% layar. UI "mengapung" di atasnya.
* **Floating Sidebar (Katalog):** Panel katalog di sisi kiri yang bisa disembunyikan (*collapsible*) dengan transisi *spring animation*.
* **Contextual Action Bar:** Muncul di bagian bawah saat sebuah objek dipilih, berisi opsi ganti warna, putar, atau hapus.

### B. Header Minimalis
* **Logo & Menu:** Di kiri atas.
* **Mini Cart & Profile:** Di kanan atas dengan desain minimalis (ikon *outline*).
* **Status Ruangan:** Indikator dimensi ruangan yang sedang aktif (misal: "3m x 4m Living Room").

---

## 4. Gamification & UX Guidance

### A. Onboarding: "The First Stroke"
Agar pengguna tidak bingung, saat pertama kali masuk, situs tidak langsung kosong:
1.  **Welcome Modal:** Tipografi besar yang elegan menyambut user.
2.  **Guided Steps:** Overlay semi-transparan yang menyorot area input ukuran ruangan.
3.  **Interactive Tutorial:** User diajak untuk men-*drag* satu item "Starter Chair" ke ruangan sebagai latihan singkat sebelum menu terbuka penuh.

### B. Gamified Elements
* **Progressive Discovery:** Fitur-fitur canggih (seperti ganti material lantai) terbuka setelah user menempatkan furnitur pertama.
* **Haptic-like Visual Feedback:** Saat furnitur di-*drop* ke lantai, ada efek "bounce" kecil dan partikel debu halus (visual) untuk memberikan kesan berat dan nyata.
* **Budget Tracker:** Indikator harga yang bertambah secara animatif (seperti skor dalam game) saat furnitur ditambahkan.

---

## 5. Motion Design (Framer Motion Specs)

| Elemen | Jenis Animasi | Easing | Durasi |
| :--- | :--- | :--- | :--- |
| **Panel Katalog** | Slide in from Left | `[0.17, 0.67, 0.83, 0.67]` | 0.6s |
| **Furniture Drag** | Float & Scale up | `spring(stiffness: 300)` | Instant |
| **Object Drop** | Soft Bounce | `spring(damping: 10)` | 0.4s |
| **Price Update** | Counter Animation | `easeOut` | 0.3s |
| **Tooltip Harga** | Fade & Slide Up | `backOut` | 0.2s |

---

## 6. Detail Interaksi (Micro-Interactions)

1.  **The Hover State:** Saat mouse melewati furnitur di kanvas, furnitur tersebut akan berpendar halus (*soft outer glow*) dan menampilkan "Floating Tag" berisi Nama & Harga.
2.  **Smart Collision:** Saat furnitur didekatkan ke dinding, furnitur tersebut secara otomatis berputar menghadap ke arah dalam ruangan (*auto-alignment*).
3.  **Color Picker Experience:** Menggunakan lingkaran warna besar dengan transisi warna pada model 3D yang berubah secara *real-time* tanpa jeda.
4.  **Checkout Transition:** Saat klik "Buy Now", kamera 3D akan melakukan *cinematic zoom* ke arah furnitur terbaik di ruangan sebelum beralih ke halaman pembayaran yang bersih.

---

## 7. Desain E-Commerce (Conversion Focused)
Meskipun terasa seperti game, tujuan belanja tetap utama:
* **Sticky "Add to Cart" Bar:** Muncul saat user memilih furnitur di kanvas.
* **Total Summary Widget:** Selalu terlihat di pojok kanan bawah, menunjukkan total harga furnitur yang ada di ruangan.
* **Share My Design:** Tombol untuk mengekspor gambar ruangan (screenshot) untuk dikirim ke WhatsApp/Media Sosial, meningkatkan *awareness* produk.

---
