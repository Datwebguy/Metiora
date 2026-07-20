import { buildServer } from './server.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start(): Promise<void> {
  try {
    const server = await buildServer();
    await server.listen({ port: PORT, host: HOST });
    console.log(`[Metiora API] Server listening at http://${HOST}:${PORT}`);
  } catch (err) {
    console.error('[Metiora API] Startup failure:', err);
    process.exit(1);
  }
}

start();
