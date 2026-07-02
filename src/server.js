import express from 'express';
import cors from 'cors';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { mcpServer } from './mcp-server.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Mengizinkan CORS agar klien MCP eksternal bisa terhubung ke server ini
app.use(cors());

// Middleware untuk membaca payload JSON pada request body
app.use(express.json());

// Menyimpan referensi transport aktif untuk dipasangkan dengan pesan POST
let activeTransport = null;

/**
 * Endpoint GET /sse
 * Membuka koneksi Server-Sent Events (SSE) antara klien MCP dan server ini.
 */
app.get('/sse', async (req, res) => {
  console.log('Menerima koneksi baru di endpoint /sse');

  // SSEServerTransport memerlukan endpoint tempat pesan POST akan dikirimkan
  // Kita arahkan ke endpoint POST /message di server ini
  activeTransport = new SSEServerTransport('/message', res);

  try {
    // Menghubungkan transport SSE ke instance mcpServer kita
    await mcpServer.connect(activeTransport);
    console.log('Koneksi MCP berhasil terhubung melalui SSE.');

    // Jika koneksi ditutup oleh klien
    req.on('close', () => {
      console.log('Koneksi SSE ditutup oleh klien.');
      activeTransport = null;
    });
  } catch (error) {
    console.error('Gagal menghubungkan MCP Server ke SSE:', error);
    res.status(500).send('Koneksi MCP Gagal');
  }
});

/**
 * Endpoint POST /message
 * Menerima payload JSON-RPC dari klien MCP lalu meneruskannya ke server MCP lewat transport aktif.
 */
app.post('/message', async (req, res) => {
  console.log('Menerima pesan JSON-RPC dari klien');

  if (!activeTransport) {
    return res.status(400).send('Tidak ada koneksi SSE yang aktif.');
  }

  try {
    // Meneruskan request body ke transport untuk diproses oleh mcpServer
    await activeTransport.handlePostMessage(req, res);
  } catch (error) {
    console.error('Gagal memproses pesan JSON-RPC:', error);
    res.status(500).send(error.message);
  }
});

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
        <h1>SQLite Express MCP Server</h1>
        <p>Server MCP sedang aktif!</p>
        <p>Gunakan URL berikut pada client MCP Anda:</p>
        <ul>
          <li>SSE Connection URL: <code>http://localhost:${PORT}/sse</code></li>
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
  console.log(`Endpoint SSE MCP siap di: http://localhost:${PORT}/sse`);
  console.log(`====================================================`);
});
