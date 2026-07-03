import test from 'node:test';
import assert from 'node:assert';
import { createMcpServer } from '../src/mcp-server.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

test('MCP Server Tools Test', async (t) => {
  const mcpServer = createMcpServer();
  // Helper untuk memanggil tool mcpServer secara lokal
  const callMcpTool = async (name, args = {}) => {
    const handlers = mcpServer._requestHandlers.get('tools/call');
    if (!handlers) {
      throw new Error('CallTool handler tidak terdaftar');
    }
    return await handlers({
      method: 'tools/call',
      params: {
        name,
        arguments: args
      }
    });
  };

  await t.test('Harus mendaftarkan semua tool dengan benar', async () => {
    const listHandlers = mcpServer._requestHandlers.get('tools/list');
    const result = await listHandlers({
      method: 'tools/list'
    });
    
    const toolNames = result.tools.map(tool => tool.name);
    assert.ok(toolNames.includes('list_products'));
    assert.ok(toolNames.includes('search_products'));
    assert.ok(toolNames.includes('get_product'));
    assert.ok(toolNames.includes('get_customer_orders'));
  });

  await t.test('Tool list_products harus mengembalikan data list produk', async () => {
    const result = await callMcpTool('list_products');
    assert.strictEqual(result.isError, undefined);
    
    const content = JSON.parse(result.content[0].text);
    assert.ok(Array.isArray(content));
    assert.ok(content.length > 0);
  });

  await t.test('Tool get_product harus mengembalikan error jika ID tidak ditemukan', async () => {
    const result = await callMcpTool('get_product', { id: 9999 });
    assert.strictEqual(result.isError, true);
    assert.match(result.content[0].text, /tidak ditemukan/);
  });
});
