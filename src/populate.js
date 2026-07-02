import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDb } from './database.js';

// Mendapatkan path direktori saat ini
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fungsi utama untuk menginisialisasi database SQLite.
 * Membaca file schema.sql dan mengeksekusinya di database.
 */
async function populate() {
  try {
    console.log('Memulai proses inisialisasi database SQLite...');

    // Membaca file schema.sql
    const schemaPath = path.resolve(__dirname, '../schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Membuka database
    const db = await getDb();

    // Mengeksekusi seluruh query SQL di schema.sql secara sekaligus
    await db.exec(schemaSql);

    console.log('Database SQLite berhasil diinisialisasi dan diisi data awal!');
    process.exit(0);
  } catch (error) {
    console.error('Terjadi kesalahan saat mengisi database:', error);
    process.exit(1);
  }
}

// Menjalankan fungsi populate
populate();
