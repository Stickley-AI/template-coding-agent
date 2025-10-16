# Custom Framework Implementation

This document describes the custom agent framework that replaces the Mastra AI integration in this project.

## Overview

The custom framework provides a minimal implementation of the core features needed to run the coding agent:

- Agent orchestration and tool execution
- Memory system with SQLite storage
- Logging
- Integration with AI SDK (OpenAI)

## Architecture

### Core Components

#### 1. Framework (`src/framework/`)

The custom framework consists of several modules:

**`mastra.ts`** - Main orchestrator
- Manages multiple agents
- Provides invoke/stream methods
- Integrates storage and logging

**`agent.ts`** - Agent implementation
- Executes AI model with tools
- Manages instructions and configuration
- Supports both invoke and stream modes
- Integrates with memory system

**`tools.ts`** - Tool creation utilities
- Defines tool interface
- `createTool` function for tool definitions
- Uses Zod for schema validation

**`memory.ts`** - Memory system
- Stores conversation history
- Thread management
- Supports semantic recall (placeholder)
- Storage adapter pattern

**`libsql.ts`** - SQLite storage
- Implements `StorageAdapter` interface  
- Uses `better-sqlite3` for database access
- Stores messages by thread
- Vector storage placeholder for future enhancements

**`logger.ts`** - Logging system
- Simple console-based logger
- Supports debug, info, warn, error levels
- Pino-compatible interface

**`fastembed.ts`** - Embedding utilities
- Placeholder for embedding functionality
- Can be extended with real embedding models

**`index.ts`** - Framework exports
- Central export point for all framework components

#### 2. Server (`src/server.ts`)

Custom HTTP server that:
- Serves the UI from `public/` directory
- Provides REST API endpoints for agent invocation
- Supports both invoke and stream modes
- Handles CORS for local development

### API Endpoints

**GET /** - Serves the UI

**POST /api/agents/{agentName}/invoke** - Invoke agent (non-streaming)
```json
{
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "threadId": "optional-thread-id"
}
```

**POST /api/agents/{agentName}/stream** - Stream agent response
Same payload as invoke, returns Server-Sent Events (SSE)

### Differences from Mastra

1. **Simplified Architecture**: No separate CLI, just a Node.js server
2. **Direct Dependencies**: Uses AI SDK directly instead of abstraction layers
3. **Minimal Features**: Only implements features actually needed by the project
4. **TypeScript**: Full TypeScript support with proper type safety
5. **No External Services**: Everything runs locally except AI model API calls

## Dependencies

### Removed
- `@mastra/core`
- `@mastra/memory`
- `@mastra/libsql`
- `@mastra/loggers`
- `@mastra/mcp`
- `@mastra/fastembed`
- `mastra` (CLI)

### Added
- `ai` - Vercel AI SDK
- `better-sqlite3` - SQLite database
- `tsx` - TypeScript execution for development

### Retained
- `@ai-sdk/openai` - OpenAI integration
- `@e2b/code-interpreter` - E2B sandbox integration
- `zod` - Schema validation

## Running the Project

### Development
```bash
npm run dev
```

This starts the server with hot reload using `tsx`.

### Production Build
```bash
npm run build
npm start
```

This compiles TypeScript to JavaScript and runs the compiled server.

## Configuration

The project uses environment variables for configuration:
- `OPENAI_API_KEY` - OpenAI API key
- `E2B_API_KEY` - E2B sandbox API key
- `PORT` - Server port (default: 8787)

## Future Enhancements

Potential improvements to the custom framework:

1. **Real Embeddings**: Replace placeholder embedding function with actual model
2. **Vector Search**: Implement real vector similarity search in LibSQLVector
3. **Advanced Memory**: Add semantic recall and context windowing
4. **Additional Storage**: Support other databases (PostgreSQL, MongoDB, etc.)
5. **Monitoring**: Add request tracing and performance metrics
6. **Testing**: Add unit and integration tests
7. **Authentication**: Add API key or OAuth support
8. **Rate Limiting**: Protect endpoints from abuse

## Migration Notes

When migrating from Mastra:

1. Import paths changed from `@mastra/*` to `../framework/*`
2. Tool creation unchanged - same `createTool` interface
3. Agent configuration unchanged - same `Agent` class interface
4. Memory API slightly different but compatible
5. No CLI commands - use npm scripts instead

## Testing

To test the implementation:

1. Start the server: `npm run dev`
2. Open browser to `http://localhost:8787`
3. Enter a test message in the UI
4. Verify agent responds correctly

For API testing:
```bash
curl -X POST http://localhost:8787/api/agents/codingAgent/invoke \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

## License

This custom framework implementation is part of the template-coding-agent project and follows the same Apache-2.0 license.
