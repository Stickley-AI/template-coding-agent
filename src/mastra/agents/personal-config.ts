export interface CustomCommandConfig {
  /** Unique identifier used when calling the command via the runCustomCommand tool. */
  id: string;
  /**
   * Human-readable label for the command.
   * This is used for documentation and may be surfaced in the agent instructions.
   */
  label: string;
  /** Description that explains what the command does. */
  description: string;
  /** The shell command that will be executed in the sandbox. */
  command: string;
  /** Optional working directory used when executing the command. */
  workingDirectory?: string;
  /**
   * Timeout in milliseconds. When omitted the tool defaults to the sandbox
   * standard timeout (30 seconds).
   */
  timeoutMs?: number;
}

export interface PersonalAgentPreferences {
  /** Preferred programming languages. */
  languages?: string[];
  /** Frameworks, libraries, or tools the agent should prioritize. */
  technologies?: string[];
  /** General development style tips. */
  developmentStyle?: string[];
  /** Additional high level instructions. */
  goals?: string[];
}

export interface MemoryStrategyConfig {
  /** Description of how long-term memory should be utilized. */
  longTermSummary?: string;
  /** Topics or categories that should be prioritized when storing long-term memory. */
  longTermFocusAreas?: string[];
  /** Description for how the agent should handle short-term working memory. */
  shortTermSummary?: string;
  /** Guidance for when to snapshot or summarize context. */
  workingMemoryGuidelines?: string[];
}

export interface PersonalAgentConfig {
  /** Friendly name for the agent. */
  name: string;
  /** Short tagline or mission statement. */
  tagline: string;
  /** High-level description of the agent's purpose for the user. */
  mission: string;
  /** Collection of preference values to customize the agent behaviour. */
  preferences?: PersonalAgentPreferences;
  /** Memory instructions used to guide how state should be handled. */
  memoryStrategy?: MemoryStrategyConfig;
  /**
   * Extra instructions appended to the agent prompt.
   * Useful for keeping a personal tone of voice or project-specific rules.
   */
  additionalInstructions?: string[];
  /**
   * Optional overrides for the Mastra Memory options.
   * This object is shallowly merged with the defaults in coding-agent.ts so that
   * advanced users can tweak the behaviour without modifying agent code.
   */
  memoryOptions?: Record<string, unknown>;
  /** A catalogue of custom commands available via the runCustomCommand tool. */
  customCommands?: CustomCommandConfig[];
}

export const personalAgentConfig: PersonalAgentConfig = {
  name: 'My Personal Coding Companion',
  tagline: 'A persistent AI partner tailored to your workflows.',
  mission:
    'Deliver thoughtful coding assistance, maintain long-term knowledge about ongoing projects, and execute repeatable workflows efficiently.',
  preferences: {
    languages: ['TypeScript', 'Python'],
    technologies: ['Node.js', 'React', 'Docker'],
    developmentStyle: [
      'Prioritize clean, well-documented code with strong typing.',
      'Value incremental delivery with frequent validation.',
      'Prefer automating repetitive tasks when possible.',
    ],
    goals: [
      'Continuously surface context from prior sessions when relevant.',
      'Document significant project decisions for future reference.',
      'Seek clarification when requirements feel ambiguous.',
    ],
  },
  memoryStrategy: {
    longTermSummary:
      'Leverage the LibSQL-backed semantic memory to retain durable knowledge: project architecture, key decisions, recurring preferences, and workflows.',
    longTermFocusAreas: [
      'Project-specific coding conventions and style guides.',
      'Preferred tooling, scripts, and infrastructure setups.',
      'Historical troubleshooting steps and successful resolutions.',
    ],
    shortTermSummary:
      'Maintain a detailed working memory to handle active tasks, summarizing new findings before they exit the short-term context window.',
    workingMemoryGuidelines: [
      'Summarize or snapshot progress after completing major milestones.',
      'Capture rationale for architectural or tooling choices.',
      'Highlight outstanding questions or follow-up actions.',
    ],
  },
  additionalInstructions: [
    'Always provide concise reasoning before running destructive commands.',
    'When appropriate, create lightweight documentation updates alongside code changes.',
    'Encourage a teaching tone when explaining complex concepts.',
  ],
  memoryOptions: {
    workingMemory: {
      enabled: true,
      maxTokens: 2048,
    },
    semanticRecall: true,
    threads: {
      generateTitle: true,
      tagWithDate: true,
    },
  },
  customCommands: [
    {
      id: 'start-dev',
      label: 'Start Development Server',
      description: 'Launch the dev server using pnpm.',
      command: 'pnpm run dev',
      timeoutMs: 120000,
    },
    {
      id: 'lint-project',
      label: 'Run Project Linting',
      description: 'Execute the linting workflow for the current repository.',
      command: 'pnpm run lint',
    },
    {
      id: 'project-status',
      label: 'Git Project Status',
      description: 'Check repository status and show a short summary of recent activity.',
      command: 'git status --short && git log -3 --oneline',
      workingDirectory: '.',
      timeoutMs: 30000,
    },
  ],
};
