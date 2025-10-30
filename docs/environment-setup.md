# Environment Setup Checklist

When working with this template in a fresh environment, run through the following quick checks to ensure everything is configured correctly:

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Copy environment variables**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your E2B and OpenAI API keys.

3. **Validate tooling**
   ```bash
   npm run doctor
   ```
   This script reports missing dependencies or misconfigured credentials before you launch the agent.

4. **Launch the development server**
   ```bash
   npm run dev
   ```
   This starts the agent with hot-reload so you can iterate quickly.

5. **Run the test suite (optional)**
   ```bash
   npm test
   ```
   Execute automated checks to confirm the template is functioning as expected.

Keep this checklist handy whenever you provision a new workspace or rotate environments.
