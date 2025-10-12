declare module '@mastra/core/agent' {
  export class Agent<TConfig = any> {
    constructor(config: TConfig);
  }
}

declare module '@mastra/libsql' {
  export class LibSQLStore<TOptions = any> {
    constructor(options: TOptions);
  }
  export class LibSQLVector<TOptions = any> {
    constructor(options: TOptions);
  }
}

declare module '@mastra/memory' {
  export class Memory<TConfig = any> {
    constructor(config: TConfig);
  }
}

declare module '@ai-sdk/openai' {
  export function openai(config?: unknown): unknown;
}

declare module '@mastra/fastembed' {
  export function fastembed(config?: Record<string, unknown>): unknown;
}

declare module '@mastra/core/mastra' {
  export class Mastra<TConfig = any> {
    constructor(config: TConfig);
    agent?: unknown;
  }
}

declare module '@mastra/loggers' {
  export class PinoLogger<TOptions = any> {
    constructor(options?: TOptions);
  }
}

declare module '@mastra/core/tools' {
  export interface ToolExecutionArgs<TContext = any> {
    context: TContext;
  }

  export interface ToolConfig<TContext = any, TResult = any> {
    id: string;
    description: string;
    inputSchema?: unknown;
    outputSchema?: unknown;
    execute: (args: ToolExecutionArgs<TContext>) => Promise<TResult> | TResult;
  }

  export function createTool<TContext = any, TResult = any>(
    config: ToolConfig<TContext, TResult>,
  ): ToolConfig<TContext, TResult>;
}

declare module '@e2b/code-interpreter' {
  export enum FilesystemEventType {
    CREATE = 'CREATE',
    DELETE = 'DELETE',
    WRITE = 'WRITE',
  }

  export enum FileType {
    FILE = 'file',
    DIR = 'dir',
    SYMLINK = 'symlink',
  }

  export interface SandboxFileInfo {
    name: string;
    path: string;
    type: FileType;
    size: number;
    mode: number;
    permissions: string;
    owner: string;
    group: string;
    modifiedTime?: Date;
    symlinkTarget?: string | null;
  }

  export interface SandboxCommandResult {
    exitCode: number;
    stdout: string;
    stderr: string;
  }

  export interface SandboxCommandOptions {
    cwd?: string;
    timeoutMs?: number;
  }

  export interface SandboxWatchHandle {
    stop(): Promise<void>;
  }

  export interface SandboxRunCodeOptions {
    language?: 'ts' | 'js' | 'python';
    envs?: Record<string, string>;
    timeoutMS?: number;
    requestTimeoutMs?: number;
  }

  export interface SandboxCreateOptions {
    metadata?: Record<string, string>;
    envs?: Record<string, string>;
    timeoutMS?: number;
  }

  export interface SandboxWriteFileDescriptor {
    path: string;
    data: string;
  }

  export interface SandboxFilesAPI {
    read(path: string): Promise<string>;
    write(path: string, data: string): Promise<void>;
    write(files: SandboxWriteFileDescriptor[]): Promise<void>;
    list(path: string): Promise<SandboxFileInfo[]>;
    remove(path: string): Promise<void>;
    makeDir(path: string): Promise<void>;
    getInfo(path: string): Promise<SandboxFileInfo>;
    watchDir(
      path: string,
      listener: (event: { type: FilesystemEventType; name: string }) => Promise<void> | void,
      options?: { recursive?: boolean },
    ): Promise<SandboxWatchHandle>;
  }

  export interface SandboxCommandsAPI {
    run(command: string, options?: SandboxCommandOptions): Promise<SandboxCommandResult>;
  }

  export class Sandbox {
    static create(options?: SandboxCreateOptions): Promise<Sandbox & { sandboxId: string }>;
    static connect(sandboxId: string): Promise<Sandbox>;
    readonly sandboxId: string;
    readonly files: SandboxFilesAPI;
    readonly commands: SandboxCommandsAPI;
    runCode(code: string, options?: SandboxRunCodeOptions): Promise<{
      toJSON(): unknown;
    }>;
  }
}

declare module 'zod' {
  interface ZodType<TOutput = any> {
    describe(description: string): this;
    optional(): this;
    default(value: TOutput): this;
    or<T extends ZodType>(schema: T): this;
  }

  interface ZodEnum<TValues extends readonly [string, ...string[]]> extends ZodType<TValues[number]> {}

  interface ZodObject<TShape extends Record<string, any>> extends ZodType {
    shape: TShape;
  }

  interface ZodArray<TType> extends ZodType {
    element: TType;
  }

  interface ZodNativeEnum<TEnum> extends ZodType<TEnum> {}

  interface ZodRecord extends ZodType<Record<string, string>> {}

  interface ZodString extends ZodType<string> {}

  interface ZodNumber extends ZodType<number> {}

  interface ZodBoolean extends ZodType<boolean> {}

  interface ZodDate extends ZodType<Date> {}

  const z: {
    object<T extends Record<string, any>>(shape: T): ZodObject<T>;
    record<T>(valueType: T): ZodRecord;
    string(): ZodString;
    number(): ZodNumber;
    boolean(): ZodBoolean;
    array<T>(schema: T): ZodArray<T>;
    enum<T extends readonly [string, ...string[]]>(values: T): ZodEnum<T>;
    nativeEnum<T>(enumObject: T): ZodNativeEnum<T>;
    date(): ZodDate;
  };

  export default z;
}

declare const process: {
  env: Record<string, string | undefined>;
};
