const pino = require('pino');

function createLogger(name = 'ws-app') {
  return pino({
    name,
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? { target: 'pino-pretty' } : undefined,
  });
}

module.exports = { createLogger };
