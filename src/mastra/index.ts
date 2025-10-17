import { Studio } from '../studio/studio';
import { LibSQLStore } from '../studio/libsql';
import { PinoLogger } from '../studio/logger';
import { codingAgent } from './agents/coding-agent';

export const studio = new Studio({
  agents: { codingAgent },
  storage: new LibSQLStore({ url: 'file:../../studio.db' }),
  logger: new PinoLogger({
    name: 'Studio.ai',
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  }),
});
