import { Agent } from './agent';

export interface StudioConfig {
  agents: Record<string, Agent>;
  storage: any;
  logger: any;
}

export class Studio {
  agents: Record<string, Agent>;
  storage: any;
  logger: any;

  constructor(config: StudioConfig) {
    this.agents = config.agents;
    this.storage = config.storage;
    this.logger = config.logger;
  }

  getAgent(name: string): Agent | undefined {
    return this.agents[name];
  }

  async invoke(agentName: string, params: any) {
    const agent = this.agents[agentName];
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }
    return await agent.invoke(params);
  }

  async stream(agentName: string, params: any) {
    const agent = this.agents[agentName];
    if (!agent) {
      throw new Error(`Agent ${agentName} not found`);
    }
    return await agent.stream(params);
  }
}
