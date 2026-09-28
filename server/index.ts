import { Server } from '@colyseus/core';
import { WebSocketTransport } from '@colyseus/ws-transport';
import type { Application } from 'express';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { ChessRoom } from './ChessRoom';

for (const file of [`.env.${process.env.NODE_ENV ?? 'development'}.local`, '.env.local', `.env.${process.env.NODE_ENV ?? 'development'}`, '.env']) {
  if (existsSync(file)) loadEnvFile(file);
}

const origins = new Set((process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000,http://127.0.0.1:3000').split(',').map(s => s.trim()));
function allowed(origin: string | null) {
  if (!origin) return true; // Non-browser test clients still pass room/session validation.
  if (origins.has(origin)) return true;
  if (process.env.NODE_ENV !== 'production') {
    try {
      const url = new URL(origin);
      return ['http:', 'https:'].includes(url.protocol) && /^(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/.test(url.hostname);
    } catch { return false; }
  }
  return false;
}
const hits = new Map<string, { count: number; until: number }>();
const server = new Server({
  greet: false,
  transport: new WebSocketTransport({ maxPayload: 4096, beforeUpgrade: request => allowed(request.headers.get('origin')) ? undefined : new Response('Origem não permitida', { status: 403 }) }),
  express: (app: Application) => {
    app.disable('x-powered-by');
    app.use((req, res, next) => {
      if (!allowed(req.headers.origin ?? null)) { res.status(403).json({ error: 'Origem não permitida' }); return; }
      if (req.headers.origin) { res.setHeader('Access-Control-Allow-Origin', req.headers.origin); res.vary('Origin'); }
      const key = req.socket.remoteAddress ?? 'unknown', now = Date.now();
      if (hits.size > 10000) for (const [ip, hit] of hits) if (hit.until < now) hits.delete(ip);
      const hit = hits.get(key);
      if (!hit || hit.until < now) hits.set(key, { count: 1, until: now + 60000 });
      else if (++hit.count > 60) { res.status(429).json({ error: 'Muitas tentativas. Aguarde um minuto.' }); return; }
      next();
    });
    app.get('/health', (_req, res) => { res.setHeader('Cache-Control', 'no-store'); res.json({ ok: true, service: 'gambito', version: '0.1.0' }); });
  },
});
server.define('friends', ChessRoom);
server.define('casual', ChessRoom);
await server.listen(Number(process.env.GAME_PORT ?? 2567), '0.0.0.0');
console.log('Servidor de partidas disponível na porta ' + (process.env.GAME_PORT ?? 2567));
