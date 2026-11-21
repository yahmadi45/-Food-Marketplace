import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

function runSeed(environment = {}) {
  return spawnSync(process.execPath, ['scripts/seed-demo.js'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, ...environment },
  });
}

test('demo seeder refuses to run in production without connecting to a database', () => {
  const result = runSeed({ NODE_ENV: 'production', DEMO_USER_PASSWORD: 'long-enough-demo-password' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Refusing to create or reset demo data when NODE_ENV=production/);
});

test('demo seeder requires an explicit strong local demo password', () => {
  const result = runSeed({ NODE_ENV: 'test', DEMO_USER_PASSWORD: '' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Set DEMO_USER_PASSWORD/);
});
