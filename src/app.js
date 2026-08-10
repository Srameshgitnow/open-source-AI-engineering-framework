const http = require('node:http');
const { createAuthMiddleware, createToken, verifyToken } = require('./auth/auth');
const { createLogger } = require('./services/observability');
const { VectorSearchService } = require('./services/vectorSearch');
const { AgentService } = require('./services/agentService');
const { getPrompt, listPrompts, setPrompt } = require('./prompts/promptStore');
const config = require('./config/env');

function createApp() {
  const logger = createLogger('ws-app');
  const vectorSearch = new VectorSearchService(config.vectorStoreUrl);
  const agentService = new AgentService();
  const authMiddleware = createAuthMiddleware();

  return http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'GET' && url.pathname === '/health') {
      logger.info('health check');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: 'ws-starter', auth: 'bearer-token' }));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/ready') {
      logger.info('ready check');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ready: true, prompt: getPrompt('greeting') }));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/auth/login') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const username = payload.username || 'demo';
          const password = payload.password || '';

          if (password === 'secret' || username === 'demo') {
            const token = createToken({ username, role: 'user' });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ token, user: { username, role: 'user' } }));
            return;
          }

          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'invalid credentials' }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'invalid json body' }));
        }
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/prompts') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ prompts: listPrompts() }));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/prompts') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const payload = JSON.parse(body || '{}');
          const name = payload.name;
          const prompt = payload.prompt;

          if (!name || !prompt) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'name and prompt are required' }));
            return;
          }

          setPrompt(name, prompt);
          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ prompt: { name, prompt } }));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'invalid json body' }));
        }
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/auth/me') {
      authMiddleware(req, res, () => {
        const token = req.headers.authorization?.replace('Bearer ', '') || '';
        const payload = verifyToken(token);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ user: payload }));
      });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/agent') {
      authMiddleware(req, res, async () => {
        const result = await agentService.run('hello from ws');
        logger.info({ result }, 'agent invoked');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ result, search: await vectorSearch.search('hello') }));
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
  });
}

if (require.main === module) {
  const port = config.port;
  const server = createApp();
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = { createApp };
