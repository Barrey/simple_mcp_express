# SQLite Express MCP Server

Proyek ini adalah implementasi server Model Context Protocol (MCP) sederhana yang membaca database SQLite dengan backend Express.js. Server ini menggunakan transport **SSE (Server-Sent Events)** dan seluruh dokumentasi kode ditulis dalam Bahasa Indonesia untuk tujuan pembelajaran.

---

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal:
* [Node.js](https://nodejs.org/) (versi 18 atau yang lebih baru)
* NPM (biasanya otomatis terpasap bersama Node.js)

---

## Cara Memulai & Menjalankan Proyek

### 1. Instalasi Dependensi
Jalankan perintah berikut untuk menginstal semua package yang diperlukan:
```bash
# Untuk Windows (PowerShell/CMD) jika eksekusi script diblokir:
npm.cmd install

# Untuk macOS/Linux atau terminal standar:
npm install
```

### 2. Inisialisasi Basis Data (Populate Data)
Jalankan perintah `npm run populate` untuk membaca skema SQL (`schema.sql`), membuat file database SQLite lokal (`database.sqlite`), dan mengisinya dengan data sampel (produk, pelanggan, dan pesanan):
```bash
# Untuk Windows:
npm.cmd run populate

# Untuk macOS/Linux:
npm run populate
```
**Output yang diharapkan:**
```
Memulai proses inisialisasi database SQLite...
Database SQLite berhasil diinisialisasi dan diisi data awal!
```

### 3. Jalankan Server Express
Mulai server Express yang akan mendengarkan koneksi MCP melalui SSE di port `3000`:
```bash
# Menjalankan server dalam mode standar:
npm.cmd start

# ATAU menjalankan server dalam mode pengembangan (dengan auto-reload saat kode diubah):
npm.cmd run dev
```
**Output yang diharapkan:**
```
====================================================
Server HTTP Express berjalan di http://localhost:3000
Endpoint MCP siap di: http://localhost:3000/mcp
====================================================
```
Server sekarang aktif dan siap menerima koneksi MCP di alamat `http://localhost:3000/mcp`.

---

## Menguji Menggunakan MCP Inspector

[MCP Inspector](https://github.com/modelcontextprotocol/inspector) adalah alat interaktif resmi dari tim MCP untuk menguji fungsionalitas server MCP (seperti daftar Tools, pemanggilan Tool, dan pembacaan Resource) melalui antarmuka web (browser).

### Langkah-langkah Pengujian:

1. **Pastikan Server Express Tetap Berjalan** pada port 3000 (dari langkah sebelumnya).
2. **Buka Terminal Baru**, masuk ke direktori proyek, lalu jalankan perintah MCP Inspector dengan mengarahkan ke endpoint server:
   ```bash
   npx @modelcontextprotocol/inspector http://localhost:3000/mcp
   ```
3. **Buka Browser**: Terminal Inspector akan menampilkan URL lokal (biasanya `http://localhost:5173`). Buka URL tersebut di browser pilihan Anda.
4. **Gunakan Antarmuka Web Inspector**:
   * **Melihat Daftar Tools**: Di tab **Tools**, Anda akan melihat empat tool yang telah didaftarkan: `list_products`, `search_products`, `get_product`, dan `get_customer_orders`.
   * **Menguji Tool**:
     - Pilih tool `list_products` dan klik **Run Tool** untuk mengambil seluruh produk.
     - Pilih tool `search_products`, masukkan parameter `query: "Kopi"`, lalu klik **Run Tool** untuk memverifikasi pencarian produk.
     - Pilih tool `get_product` dengan parameter `id: 1` untuk mendapatkan detail laptop gaming.
     - Pilih tool `get_customer_orders` dengan parameter `customerId: 2` untuk melihat riwayat pesanan pelanggan.
   * **Melihat Resource**: Di tab **Resources**, klik tombol refresh untuk melihat resource `sqlite://products`. Anda dapat membacanya langsung untuk melihat data mentah JSON seluruh produk.

---

## Menjalankan Unit Tests (Otomatis)
Untuk menjalankan rangkaian tes otomatis (automated tests) yang menguji koneksi basis data serta fungsionalitas MCP Server secara terisolasi:
```bash
npm.cmd test
```
