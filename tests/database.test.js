import test from 'node:test';
import assert from 'node:assert';
import { getDb } from '../src/database.js';

test('Database Connection & Query Test', async (t) => {
  await t.test('Harus berhasil terhubung ke SQLite dan mengambil minimal satu produk', async () => {
    const db = await getDb();
    const product = await db.get('SELECT * FROM products WHERE id = 1');
    
    assert.ok(product);
    assert.strictEqual(product.id, 1);
    assert.strictEqual(product.name, 'Laptop Gaming X1');
  });

  await t.test('Harus mengembalikan null untuk ID produk yang tidak ada', async () => {
    const db = await getDb();
    const product = await db.get('SELECT * FROM products WHERE id = 9999');
    
    assert.strictEqual(product, undefined);
  });
});
