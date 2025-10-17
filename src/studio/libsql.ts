import { StorageAdapter } from './memory';
import Database from 'better-sqlite3';
import { resolve } from 'path';

export interface LibSQLStoreConfig {
  url: string;
}

export class LibSQLStore implements StorageAdapter {
  private db: Database.Database;
  private url: string;

  constructor(config: LibSQLStoreConfig) {
    this.url = config.url;
    // Convert file: URL to actual path
    const dbPath = config.url.startsWith('file:') 
      ? resolve(config.url.replace('file:', ''))
      : config.url;
    
    this.db = new Database(dbPath);
    this.initialize();
  }

  private initialize() {
    // Create tables if they don't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER DEFAULT (strftime('%s', 'now'))
      );
      
      CREATE INDEX IF NOT EXISTS idx_thread_id ON messages(thread_id);
    `);
  }

  async saveMessage(threadId: string, message: any): Promise<void> {
    const stmt = this.db.prepare(
      'INSERT INTO messages (thread_id, role, content) VALUES (?, ?, ?)'
    );
    stmt.run(threadId, message.role, message.content);
  }

  async getMessages(threadId: string): Promise<any[]> {
    const stmt = this.db.prepare(
      'SELECT role, content FROM messages WHERE thread_id = ? ORDER BY timestamp ASC'
    );
    return stmt.all(threadId);
  }

  async getThreads(): Promise<string[]> {
    const stmt = this.db.prepare(
      'SELECT DISTINCT thread_id FROM messages ORDER BY MAX(timestamp) DESC'
    );
    const rows = stmt.all() as Array<{ thread_id: string }>;
    return rows.map(row => row.thread_id);
  }

  async deleteThread(threadId: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM messages WHERE thread_id = ?');
    stmt.run(threadId);
  }

  close() {
    this.db.close();
  }
}

export class LibSQLVector {
  private connectionUrl: string;

  constructor(config: { connectionUrl: string }) {
    this.connectionUrl = config.connectionUrl;
  }

  // Placeholder for vector operations
  async search(query: string, options?: any): Promise<any[]> {
    // In a real implementation, this would perform vector similarity search
    return [];
  }
}
