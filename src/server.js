import express from 'express';
import cors from 'cors';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './mcp-server.js';
import { randomUUID } from 'node:crypto';

const app = express();
const PORT = process.env.PORT || 3000;

// Mengizinkan CORS agar klien MCP eksternal bisa terhubung ke server ini
app.use(cors());

// Middleware untuk membaca payload JSON pada request body
app.use(express.json());

// Menyimpan referensi transport aktif berdasarkan session ID
const transports = new Map();

/**
 * Endpoint tunggal untuk menangani request MCP (GET, POST, DELETE)
 * StreamableHTTPServerTransport secara otomatis mendeteksi dan menangani request sesuai spesifikasi.
 */
const handleMcp = async (req, res) => {
    // Membaca session ID dari header request
    const sessionId = req.headers['mcp-session-id'];
    let transport = sessionId ? transports.get(sessionId) : null;

    if (!transport) {
        // Jika klien mengirim session ID tapi transport tidak ada di memori
        if (sessionId) {
            return res.status(404).json({
                jsonrpc: '2.0',
                error: { code: -32000, message: 'Session tidak ditemukan' },
                id: null
            });
        }

        // Membuat transport baru untuk sesi baru
        transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (id) => {
                console.log(`Sesi MCP baru diinisialisasi dengan ID: ${id}`);
                transports.set(id, transport);
            }
        });

        // Hubungkan ke instance MCP Server baru khusus sesi ini
        const server = createMcpServer();
        await server.connect(transport);

        // Hapus transport dari memori jika koneksi ditutup
        transport.onclose = () => {
            console.log('Koneksi sesi ditutup.');
            for (const [id, t] of transports.entries()) {
                if (t === transport) {
                    transports.delete(id);
                    break;
                }
            }
        };
    }

    try {
        // Meneruskan req, res, dan body ke transport untuk diproses oleh MCP Server
        await transport.handleRequest(req, res, req.body);
    } catch (error) {
        console.error('Gagal memproses request MCP:', error);
        if (!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: { code: -32603, message: 'Internal server error' },
                id: null
            });
        }
    }
};

// Route utama untuk Streamable HTTP MCP (Menerima GET, POST, DELETE)
app.all('/mcp', handleMcp);

// Kompatibilitas ke belakang untuk klien yang menggunakan endpoint lama (/sse dan /message)
app.all('/sse', handleMcp);
app.all('/message', handleMcp);

/**
 * Halaman beranda untuk memberikan panduan ringkas.
 */
app.get('/', (req, res) => {
    res.send(`
    <html>
      <head>
        <title>SQLite Express MCP Server</title>
        <style>
          body { font-family: sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; line-height: 1.6; }
          code { background: #eee; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
        </style>
      </head>
      <body>
        <h1>SQLite Express MCP Server (Streamable HTTP)</h1>
        <p>Server MCP sedang aktif!</p>
        <p>Gunakan URL berikut pada client MCP Anda:</p>
        <ul>
          <li>Connection URL: <code>http://localhost:${PORT}/mcp</code></li>
        </ul>
        <p>Gunakan perintah <code>npm run populate</code> untuk reset database SQLite jika diperlukan.</p>
      </body>
    </html>
  `);
});

// Mulai mendengarkan request pada port yang ditentukan
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`Server HTTP Express berjalan di http://localhost:${PORT}`);
    console.log(`Endpoint MCP siap di: http://localhost:${PORT}/mcp`);
    console.log(`====================================================`);
});
