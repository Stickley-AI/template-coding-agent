import { app, BrowserWindow, ipcMain } from 'electron';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';
import { existsSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

let mainWindow;
let agentProcess = null;
let currentMode = null;

const sendStatus = status => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('agent:status', status);
  }
};

const sendOutput = payload => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('agent:output', payload);
  }
};

const resolveRendererPath = () => {
  const rendererUrl = new URL('./renderer/index.html', import.meta.url);
  return fileURLToPath(rendererUrl);
};

const resolvePreloadPath = () => {
  const preloadUrl = new URL('./preload.mjs', import.meta.url);
  return fileURLToPath(preloadUrl);
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    title: 'Coding Agent Desktop',
    webPreferences: {
      preload: resolvePreloadPath(),
    },
  });

  mainWindow.loadFile(resolveRendererPath());

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const startAgentProcess = (mode, extraEnv) => {
  if (agentProcess) {
    return { ok: false, message: 'The agent is already running.' };
  }

  const mastraBinary = path.join(
    projectRoot,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'mastra.cmd' : 'mastra',
  );

  if (!existsSync(mastraBinary)) {
    return {
      ok: false,
      message:
        'Could not locate the Mastra CLI. Install dependencies first with "npm install" or "pnpm install".',
    };
  }

  const commandArgs = mode === 'dev' ? ['dev'] : ['start'];

  const spawnOptions = {
    cwd: projectRoot,
    env: { ...process.env, ...extraEnv },
    shell: process.platform === 'win32',
  };

  try {
    agentProcess = spawn(mastraBinary, commandArgs, spawnOptions);
  } catch (error) {
    return { ok: false, message: `Failed to launch Mastra: ${error.message}` };
  }

  currentMode = mode;
  sendStatus({ state: 'running', mode });

  const forward = (type, data) => {
    sendOutput({ type, data: data.toString(), timestamp: Date.now() });
  };

  agentProcess.stdout?.on('data', chunk => forward('stdout', chunk));
  agentProcess.stderr?.on('data', chunk => forward('stderr', chunk));

  agentProcess.on('exit', code => {
    sendOutput({ type: 'event', data: `Agent exited with code ${code ?? 'unknown'}`, timestamp: Date.now() });
    currentMode = null;
    sendStatus({ state: 'stopped' });
    agentProcess = null;
  });

  agentProcess.on('error', error => {
    sendOutput({ type: 'error', data: error.message, timestamp: Date.now() });
    currentMode = null;
    sendStatus({ state: 'stopped' });
    agentProcess = null;
  });

  return { ok: true };
};

const stopAgentProcess = () => {
  if (!agentProcess) {
    return { ok: false, message: 'The agent is not running.' };
  }

  sendStatus({ state: 'stopping', mode: currentMode });

  if (process.platform === 'win32') {
    agentProcess.kill();
  } else {
    agentProcess.kill('SIGINT');
    setTimeout(() => agentProcess?.kill('SIGKILL'), 4000);
  }

  return { ok: true };
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (agentProcess) {
    stopAgentProcess();
  }
});

ipcMain.handle('agent:start', async (_event, payload) => {
  const { mode, env } = payload ?? {};
  if (!mode || (mode !== 'dev' && mode !== 'start')) {
    return { ok: false, message: 'Invalid mode. Choose either "dev" or "start".' };
  }

  const result = startAgentProcess(mode, env ?? {});
  if (!result.ok) {
    sendStatus({ state: 'stopped' });
  }
  return result;
});

ipcMain.handle('agent:stop', async () => {
  const result = stopAgentProcess();
  if (!result.ok) {
    return result;
  }
  return { ok: true };
});

ipcMain.handle('agent:status', async () => {
  if (!agentProcess) {
    return { state: 'stopped' };
  }
  return { state: 'running', mode: currentMode };
});
