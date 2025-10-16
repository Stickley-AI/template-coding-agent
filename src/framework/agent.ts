import { Tool } from './tools';
import { Memory } from './memory';
import { generateText, streamText, CoreMessage } from 'ai';

export interface AgentConfig {
  name: string;
  instructions: string;
  model: any;
  tools: Record<string, Tool>;
  memory?: Memory;
  defaultStreamOptions?: {
    maxSteps?: number;
  };
}

export class Agent {
  name: string;
  instructions: string;
  model: any;
  tools: Record<string, Tool>;
  memory?: Memory;
  defaultStreamOptions?: {
    maxSteps?: number;
  };

  constructor(config: AgentConfig) {
    this.name = config.name;
    this.instructions = config.instructions;
    this.model = config.model;
    this.tools = config.tools;
    this.memory = config.memory;
    this.defaultStreamOptions = config.defaultStreamOptions;
  }

  async invoke(params: { messages: CoreMessage[]; threadId?: string }) {
    const { messages, threadId } = params;
    
    // Add system instructions
    const systemMessage: CoreMessage = {
      role: 'system',
      content: this.instructions,
    };
    
    const allMessages = [systemMessage, ...messages];

    // Store messages in memory if available
    if (this.memory && threadId) {
      await this.memory.saveMessages(threadId, messages);
    }

    // Convert tools to AI SDK format
    const toolsForAI: Record<string, any> = {};
    for (const [name, tool] of Object.entries(this.tools)) {
      toolsForAI[name] = {
        description: tool.description,
        parameters: tool.inputSchema,
        execute: async (args: any) => {
          return await tool.execute({ context: args });
        },
      };
    }

    // Generate response with tools
    const result = await generateText({
      model: this.model,
      messages: allMessages,
      tools: toolsForAI,
      maxSteps: this.defaultStreamOptions?.maxSteps || 10,
    });

    // Store assistant response in memory
    if (this.memory && threadId && result.text) {
      await this.memory.saveMessages(threadId, [
        { role: 'assistant', content: result.text },
      ]);
    }

    return result;
  }

  async stream(params: { messages: CoreMessage[]; threadId?: string }) {
    const { messages, threadId } = params;
    
    // Add system instructions
    const systemMessage: CoreMessage = {
      role: 'system',
      content: this.instructions,
    };
    
    const allMessages = [systemMessage, ...messages];

    // Store messages in memory if available
    if (this.memory && threadId) {
      await this.memory.saveMessages(threadId, messages);
    }

    // Convert tools to AI SDK format
    const toolsForAI: Record<string, any> = {};
    for (const [name, tool] of Object.entries(this.tools)) {
      toolsForAI[name] = {
        description: tool.description,
        parameters: tool.inputSchema,
        execute: async (args: any) => {
          return await tool.execute({ context: args });
        },
      };
    }

    // Stream response with tools
    const result = await streamText({
      model: this.model,
      messages: allMessages,
      tools: toolsForAI,
      maxSteps: this.defaultStreamOptions?.maxSteps || 10,
    });

    return result;
  }
}
