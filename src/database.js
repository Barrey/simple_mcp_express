import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

// Mendapatkan path direktori saat ini (karena menggunakan ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path lokasi file database SQLite
const dbPath = path.resolve(__dirname, '../database.sqlite');

let dbConnection = null;

/**
 * Membuka koneksi ke database SQLite dan mengembalikan instance-nya.
 * Menggunakan pola singleton agar koneksi tidak dibuat berulang kali.
 */
export async function getDb() {
  if (dbConnection) {
    return dbConnection;
  }

  dbConnection = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Mengaktifkan foreign key constraints di SQLite untuk integritas referensial
  await dbConnection.run('PRAGMA foreign_keys = ON');

  return dbConnection;
}
