import { z } from 'zod';

export interface Tool<TInput = any, TOutput = any> {
  id: string;
  description: string;
  inputSchema: z.ZodType<TInput>;
  outputSchema: z.ZodType<TOutput>;
  execute: (params: { context: TInput }) => Promise<TOutput>;
}

export function createTool<TInput = any, TOutput = any>(config: Tool<TInput, TOutput>): Tool<TInput, TOutput> {
  return config;
}
