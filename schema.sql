-- Tabel untuk menyimpan data produk
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  stock INTEGER NOT NULL,
  category TEXT
);

-- Tabel untuk menyimpan data pelanggan
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan data pesanan pelanggan
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER REFERENCES customers(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  order_date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Seeding data awal produk
INSERT OR IGNORE INTO products (id, name, description, price, stock, category) VALUES
(1, 'Laptop Gaming X1', 'Laptop gaming dengan Intel i7 dan RTX 4060', 15000000, 10, 'Elektronik'),
(2, 'Mouse Wireless Silent', 'Mouse wireless senyap dengan DPI hingga 3200', 250000, 50, 'Elektronik'),
(3, 'Buku Pemrograman JS', 'Panduan lengkap belajar JavaScript modern', 180000, 30, 'Buku'),
(4, 'Kaos Polos Premium', 'Kaos katun bambu adem warna hitam', 90000, 100, 'Pakaian'),
(5, 'Kopi Robusta 250g', 'Biji kopi robusta pilihan dari Temanggung', 65000, 40, 'Makanan & Minuman');

-- Seeding data awal pelanggan
INSERT OR IGNORE INTO customers (id, name, email) VALUES
(1, 'Budi Santoso', 'budi@example.com'),
(2, 'Siti Aminah', 'siti@example.com'),
(3, 'Andi Wijaya', 'andi@example.com');

-- Seeding data awal pesanan
INSERT OR IGNORE INTO orders (id, customer_id, product_id, quantity) VALUES
(1, 1, 1, 1),
(2, 1, 2, 2),
(3, 2, 3, 1),
(4, 3, 4, 3),
(5, 2, 5, 2);
