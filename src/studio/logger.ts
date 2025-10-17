export interface LoggerConfig {
  name: string;
  level?: 'debug' | 'info' | 'warn' | 'error';
}

export class PinoLogger {
  private name: string;
  private level: string;

  constructor(config: LoggerConfig) {
    this.name = config.name;
    this.level = config.level || 'info';
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog('debug')) {
      console.debug(`[${this.name}] DEBUG:`, message, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog('info')) {
      console.info(`[${this.name}] INFO:`, message, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(`[${this.name}] WARN:`, message, ...args);
    }
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(`[${this.name}] ERROR:`, message, ...args);
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }
}
