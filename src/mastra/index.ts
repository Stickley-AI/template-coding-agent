import { Mastra } from '../studio/mastra';
import { LibSQLStore } from '../studio/libsql';
import { PinoLogger } from '../studio/logger';
import { codingAgent } from './agents/coding-agent';

export const mastra = new Mastra({
  agents: { codingAgent },
  storage: new LibSQLStore({ url: 'file:../../mastra.db' }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  }),
});
