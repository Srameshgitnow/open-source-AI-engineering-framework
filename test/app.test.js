const assert = require('node:assert/strict');
const test = require('node:test');
const { createApp } = require('../src/app');

test('GET /health returns ok', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const port = server.address().port;
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'ok');
  } finally {
    server.close();
  }
});

test('POST /auth/login returns a token', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const port = server.address().port;
    const response = await fetch(`http://127.0.0.1:${port}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'demo', password: 'secret' }),
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.user.username, 'demo');
    assert.ok(body.token);
  } finally {
    server.close();
  }
});

test('GET and POST /prompts manage prompt templates', async () => {
  const app = createApp();
  const server = app.listen(0);

  try {
    const port = server.address().port;
    const getResponse = await fetch(`http://127.0.0.1:${port}/prompts`);
    const initialBody = await getResponse.json();

    assert.equal(getResponse.status, 200);
    assert.ok(initialBody.prompts.greeting);

    const createResponse = await fetch(`http://127.0.0.1:${port}/prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'custom', prompt: 'Custom prompt' }),
    });
    const createdBody = await createResponse.json();

    assert.equal(createResponse.status, 201);
    assert.equal(createdBody.prompt.name, 'custom');

    const followUpResponse = await fetch(`http://127.0.0.1:${port}/prompts`);
    const followUpBody = await followUpResponse.json();

    assert.equal(followUpResponse.status, 200);
    assert.equal(followUpBody.prompts.custom, 'Custom prompt');
  } finally {
    server.close();
  }
});
