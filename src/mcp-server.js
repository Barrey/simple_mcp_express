import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { getDb } from './database.js';

// Membuat fungsi untuk menginisialisasi Server MCP baru per sesi
export function createMcpServer() {
  const mcpServer = new Server(
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

/**
 * Mendaftarkan Tools yang tersedia pada server MCP ini.
 */
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_products',
        description: 'Mengambil seluruh daftar produk. Bisa difilter berdasarkan kategori.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Kategori produk untuk difilter (contoh: "Elektronik", "Buku")',
            },
          },
        },
      },
      {
        name: 'search_products',
        description: 'Mencari produk berdasarkan kata kunci pencarian pada nama atau deskripsi produk.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Kata kunci pencarian',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_product',
        description: 'Mengambil informasi lengkap produk berdasarkan ID produk.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID produk yang ingin dicari',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'get_customer_orders',
        description: 'Mengambil semua riwayat pesanan (orders) milik pelanggan tertentu beserta detail produknya.',
        inputSchema: {
          type: 'object',
          properties: {
            customerId: {
              type: 'integer',
              description: 'ID Pelanggan',
            },
          },
          required: ['customerId'],
        },
      },
    ],
  };
});

/**
 * Menangani pemanggilan Tool oleh AI.
 */
mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const db = await getDb();

  try {
    switch (name) {
      case 'list_products': {
        let query = 'SELECT * FROM products';
        const params = [];

        if (args?.category) {
          query += ' WHERE category = ?';
          query += ' COLLATE NOCASE';
          params.push(args.category);
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
      }

      case 'search_products': {
        const searchQuery = `%${args.query}%`;
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
      }

      case 'get_product': {
        const product = await db.get('SELECT * FROM products WHERE id = ?', [args.id]);
        if (!product) {
          return {
            isError: true,
            content: [
              {
                type: 'text',
                text: `Produk dengan ID ${args.id} tidak ditemukan.`,
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
      }

      case 'get_customer_orders': {
        const query = `
          SELECT o.id as order_id, o.quantity, o.order_date,
                 p.name as product_name, p.price as product_price, p.category as product_category
          FROM orders o
          JOIN products p ON o.product_id = p.id
          WHERE o.customer_id = ?
        `;
        const orders = await db.all(query, [args.customerId]);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(orders, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Tool tidak ditemukan: ${name}`);
    }
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
});

/**
 * Mendaftarkan Resource yang tersedia (misalnya data seluruh tabel produk).
 */
mcpServer.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'sqlite://products',
        name: 'Seluruh Daftar Produk',
        mimeType: 'application/json',
        description: 'Menyediakan representasi JSON mentah dari semua data produk di database SQLite.',
      },
    ],
  };
});

/**
 * Membaca konten Resource berdasarkan URI.
 */
mcpServer.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  if (uri === 'sqlite://products') {
    const db = await getDb();
    const products = await db.all('SELECT * FROM products');
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(products, null, 2),
        },
      ],
    };
  }

  throw new Error(`Resource tidak ditemukan: ${uri}`);
});

  return mcpServer;
}
