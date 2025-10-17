# Studio.ai - AI Coding Agent

Studio.ai is an advanced AI coding agent framework with secure E2B sandbox execution, comprehensive file management, and multi-language support for Python, JavaScript, and TypeScript development workflows.

## Overview

Studio.ai demonstrates how to build an intelligent AI coding assistant that works with real development environments. The agent can create sandboxes, manage files and directories, execute code in multiple languages, and monitor development workflows - all within secure, isolated E2B environments.

This project features a custom-built agent framework with a polished, modern UI/UX designed for professional developers.

## Features

- **Secure Code Execution**: Run Python, JavaScript, and TypeScript code in isolated E2B sandboxes
- **Complete File Management**: Create, read, write, delete files and directories with batch operations
- **Multi-Language Support**: Execute code in Python, JavaScript, and TypeScript environments
- **Live Development Monitoring**: Watch directory changes and monitor development workflows
- **Command Execution**: Run shell commands, install packages, and manage dependencies
- **Memory System**: Persistent conversation memory with semantic recall and working memory
- **Development Workflows**: Professional development patterns with build automation

## Prerequisites

- Node.js 20 or higher
- E2B API key (sign up at [e2b.dev](https://e2b.dev))
- OpenAI API key

## Setup

1. **Clone and install dependencies:**

   ```bash
   git clone https://github.com/astickleyid/template-coding-agent.git
   cd template-coding-agent
   npm install
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

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Open the bespoke coding console (optional):**

   A fully client-side playground for the coding agent lives in `public/index.html`. Navigate to `http://localhost:8787` in your browser to access the console. The server serves both the API and the UI.

## Architecture

### Studio.ai Framework

The custom-built Studio.ai framework provides a complete agent orchestration system located in `src/studio/`:

- **Agent System**: AI agent with tool execution and streaming support
- **Memory System**: Conversation history with SQLite storage
- **Tool System**: Type-safe tool definitions with Zod validation
- **Storage**: SQLite-based persistent storage
- **Logger**: Console-based logging system

### Core Components

#### **Coding Agent** (`src/mastra/agents/coding-agent.ts`)

The main agent with comprehensive development capabilities:

- **Sandbox Management**: Creates and manages isolated execution environments
- **Code Execution**: Runs code with real-time output capture
- **File Operations**: Complete CRUD operations for files and directories
- **Development Monitoring**: Watches for changes and monitors workflows
- **Memory Integration**: Maintains conversation context and project history

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

### Customization

You can customize the agent behavior by modifying the instructions in `src/mastra/agents/coding-agent.ts`:

```typescript
export const codingAgent = new Agent({
  name: 'Coding Agent',
  instructions: `
    // Customize agent instructions here
    // Focus on specific languages, frameworks, or development patterns
  `,
  model: openai('gpt-4.1'),
  // ... other configuration
});
```

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
src/
  studio/                       # Studio.ai framework
    mastra.ts                   # Main framework orchestrator
    agent.ts                    # Agent implementation with AI SDK
    tools.ts                    # Tool creation utilities
    memory.ts                   # Memory system
    libsql.ts                   # SQLite storage
    logger.ts                   # Logger implementation
    fastembed.ts                # Embedding utilities
  mastra/
    agents/
      coding-agent.ts           # Main coding agent
    tools/
      e2b.ts                    # E2B sandbox toolkit
    index.ts                    # Agent configuration
  server.ts                     # HTTP server for API and UI
public/
  index.html                    # Studio.ai UI
  styles.css                    # Modern, polished styling
  app.js                        # Client-side application logic
```

## License

This project is licensed under the Apache-2.0 License.
