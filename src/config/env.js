const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

module.exports = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  vectorStoreUrl: process.env.VECTOR_STORE_URL || 'memory://local',
};
