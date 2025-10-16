import http from 'http';
import { mastra } from './mastra/index';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8787;

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url || '', `http://${req.headers.host}`);

  // Serve static files from public directory
  if (req.method === 'GET' && !url.pathname.startsWith('/api')) {
    try {
      let filePath = path.join(__dirname, '../public', url.pathname);
      
      // Default to index.html for root
      if (url.pathname === '/') {
        filePath = path.join(__dirname, '../public/index.html');
      }

      const content = await fs.readFile(filePath);
      const ext = path.extname(filePath);
      
      const contentTypes: Record<string, string> = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
      };

      res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
      res.writeHead(200);
      res.end(content);
      return;
    } catch (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
  }

  // API routes
  if (req.method === 'POST' && url.pathname.startsWith('/api/agents/')) {
    const parts = url.pathname.split('/');
    const agentName = parts[3];
    const action = parts[4]; // 'invoke' or 'stream'

    if (!agentName || !action) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid API endpoint' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const agent = mastra.agents[agentName];

        if (!agent) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Agent ${agentName} not found` }));
          return;
        }

        if (action === 'invoke') {
          const result = await agent.invoke({
            messages: data.messages || [],
            threadId: data.threadId,
          });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } else if (action === 'stream') {
          const result = await agent.stream({
            messages: data.messages || [],
            threadId: data.threadId,
          });

          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          });

          // Stream the response
          for await (const chunk of result.textStream) {
            res.write(`data: ${JSON.stringify({ delta: { content: chunk } })}\n\n`);
          }

          res.end();
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid action' }));
        }
      } catch (err: any) {
        console.error('Error processing request:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
      }
    });

    return;
  }

  // Default 404
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`UI available at http://localhost:${PORT}`);
});
