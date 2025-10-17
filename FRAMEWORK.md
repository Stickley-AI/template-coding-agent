# Studio.ai Framework

This document describes the Studio.ai framework - a custom-built AI agent framework for intelligent coding assistance.

## Overview

Studio.ai is a lightweight, modern framework that provides:

- Agent orchestration and tool execution
- Memory system with SQLite storage
- Logging and monitoring
- Integration with AI SDK (OpenAI)
- Polished, professional UI/UX

## Architecture

### Core Components

#### 1. Studio.ai Framework (`src/studio/`)

The Studio.ai framework consists of several modules:

**`studio.ts`** - Main orchestrator
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
- Serves the Studio.ai UI from `public/` directory
- Provides REST API endpoints for agent invocation
- Supports both invoke and stream modes
- Handles CORS for local development

### UI/UX Design

Studio.ai features a modern Voice UI-inspired interface with:

**Visual Design**
- Pure black background (#000000) for deep contrast
- White text with grayscale hierarchy
- Subtle accent colors: Green (#00ff88), Blue (#0088ff), Orange (#ff8800)
- Minimalist aesthetic with focus on content
- Clean, professional appearance

**User Experience**
- Intuitive three-panel layout
- Real-time status indicators
- File attachment support
- Responsive design
- Accessible components

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

1. **Modern UI/UX**: Polished interface with visual effects and smooth animations
2. **Simplified Architecture**: No separate CLI, just a Node.js server
3. **Direct Dependencies**: Uses AI SDK directly instead of abstraction layers
4. **Minimal Features**: Only implements features actually needed
5. **Custom Branding**: Studio.ai identity throughout
6. **TypeScript**: Full TypeScript support with proper type safety
7. **No External Services**: Everything runs locally except AI model API calls

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

1. Import paths changed from `@mastra/*` to `../studio/*`
2. Tool creation unchanged - same `createTool` interface
3. Agent configuration unchanged - same `Agent` class interface
4. Memory API slightly different but compatible
5. No CLI commands - use npm scripts instead
6. New modern UI with Studio.ai branding

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

## Integrations

Studio.ai supports extensible integrations to enhance agent capabilities:

### Current Integrations

**E2B Code Sandbox**
- Secure code execution environment
- Multi-language support (Python, JavaScript, TypeScript)
- File system operations
- Package management
- Real-time output streaming

**OpenAI API**
- GPT-4 model support via AI SDK
- Streaming responses
- Tool calling capabilities
- Context management

**SQLite Storage**
- Persistent conversation history
- Thread-based organization
- Vector storage support (placeholder for embeddings)
- Efficient local storage

### Extensible Integration Framework

The tool system allows easy addition of new integrations:

```typescript
import { createTool } from '../studio/tools';
import z from 'zod';

export const myIntegration = createTool({
  id: 'myIntegration',
  description: 'Description of integration',
  inputSchema: z.object({
    param: z.string().describe('Parameter description'),
  }),
  outputSchema: z.object({
    result: z.string().describe('Result description'),
  }),
  execute: async ({ context }) => {
    // Integration logic here
    return { result: 'Success' };
  },
});
```

### Potential Integrations

Studio.ai can be extended with additional integrations:

**Development Tools**
- GitHub API - Repository management, PR creation, issue tracking
- GitLab API - Similar GitHub functionality for GitLab users
- Jira API - Task management and sprint planning
- Linear API - Modern issue tracking integration

**Cloud Platforms**
- AWS SDK - Cloud resource management
- Google Cloud SDK - GCP service integration  
- Azure SDK - Microsoft cloud services
- Vercel API - Deployment automation

**Data & AI**
- Pinecone - Vector database for semantic search
- Supabase - Backend-as-a-service integration
- Anthropic Claude - Alternative LLM provider
- Hugging Face - Open-source model integration

**Communication**
- Slack API - Team notifications and bot integration
- Discord API - Community bot functionality
- Email APIs - SendGrid, Mailgun for notifications
- Twilio - SMS and voice capabilities

**Databases**
- PostgreSQL - SQL database operations
- MongoDB - NoSQL database integration
- Redis - Caching and pub/sub
- Prisma - Type-safe database toolkit

**File Storage**
- S3-compatible - Object storage integration
- Google Drive - Cloud file management
- Dropbox - File synchronization
- Cloudflare R2 - Edge storage

### Integration Best Practices

When adding new integrations:

1. **Security**: Store API keys in environment variables
2. **Error Handling**: Implement comprehensive error catching
3. **Rate Limiting**: Respect API rate limits
4. **Documentation**: Document tool usage in agent instructions
5. **Testing**: Validate integration functionality
6. **Type Safety**: Use Zod schemas for input/output validation

## License

Studio.ai is part of the template-coding-agent project and follows the Apache-2.0 license.
