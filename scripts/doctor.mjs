#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot = path.resolve(process.cwd());
const issues = [];
const warnings = [];

const requiredNodeMajor = 20;
const currentNodeMajor = Number.parseInt(process.versions.node.split('.')[0] ?? '0', 10);
if (Number.isFinite(currentNodeMajor) && currentNodeMajor < requiredNodeMajor) {
  issues.push(
    `Node.js ${requiredNodeMajor}.x or newer is required. Detected ${process.versions.node}. Please upgrade Node.js.`,
  );
}

const envPath = path.join(projectRoot, '.env');
if (!existsSync(envPath)) {
  warnings.push('No .env file found. Copy .env.example to .env and supply your API keys.');
} else {
  const envContents = readFileSync(envPath, 'utf8');
  if (!envContents.includes('E2B_API_KEY')) {
    warnings.push('E2B_API_KEY is missing from .env. The sandbox integration will not work without it.');
  }
  if (!envContents.includes('OPENAI_API_KEY')) {
    warnings.push('OPENAI_API_KEY is missing from .env. The agent will be unable to call the OpenAI API.');
  }
}

const nodeModulesPath = path.join(projectRoot, 'node_modules');
if (!existsSync(nodeModulesPath)) {
  issues.push('Dependencies are not installed. Run "npm install" or "pnpm install" first.');
}

const checkBinary = binary => {
  try {
    execSync(`${binary} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

if (!checkBinary('mastra')) {
  const mastraBin = path.join(projectRoot, 'node_modules', '.bin', process.platform === 'win32' ? 'mastra.cmd' : 'mastra');
  if (!existsSync(mastraBin)) {
    warnings.push('The Mastra CLI is unavailable on PATH. Use npm scripts (e.g., "npm run dev") to start the agent.');
  }
}

const summary = [];
if (issues.length === 0) {
  summary.push('Environment check passed with no blocking issues.');
} else {
  summary.push('Environment check detected blocking issues:');
  for (const issue of issues) {
    summary.push(`  • ${issue}`);
  }
}

if (warnings.length) {
  summary.push('Warnings:');
  for (const warning of warnings) {
    summary.push(`  • ${warning}`);
  }
}

console.log(summary.join('\n'));

if (issues.length > 0) {
  process.exitCode = 1;
}
