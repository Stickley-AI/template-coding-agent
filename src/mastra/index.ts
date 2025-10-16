import { Mastra } from '../../framework/mastra';
import { LibSQLStore } from '../../framework/libsql';
import { PinoLogger } from '../../framework/logger';
import { codingAgent } from './agents/coding-agent';

export const mastra = new Mastra({
  agents: { codingAgent },
  storage: new LibSQLStore({ url: 'file:../../mastra.db' }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  }),
});
