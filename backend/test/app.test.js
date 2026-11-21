import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

async function withServer(app, run) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('liveness endpoint returns JSON without requiring a database', async () => {
  const app = createApp({ databaseQuery: async () => { throw new Error('unused'); } });
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  });
});

test('readiness returns HTTP 503 when the database is unavailable', async () => {
  const app = createApp({ databaseQuery: async () => { throw new Error('database unavailable'); } });
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health/ready`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { ok: false, database: 'unavailable' });
  });
});

test('readiness returns HTTP 200 when the database responds', async () => {
  const app = createApp({ databaseQuery: async (sql) => {
    assert.equal(sql, 'SELECT 1');
    return [{ 1: 1 }];
  } });
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health/ready`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, database: 'connected' });
  });
});

test('Express does not disclose its server banner', async () => {
  const app = createApp({ databaseQuery: async () => [] });
  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.headers.get('x-powered-by'), null);
  });
});
