import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getDb } from './database.js';

// Membuat fungsi untuk menginisialisasi Server MCP baru per sesi
export function createMcpServer() {
  const mcpServer = new McpServer(
    {
      name: 'sqlite-mcp-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Mendaftarkan tools
  mcpServer.registerTool(
    'list_products',
    {
      description: 'Mengambil seluruh daftar produk. Bisa difilter berdasarkan kategori.',
      inputSchema: {
        category: z.string().optional().describe('Kategori produk untuk difilter (contoh: "Elektronik", "Buku")')
      }
    },
    async ({ category }) => {
      try {
        const db = await getDb();
        let query = 'SELECT * FROM products';
        const params = [];

        if (category) {
          query += ' WHERE category = ?';
          query += ' COLLATE NOCASE';
          params.push(category);
        }

        const products = await db.all(query, params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(products, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Terjadi error saat menjalankan query: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  mcpServer.registerTool(
    'search_products',
    {
      description: 'Mencari produk berdasarkan kata kunci pencarian pada nama atau deskripsi produk.',
      inputSchema: {
        query: z.string().describe('Kata kunci pencarian')
      }
    },
    async ({ query }) => {
      try {
        const db = await getDb();
        const searchQuery = `%${query}%`;
        const products = await db.all(
          'SELECT * FROM products WHERE name LIKE ? OR description LIKE ?',
          [searchQuery, searchQuery]
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(products, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Terjadi error saat menjalankan query: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  mcpServer.registerTool(
    'get_product',
    {
      description: 'Mengambil informasi lengkap produk berdasarkan ID produk.',
      inputSchema: {
        id: z.number().int().describe('ID produk yang ingin dicari')
      }
    },
    async ({ id }) => {
      try {
        const db = await getDb();
        const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
        if (!product) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: `Produk dengan ID ${id} tidak ditemukan.`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(product, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Terjadi error saat menjalankan query: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  mcpServer.registerTool(
    'get_customer_orders',
    {
      description: 'Mengambil semua riwayat pesanan (orders) milik pelanggan tertentu beserta detail produknya.',
      inputSchema: {
        customerId: z.number().int().describe('ID Pelanggan')
      }
    },
    async ({ customerId }) => {
      try {
        const db = await getDb();
        const query = `
          SELECT o.id as order_id, o.quantity, o.order_date,
                 p.name as product_name, p.price as product_price, p.category as product_category
          FROM orders o
          JOIN products p ON o.product_id = p.id
          WHERE o.customer_id = ?
        `;
        const orders = await db.all(query, [customerId]);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(orders, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `Terjadi error saat menjalankan query: ${error.message}`,
            },
          ],
        };
      }
    }
  );

  // Mendaftarkan resource
  mcpServer.registerResource(
    'sqlite-products',
    'sqlite://products',
    {
      title: 'Seluruh Daftar Produk',
      description: 'Menyediakan representasi JSON mentah dari semua data produk di database SQLite.',
      mimeType: 'application/json'
    },
    async () => {
      const db = await getDb();
      const products = await db.all('SELECT * FROM products');
      return {
        contents: [
          {
            uri: 'sqlite://products',
            text: JSON.stringify(products, null, 2),
          },
        ],
      };
    }
  );

  return mcpServer;
}

