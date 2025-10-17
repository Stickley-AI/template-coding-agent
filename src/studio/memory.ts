import { CoreMessage } from 'ai';

export interface MemoryOptions {
  storage: StorageAdapter;
  options?: {
    threads?: {
      generateTitle?: boolean;
    };
    semanticRecall?: boolean;
    workingMemory?: {
      enabled?: boolean;
    };
  };
  embedder?: any;
  vector?: any;
}

export interface StorageAdapter {
  saveMessage(threadId: string, message: any): Promise<void>;
  getMessages(threadId: string): Promise<any[]>;
  getThreads(): Promise<string[]>;
  deleteThread(threadId: string): Promise<void>;
}

export class Memory {
  private storage: StorageAdapter;
  private options: MemoryOptions['options'];
  private embedder?: any;
  private vector?: any;

  constructor(config: MemoryOptions) {
    this.storage = config.storage;
    this.options = config.options;
    this.embedder = config.embedder;
    this.vector = config.vector;
  }

  async saveMessages(threadId: string, messages: CoreMessage[]): Promise<void> {
    for (const message of messages) {
      await this.storage.saveMessage(threadId, message);
    }
  }

  async getMessages(threadId: string): Promise<CoreMessage[]> {
    return await this.storage.getMessages(threadId);
  }

  async getThreads(): Promise<string[]> {
    return await this.storage.getThreads();
  }

  async deleteThread(threadId: string): Promise<void> {
    await this.storage.deleteThread(threadId);
  }
}
