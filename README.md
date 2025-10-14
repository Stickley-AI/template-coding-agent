# E2B Code Execution Agent

This repository is a production-ready Mastra template for running your own fully personalized coding copilot. It packages the AI agent, long-term memory, custom tooling, and an Electron desktop shell so you can interact with the assistant on any machine without wiring the pieces together yourself.

## What You Get

- **AI Coding Agent** – A Mastra-powered assistant that can plan, write, run, and iterate on code in secure E2B sandboxes without touching your local filesystem.
- **Long-Term Memory** – Persistent summaries, semantic recall, and working-memory threads so the agent remembers what you are building.
- **Custom Workflow Commands** – A catalog of reusable shell commands you define (build, test, deploy) that the agent can execute with a single instruction.
- **Desktop App** – An Electron launcher that starts/stops the agent, streams logs, and stores your API keys so you can run the assistant without a terminal.
- **Environment Doctor** – A diagnostic script that verifies Node.js, installed dependencies, and required API keys before the agent launches.

These pieces are wired together out of the box—you only need to add your API keys and optional personalization details.

## Overview

This template demonstrates how to build an AI coding assistant that can work with real development environments. The agent can create sandboxes, manage files and directories, execute code in multiple languages, and monitor development workflows - all within secure, isolated E2B environments.

### Typical Use Cases

- Spin up a fresh sandbox to prototype features without polluting local projects.
- Ask the agent to scaffold applications, write tests, or refactor code across files.
- Run your custom automation (e.g., `pnpm lint`, deployment scripts) from the agent via the `runCustomCommand` tool.
- Rely on the persistent memory so the agent tracks progress across sessions and remembers your preferences.

## Features

- **Secure Code Execution**: Run Python, JavaScript, and TypeScript code in isolated E2B sandboxes
- **Complete File Management**: Create, read, write, delete files and directories with batch operations
- **Multi-Language Support**: Execute code in Python, JavaScript, and TypeScript environments
- **Live Development Monitoring**: Watch directory changes and monitor development workflows
- **Command Execution**: Run shell commands, install packages, and manage dependencies
- **Memory System**: Persistent conversation memory with semantic recall and working memory
- **Personalization Layer**: Configure agent identity, preferences, and a catalog of repeatable workflows
- **Desktop Launcher**: Electron-based desktop application for starting/stopping the agent without the terminal
- **Development Workflows**: Professional development patterns with build automation

## Prerequisites

- Node.js 20 or higher
- E2B API key (sign up at [e2b.dev](https://e2b.dev))
- OpenAI API key

## Run It Locally

Follow these steps the first time you set up the project on a new machine.

1. **Clone and install dependencies:**

   ```bash
   git clone https://github.com/mastra-ai/template-coding-agent.git
   cd template-coding-agent
   npm install
   # or: pnpm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

   ```env
   E2B_API_KEY="your-e2b-api-key-here"
   OPENAI_API_KEY="your-openai-api-key-here"
   ```

3. **Check your environment:**

   ```bash
   npm run doctor
   ```

   The doctor script highlights missing dependencies or API keys before you launch the agent.

4. **Personalize the agent (optional but recommended):**

   Open `src/mastra/agents/personal-config.ts` and update the identity, mission, preferences, memory strategy, and custom command catalog so the assistant behaves the way you want.

5. **Start the agent (pick one):**

   - **CLI:** `npm run dev` for hot-reload development or `npm run start` for production mode.
   - **Desktop App:** `npm run desktop` to open the Electron launcher. Provide your API keys once and start/stop the agent with buttons. Output streaming and status updates are surfaced in the UI.

6. **Package a desktop build (optional):**

   ```bash
   npm run desktop:package
   ```

   This produces a platform-specific build in the `dist/` directory using `electron-builder`.

## Architecture

### Core Components

#### **Coding Agent** (`src/mastra/agents/coding-agent.ts`)

The main agent with comprehensive development capabilities:

- **Sandbox Management**: Creates and manages isolated execution environments
- **Code Execution**: Runs code with real-time output capture
- **File Operations**: Complete CRUD operations for files and directories
- **Development Monitoring**: Watches for changes and monitors workflows
- **Memory Integration**: Maintains conversation context and project history
- **Personal Profile**: Dynamically incorporates preferences defined in `personal-config.ts`

#### **E2B Tools** (`src/mastra/tools/e2b.ts`)

Complete toolkit for sandbox interaction:

**Sandbox Management:**

- `createSandbox` - Initialize new isolated environments
- Connection management with timeout handling

**Code Execution:**

- `runCode` - Execute Python, JavaScript, TypeScript code
- Real-time output capture and error handling
- Environment variable and timeout configuration

**File Operations:**

- `writeFile` - Create individual files
- `writeFiles` - Batch create multiple files for project setup
- `readFile` - Read file contents for analysis and validation
- `listFiles` - Explore directory structures
- `deleteFile` - Clean up files and directories
- `createDirectory` - Set up project structures

**File Information & Monitoring:**

- `getFileInfo` - Get detailed file metadata
- `checkFileExists` - Validate file existence for conditional logic
- `getFileSize` - Monitor file sizes and track changes
- `watchDirectory` - Live monitoring of file system changes

**Development Workflow:**

- `runCommand` - Execute shell commands, build scripts, package management
- `runCustomCommand` - Trigger user-defined workflows stored in `personal-config.ts`

### Memory System

The agent includes a configured memory system:

- **Thread Management**: Automatic conversation title generation
- **Semantic Recall**: Search through previous interactions
- **Working Memory**: Maintains context across interactions
- **Vector Storage**: Semantic search capabilities with `LibSQLVector`

## Configuration

### Environment Variables

```bash
E2B_API_KEY=your_e2b_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### Personalization & Custom Commands

Fine-tune the assistant without editing core agent code by updating `src/mastra/agents/personal-config.ts`.

```typescript
export const personalAgentConfig = {
  name: 'My Personal Coding Companion',
  tagline: 'A persistent AI partner tailored to your workflows.',
  mission: 'Describe the long-term goals for the agent.',
  preferences: {
    languages: ['TypeScript', 'Python'],
    technologies: ['Node.js', 'React'],
    developmentStyle: ['Prefer TDD', 'Document architectural decisions'],
  },
  memoryStrategy: {
    longTermSummary: 'What should be remembered across sessions.',
    workingMemoryGuidelines: ['Snapshot progress at the end of each session.'],
  },
  customCommands: [
    {
      id: 'start-dev',
      label: 'Start Dev Server',
      description: 'Launch the development server inside the sandbox.',
      command: 'pnpm run dev',
    },
  ],
};
```

Key capabilities provided by the configuration file:

- **Agent identity** — control tone, mission, and project focus.
- **Preference sets** — inform the agent about favored languages, tools, and delivery style.
- **Memory strategy** — guide how long-term and short-term context should be stored.
- **Custom commands** — register reusable shell commands that can be triggered with the `runCustomCommand` tool using a `commandId`.

Feel free to extend the configuration with additional custom commands or memory options; the agent automatically reads the updated details on startup.

### Desktop Launcher

The Electron desktop app wraps the same Mastra agent so you can run it without the terminal:

1. Install dependencies and run `npm run doctor` to verify prerequisites.
2. Launch the desktop shell with `npm run desktop`.
3. Enter your API keys once—the app stores them locally using the operating system's application storage.
4. Start or stop the agent with a single click. Live logs and status updates stream into the UI so you can monitor the session in real time.
5. Package a distributable build with `npm run desktop:package` when you are ready to share it across machines.

The launcher proxies your chosen mode (`mastra dev` for development or `mastra start` for production) and forwards environment variables so the agent runs exactly as it does via the CLI.

## Common Issues

### "E2B_API_KEY is not set"

- Make sure you've set the environment variable
- Check that your API key is valid and has sufficient credits
- Verify your E2B account is properly configured

### "Sandbox creation failed"

- Check your E2B API key and account status
- Ensure you haven't exceeded sandbox limits
- Verify network connectivity to E2B services

### "Code execution timeout"

- Increase timeout values for long-running operations
- Break down complex operations into smaller steps
- Monitor resource usage and optimize code

### "File operation errors"

- Validate file paths and permissions
- Check sandbox file system limits
- Ensure directories exist before file operations

### "Agent stopping with tool-call reason"

- Increase `maxSteps` in the agent configuration

## Development

### Project Structure

```text
src/mastra/
      agents/
        coding-agent.ts              # Main coding agent with development capabilities
        personal-config.ts           # User-editable persona, memory, and command catalog
      tools/
        e2b.ts                      # Complete E2B sandbox interaction toolkit
        custom-commands.ts          # Tool for invoking reusable workflows
      index.ts                        # Mastra configuration with storage and logging
```

## License

This project is part of the Mastra ecosystem and follows the same licensing terms.
