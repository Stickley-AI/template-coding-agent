import { createTool } from '@mastra/core/tools';
import z from 'zod';
import { Sandbox } from '@e2b/code-interpreter';
import { personalAgentConfig } from '../agents/personal-config';

const customCommands = personalAgentConfig.customCommands ?? [];
const commandsById = new Map(customCommands.map(command => [command.id, command]));

export const runCustomCommand = createTool({
  id: 'runCustomCommand',
  description:
    'Execute a user-defined custom command in the connected E2B sandbox. Commands are configured in src/mastra/agents/personal-config.ts.',
  inputSchema: z.object({
    sandboxId: z.string().describe('The sandboxId for the sandbox to run the custom command in'),
    commandId: z.string().describe('Unique identifier for the command defined in personal-config.ts'),
    args: z.array(z.string()).optional().describe('Additional arguments appended to the command string'),
    workingDirectory: z.string().optional().describe('Override the configured working directory'),
    timeoutMs: z.number().optional().describe('Override the configured timeout in milliseconds'),
  }),
  outputSchema: z
    .object({
      success: z.boolean().describe('Whether the command executed successfully'),
      exitCode: z.number().describe('The exit code of the command'),
      stdout: z.string().describe('The standard output from the command'),
      stderr: z.string().describe('The standard error from the command'),
      command: z.string().describe('The command string that was executed'),
      executionTime: z.number().describe('How long the command took to execute in milliseconds'),
    })
    .or(
      z.object({
        error: z.string().describe('The error from a failed command execution'),
      }),
    ),
  execute: async ({ context }) => {
    const commandConfig = commandsById.get(context.commandId);

    if (!commandConfig) {
      return {
        error: `Custom command "${context.commandId}" is not defined. Update personal-config.ts to add it.`,
      };
    }

    try {
      const sandbox = await Sandbox.connect(context.sandboxId);
      const commandArgs = context.args?.join(' ') ?? '';
      const commandToRun = [commandConfig.command, commandArgs].filter(Boolean).join(' ').trim();

      const startTime = Date.now();
      const result = await sandbox.commands.run(commandToRun, {
        cwd: context.workingDirectory ?? commandConfig.workingDirectory,
        timeoutMs: context.timeoutMs ?? commandConfig.timeoutMs ?? 30000,
      });
      const executionTime = Date.now() - startTime;

      return {
        success: result.exitCode === 0,
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
        command: commandToRun,
        executionTime,
      };
    } catch (error) {
      return {
        error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
      };
    }
  },
});
