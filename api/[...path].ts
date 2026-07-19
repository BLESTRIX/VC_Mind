import type { IncomingMessage, ServerResponse } from 'node:http';

import { buildServer } from '../src/server/app.js';

let serverPromise: Promise<Awaited<ReturnType<typeof buildServer>>> | undefined;

async function getServer() {
  if (!serverPromise) {
    serverPromise = buildServer().then(async (app) => {
      await app.ready();
      return app;
    });
  }
  return serverPromise;
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  const app = await getServer();

  await new Promise<void>((resolve, reject) => {
    response.once('finish', resolve);
    response.once('close', resolve);
    try {
      app.server.emit('request', request, response);
    } catch (error) {
      reject(error);
    }
  });
}
